const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Resume = require('../models/Resume');
const Job = require('../models/Job');

/**
 * Apply for a job
 * Logic: User clicks apply -> find their latest resume -> create Match record
 */
router.post('/apply', async (req, res) => {
  try {
    const { userId, jobId } = req.body;

    if (!userId || !jobId) {
      return res.status(400).json({ error: 'userId and jobId are required' });
    }

    // 1. Find the latest resume for the user
    const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!latestResume) {
      return res.status(404).json({ error: 'No resume found. Please upload a resume before applying.' });
    }

    // 2. Check if already applied (already exists in Match)
    const existingMatch = await Match.findOne({ jobId, resumeId: latestResume._id });
    if (existingMatch) {
      return res.json({ status: 'ok', message: 'Already applied', match: existingMatch });
    }

    // 3. Create a Match record
    const match = new Match({
      jobId,
      resumeId: latestResume._id,
      matchScore: 0, // Initial score before AI analysis
      semanticScore: 0,
    });

    await match.save();

    res.json({ status: 'ok', message: 'Application submitted successfully', match });
  } catch (err) {
    console.error('Apply Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all applications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const resumes = await Resume.find({ userId });
    const resumeIds = resumes.map(r => r._id);
    
    const apps = await Match.find({ resumeId: { $in: resumeIds } })
      .populate('jobId')
      .sort({ createdAt: -1 });
      
    res.json({ status: 'ok', applications: apps });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
