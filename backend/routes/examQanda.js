// routes/examQanda.js
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { protectAdmin } = require('../middleware/adminAuth');
const { adminDB } = require('../config/db');

// ── Schema ────────────────────────────────────────────────────────────────────
const examQandaSchema = new mongoose.Schema(
  {
    courseType:     { type: String, trim: true },
    bundleId:       { type: String, trim: true },
    courseGroup:    { type: String, trim: true },
    electiveGroup:  { type: String, default: null, trim: true },
    part:           { type: String, default: null, trim: true },
    questionNumber: { type: Number },
    examName:       { type: String, trim: true },
    version:        { type: String, trim: true },
    question:       { type: String, trim: true },
    options: {
      A: { type: String, default: '' },
      B: { type: String, default: '' },
      C: { type: String, default: '' },
      D: { type: String, default: '' },
    },
    correctAnswer:  { type: String, trim: true },
    pageReference:  { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

const ExamQanda = adminDB.models.ExamQanda ||
  adminDB.model('ExamQanda', examQandaSchema, 'examqanda');

// ── Helper: extract state abbreviation from an examName string ────────────────
// Handles patterns like:
//   "Agent Ethics and Responsibilities - CA - Agent Ethics..."  → "CA"
//   "Agent Ethics and Responsibilities (CE9901) - FL - ..."     → "FL"
//   "Agent Ethics and Responsibilities - AK - ..."              → "AK"
//   "Ethics, Professional Conduct..."  (no state)               → null
const extractStateFromExamName = (examName = '') => {
  // Match " - XX - " or " - XX" at end where XX is 2 uppercase letters
  const match = examName.match(/\s-\s([A-Z]{2})(?:\s-|\s*$)/);
  return match ? match[1] : null;
};

// ── Helper: is this bundle state-specific? ────────────────────────────────────
// CE-15HR, CE-36HR, CE-45HR, CE-ETHICS → California RE courses, always show
// INS-*  → Insurance, state-filtered
// RE-*   → Real Estate, always show (California-specific)
const isBundleStateFiltered = (bundleId = '') => {
  const b = bundleId.toUpperCase();
  if (b.startsWith('INS-')) return true;
  // Add more state-filtered prefixes here as needed
  return false;
};

// ── GET /api/exam-qanda/bundles ───────────────────────────────────────────────
// Query params:
//   ?state=CA   — optional, filters state-based bundles to only show matching exams
//
// Returns a list of all bundles. For state-filtered bundles (INS-*):
//   - If ?state provided: only includes exam names matching that state
//   - If no ?state: includes ALL exam names (for admin use without a student context)
router.get('/bundles', protectAdmin, async (req, res) => {
  try {
    const studentState = (req.query.state || '').trim().toUpperCase(); // e.g. "CA"

    const rawBundles = await ExamQanda.aggregate([
      {
        $group: {
          _id:            '$bundleId',
          courseType:     { $first: '$courseType' },
          totalQuestions: { $sum: 1 },
          examNames:      { $addToSet: '$examName' },
          versions:       { $addToSet: '$version' },
          courseGroups:   { $addToSet: '$courseGroup' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const bundles = rawBundles
      .filter(b => b._id) // skip null bundleIds
      .map(bundle => {
        let examNames = bundle.examNames || [];

        if (isBundleStateFiltered(bundle._id)) {
          if (studentState) {
            // ── State-filtered bundle WITH a student state ────────
            // Only keep exam names that match this state OR have no state tag
            examNames = examNames.filter(name => {
              const state = extractStateFromExamName(name);
              return state === studentState; // strict match — only their state
            });
          }
          // If no studentState, keep all (admin browsing without context)
        }
        // For non-state-filtered bundles (CE-*, RE-*): keep all exam names as-is

        return {
          ...bundle,
          examNames: examNames.sort(),
          versions:  (bundle.versions || []).sort(),
          // Hide bundles where all exams were filtered out
          _hide: isBundleStateFiltered(bundle._id) && studentState && examNames.length === 0,
        };
      })
      .filter(b => !b._hide); // remove bundles with no matching exams

    res.json({ bundles });
  } catch (err) {
    console.error('GET /exam-qanda/bundles error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/exam-qanda/bundles/:bundleId ─────────────────────────────────────
router.get('/bundles/:bundleId', protectAdmin, async (req, res) => {
  try {
    const { bundleId } = req.params;

    const questions = await ExamQanda.find({ bundleId })
      .sort({ examName: 1, version: 1, questionNumber: 1 })
      .lean();

    if (!questions.length) {
      return res.status(404).json({ message: 'Bundle not found' });
    }

    const tabMap = {};
    for (const q of questions) {
      const key = `${q.examName}|||${q.version}`;
      if (!tabMap[key]) {
        tabMap[key] = {
          examName:      q.examName,
          version:       q.version,
          courseGroup:   q.courseGroup,
          electiveGroup: q.electiveGroup,
          part:          q.part,
          questions:     [],
        };
      }
      tabMap[key].questions.push(q);
    }

    res.json({
      bundleId,
      totalQuestions: questions.length,
      tabs: Object.values(tabMap),
    });
  } catch (err) {
    console.error('GET /exam-qanda/bundles/:bundleId error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;