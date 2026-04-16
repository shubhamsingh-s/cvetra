const express = require('express');
const Match = require('../models/Match');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const User = require('../models/User');
const router = express.Router();
const { Parser } = require('json2csv');

// Create a match record (optionally compute scores server-side)
router.post('/', async (req, res) => {
  try {
    const { resumeId, jobId, matchScore, skillMatch, semanticScore } = req.body;
    const m = new Match({ resumeId, jobId, matchScore, skillMatch, semanticScore });
    await m.save();
    res.json({ status: 'ok', match: m });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get ranking for a job (paginated)
router.get('/ranking', async (req, res) => {
  try {
    const { jobId, page = 1, limit = 50 } = req.query;
    const q = { jobId };
    const skips = (page - 1) * limit;
    const matches = await Match.find(q).sort({ matchScore: -1 }).skip(parseInt(skips)).limit(parseInt(limit)).lean();
    // populate resume info and user
    const enriched = await Promise.all(matches.map(async (m) => {
      const r = await Resume.findById(m.resumeId).lean();
      let user = null;
      try { user = r && r.userId ? await User.findById(r.userId).lean() : null; } catch (e) { user = null; }
      return { ...m, resume: r, user };
    }));
    res.json({ jobId, candidates: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shortlist / invite actions
router.post('/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'shortlist' or 'invite' or 'export'
    const m = await Match.findById(id);
    if (!m) return res.status(404).json({ error: 'Match not found' });
    if (action === 'shortlist') m.shortlist = true;
    if (action === 'invite') m.invited = true;
    await m.save();
    res.json({ status: 'ok', match: m });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Export matches for a job as CSV
router.get('/export', async (req, res) => {
  try {
    const { jobId, shortlisted } = req.query;
    const q = { jobId };
    if (shortlisted === 'true') q.shortlist = true;
    const matches = await Match.find(q).sort({ matchScore: -1 }).lean();
    const rows = [];
    for (const m of matches) {
      const r = await Resume.findById(m.resumeId).lean();
      let user = null;
      try { user = r && r.userId ? await User.findById(r.userId).lean() : null; } catch (e) { user = null; }
      rows.push({
        matchId: m._id.toString(),
        candidateName: user ? user.name : (r && r.originalFileUrl ? r.originalFileUrl : ''),
        candidateEmail: user ? user.email : '',
        matchScore: m.matchScore,
        atsScore: r ? r.atsScore : '',
        skills: r ? (Array.isArray(r.extractedSkills) ? r.extractedSkills.join('; ') : '') : '',
        semanticScore: m.semanticScore,
        shortlisted: m.shortlist,
        invited: m.invited,
        resumeTextSnippet: r ? (r.parsedText || '').slice(0, 200) : ''
      });
    }

    const fields = ['matchId','candidateName','candidateEmail','matchScore','atsScore','semanticScore','skills','shortlisted','invited','resumeTextSnippet'];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="candidates_${jobId}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
