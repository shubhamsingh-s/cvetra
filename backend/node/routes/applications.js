const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Apply for a job - acts as a proxy to the Python AI Engine which handles the heavy embedding + scoring
router.post('/apply', async (req, res) => {
  try {
    const { userId, jobId } = req.body;
    if (!userId || !jobId) {
      return res.status(400).json({ detail: "Missing userId or jobId" });
    }

    const aiUrl = process.env.AI_ENGINE_URL || 'http://localhost:8001';
    
    // Proxy the exact payload to the Python engine's /api/applications/apply endpoint
    const r = await fetch(`${aiUrl}/api/applications/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, jobId })
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
        // Pass through the Python error detail
        return res.status(r.status).json({ detail: data?.detail || data?.error || 'Target AI engine rejected request' });
    }

    return res.json({ status: 'ok', match_id: data?.match_id, analysis: data?.analysis });

  } catch (err) {
    console.error("Application Proxy Error:", err);
    return res.status(500).json({ detail: err.message || "Failed to reach AI engine" });
  }
});

module.exports = router;
