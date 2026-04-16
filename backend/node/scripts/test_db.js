// Simple DB smoke test: create user, job, resume, match
const mongoose = require('mongoose');
require('dotenv').config();
const { connectWithRetry } = require('../config/db');
const User = require('../models/User');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const Match = require('../models/Match');

async function run() {
  try {
    await connectWithRetry();
    console.log('Connected');
    const u = new User({ name: 'Test User', email: `test+${Date.now()}@example.com`, password: 'hashed', role: 'recruiter' });
    await u.save();
    console.log('User created', u._id.toString());

    const j = new Job({ recruiterId: u._id, title: 'Test Job', description: 'Testing', requiredSkills: ['python'] });
    await j.save();
    console.log('Job created', j._id.toString());

    const r = new Resume({ userId: u._id, parsedText: 'Experienced developer', extractedSkills: ['python'], experienceYears: 3 });
    await r.save();
    console.log('Resume created', r._id.toString());

    const m = new Match({ resumeId: r._id, jobId: j._id, matchScore: 85, skillMatch: 0.8, semanticScore: 0.82 });
    await m.save();
    console.log('Match created', m._id.toString());

    console.log('Smoke test complete');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed', err);
    process.exit(1);
  }
}

run();
