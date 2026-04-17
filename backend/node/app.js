const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('winston');
require('dotenv').config();

const { connectWithRetry } = require('./config/db');

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const resumeRoutes = require('./routes/resumes');
const matchRoutes = require('./routes/matches');
const applicationRoutes = require('./routes/applications');

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/health', (req, res) => {
  const ok = require('mongoose').connection.readyState === 1;
  res.json({ status: 'ok', database: ok ? 'connected' : 'disconnected' });
});

const port = process.env.PORT || 5000;

connectWithRetry().then(() => {
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Backend (Node) running on port ${port}`);
  });
}).catch((err) => {
  logger.error('Failed to start server due to DB error: %s', err.message);
  process.exit(1);
});

module.exports = app;
