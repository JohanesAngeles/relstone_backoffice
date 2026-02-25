const express = require('express');
const router = express.Router();
const State = require('../models/State');
const Course = require('../models/Course');
const Package = require('../models/Package');

// ── GET all states (for dropdown) ─────────────────────────────
// GET /api/insurance/states
router.get('/states', async (req, res) => {
  try {
    const states = await State.find({}, 'name slug').sort({ name: 1 });
    res.json({ success: true, data: states });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET single state info ──────────────────────────────────────
// GET /api/insurance/states/alabama
router.get('/states/:slug', async (req, res) => {
  try {
    const state = await State.findOne({ slug: req.params.slug });
    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }
    res.json({ success: true, data: state });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET all courses for a state ────────────────────────────────
// GET /api/insurance/courses/alabama
router.get('/courses/:slug', async (req, res) => {
  try {
    const courses = await Course.find({
      stateSlug: req.params.slug,
      isActive: true,
    }).sort({ sortOrder: 1 });

    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET all packages for a state ───────────────────────────────
// GET /api/insurance/packages/alabama
router.get('/packages/:slug', async (req, res) => {
  try {
    const packages = await Package.find({
      stateSlug: req.params.slug,
      isActive: true,
    }).sort({ sortOrder: 1 });

    res.json({ success: true, data: packages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET everything for a state in ONE call ─────────────────────
// GET /api/insurance/alabama/full
router.get('/:slug/full', async (req, res) => {
  try {
    const { slug } = req.params;

    const [state, courses, packages] = await Promise.all([
      State.findOne({ slug }),
      Course.find({ stateSlug: slug, isActive: true }).sort({ sortOrder: 1 }),
      Package.find({ stateSlug: slug, isActive: true }).sort({ sortOrder: 1 }),
    ]);

    if (!state) {
      return res.status(404).json({ success: false, message: 'State not found' });
    }

    res.json({
      success: true,
      data: { state, courses, packages },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;