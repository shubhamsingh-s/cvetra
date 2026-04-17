const express = require('express');
const Job = require('../models/Job');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.json({ status: 'ok', job });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    // Also cleanup related matches (optional, but good practice)
    const Match = require('../models/Match');
    await Match.deleteMany({ jobId: req.params.id });

    res.json({ status: 'ok', deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
