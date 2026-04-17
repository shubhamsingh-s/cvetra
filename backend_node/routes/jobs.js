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
    const { id } = req.params;
    const Match = require('../models/Match');
    
    // Delete the job
    const job = await Job.findByIdAndDelete(id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Delete associated matches
    await Match.deleteMany({ jobId: id });

    res.json({ status: 'ok', message: 'Job and associated matches deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
