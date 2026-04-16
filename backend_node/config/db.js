const mongoose = require('mongoose');
const logger = require('winston');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cvetra';
const MAX_RETRIES = 5;

async function connectWithRetry(retries = MAX_RETRIES) {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected');
    await ensureIndexes();
  } catch (err) {
    logger.error('MongoDB connection error: %s', err.message);
    if (retries > 0) {
      const backoff = (MAX_RETRIES - retries + 1) * 1000;
      logger.info('Retrying MongoDB connection in %dms', backoff);
      await new Promise((res) => setTimeout(res, backoff));
      return connectWithRetry(retries - 1);
    }
    throw err;
  }
}

async function ensureIndexes() {
  try {
    const db = mongoose.connection;
    // Users: unique email
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    // Resumes: index by userId
    await db.collection('resumes').createIndex({ userId: 1 });
    // Jobs: index by recruiterId
    await db.collection('jobs').createIndex({ recruiterId: 1 });
    // Matches: index by jobId and resumeId
    await db.collection('matches').createIndex({ jobId: 1 });
    await db.collection('matches').createIndex({ resumeId: 1 });
    logger.info('Indexes ensured');
  } catch (err) {
    logger.warn('Index creation failed: %s', err.message);
  }
}

module.exports = { connectWithRetry };
