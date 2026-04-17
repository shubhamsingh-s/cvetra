const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload resume - accepts file and optional parsedText or will call AI engine
router.post('/upload-resume', upload.single('file'), async (req, res) => {
  try {
    const { userId, parsedText, extractedSkills, experienceYears, originalFileUrl } = req.body;
    const resume = new Resume({
      userId,
      originalFileUrl: originalFileUrl || (req.file && req.file.path),
      parsedText: parsedText || '',
      extractedSkills: extractedSkills ? JSON.parse(extractedSkills) : [],
      experienceYears: experienceYears || 0,
    });
    await resume.save();
    return res.json({ status: 'ok', resume });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// Analyze resume using AI engine (if configured) and save results to resume
router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeId, jd_text } = req.body;
    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });

    const aiUrl = process.env.AI_ENGINE_URL;
    let analysis = null;
    if (aiUrl) {
      // call AI engine analyze_text endpoint
      const r = await fetch(`${aiUrl}/api/resume/analyze_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ resume_text: resume.parsedText || '', jd_text: jd_text || '' })
      });
      analysis = await r.json();
    }

    // store ATS score if present
    if (analysis && analysis.analysis && analysis.analysis.ats_score) {
      resume.atsScore = analysis.analysis.ats_score;
      resume.extractedSkills = resume.extractedSkills.length ? resume.extractedSkills : (analysis.analysis.extracted_skills || []);
      await resume.save();
    }

    return res.json({ status: 'ok', analysis });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Get latest resume for a user
router.get('/user/:userId/latest', async (req, res) => {
  try {
    const { userId } = req.params;
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    if (!resume) return res.status(404).json({ error: 'No resume found' });
    return res.json({ status: 'ok', resume });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
