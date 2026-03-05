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
    courseGroup:    { type: String, trim: true },   // "Mandatory" | "Elective"
    electiveGroup:  { type: String, default: null, trim: true },
    part:           { type: String, default: null, trim: true },
    questionNumber: { type: Number },
    examName:       { type: String, trim: true },
    version:        { type: String, trim: true },   // "Version A" | "Version B"
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

// ── GET /api/exam-qanda/bundles ───────────────────────────────────────────────
// Returns a list of all distinct bundles with question counts and exam name list
router.get('/bundles', protectAdmin, async (req, res) => {
  try {
    const bundles = await ExamQanda.aggregate([
      {
        $group: {
          _id: '$bundleId',
          courseType:    { $first: '$courseType' },
          totalQuestions: { $sum: 1 },
          examNames:     { $addToSet: '$examName' },
          versions:      { $addToSet: '$version' },
          courseGroups:  { $addToSet: '$courseGroup' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ bundles });
  } catch (err) {
    console.error('GET /exam-qanda/bundles error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/exam-qanda/bundles/:bundleId ─────────────────────────────────────
// Returns all questions for a bundle, grouped by examName + version (tabs)
router.get('/bundles/:bundleId', protectAdmin, async (req, res) => {
  try {
    const { bundleId } = req.params;

    const questions = await ExamQanda.find({ bundleId })
      .sort({ examName: 1, version: 1, questionNumber: 1 })
      .lean();

    if (!questions.length) {
      return res.status(404).json({ message: 'Bundle not found' });
    }

    // Group into tabs: key = "examName|||version"
    const tabMap = {};
    for (const q of questions) {
      const key = `${q.examName}|||${q.version}`;
      if (!tabMap[key]) {
        tabMap[key] = {
          examName:     q.examName,
          version:      q.version,
          courseGroup:  q.courseGroup,
          electiveGroup: q.electiveGroup,
          part:         q.part,
          questions:    [],
        };
      }
      tabMap[key].questions.push(q);
    }

    const tabs = Object.values(tabMap);

    res.json({
      bundleId,
      totalQuestions: questions.length,
      tabs,
    });
  } catch (err) {
    console.error('GET /exam-qanda/bundles/:bundleId error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;