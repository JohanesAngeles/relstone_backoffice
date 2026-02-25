// routes/dashboard.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protectAdmin } = require('../middleware/adminAuth');
const InfoRequest   = require('../models/InfoRequest');
const ActivityLog   = require('../models/ActivityLog');
const SystemService = require('../models/SystemService');

// ── All routes require valid admin token ─────────────────────
router.use(protectAdmin);

// ────────────────────────────────────────────────────────────
// GET /api/dashboard/stats
// Returns live counts for the 4 stat cards
// ────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [newRequests, scheduledFollowUps, closedRequests, studentFeedbacks] =
      await Promise.all([
        InfoRequest.countDocuments({ status: 'new' }),
        InfoRequest.countDocuments({ status: 'follow-up' }),
        InfoRequest.countDocuments({ status: 'closed' }),
        // Placeholder: replace with Feedback.countDocuments() when you build that model
        Promise.resolve(0),
      ]);

    res.json({ newRequests, scheduledFollowUps, closedRequests, studentFeedbacks });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/dashboard/activity
// Returns the 10 most recent activity log entries
// ────────────────────────────────────────────────────────────
router.get('/activity', async (req, res) => {
  try {
    const activity = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json(activity);
  } catch (err) {
    console.error('Activity error:', err);
    res.status(500).json({ message: 'Server error fetching activity.' });
  }
});

// ────────────────────────────────────────────────────────────
// GET /api/dashboard/system-status
// Pings each service URL, returns live status
// Admin override takes priority over ping result
// ────────────────────────────────────────────────────────────
router.get('/system-status', async (req, res) => {
  try {
    const services = await SystemService.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    // Ping all services in parallel
    const results = await Promise.all(
      services.map(async (service) => {
        // Admin override takes priority — skip ping
        if (service.overrideStatus) {
          return {
            ...service,
            status: service.overrideStatus,
            statusSource: 'override',
          };
        }

        // No URL to ping — return last known ping result
        if (!service.url) {
          return {
            ...service,
            status: service.pingStatus || 'unknown',
            statusSource: 'cached',
          };
        }

        // Ping the URL
        try {
          await axios.get(service.url, { timeout: 5000 });
          // Update DB in background
          SystemService.findByIdAndUpdate(service._id, {
            pingStatus: 'online',
            lastPingedAt: new Date(),
          }).catch(() => {});

          return { ...service, status: 'online', statusSource: 'ping' };
        } catch {
          SystemService.findByIdAndUpdate(service._id, {
            pingStatus: 'offline',
            lastPingedAt: new Date(),
          }).catch(() => {});

          return { ...service, status: 'offline', statusSource: 'ping' };
        }
      })
    );

    res.json(results);
  } catch (err) {
    console.error('System status error:', err);
    res.status(500).json({ message: 'Server error fetching system status.' });
  }
});

// ────────────────────────────────────────────────────────────
// PATCH /api/dashboard/system-status/:id/override
// Admin manually overrides a service status
// Body: { status: 'online' | 'offline' | 'maintenance' | null, note: '' }
// ────────────────────────────────────────────────────────────
router.patch('/system-status/:id/override', async (req, res) => {
  try {
    const { status, note } = req.body;

    const service = await SystemService.findByIdAndUpdate(
      req.params.id,
      {
        overrideStatus: status || null,
        overrideNote:   note || '',
        overrideSetAt:  status ? new Date() : null,
      },
      { new: true }
    );

    if (!service)
      return res.status(404).json({ message: 'Service not found.' });

    res.json({ message: 'Override updated.', service });
  } catch (err) {
    console.error('Override error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;