// routes/examRoutes.js
const express    = require('express');
const router     = express.Router();
const ExamCourse = require('../models/ExamCourse');
const ExamQA     = require('../models/ExamQA');
const ExamCert   = require('../models/ExamCert');

// ─────────────────────────────────────────────
//  EXAM COURSES
// ─────────────────────────────────────────────

// GET /api/exams/courses
// Get all courses (with optional search)
router.get('/courses', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { courseTitle   : { $regex: search, $options: 'i' } },
        { examMasterID  : { $regex: search, $options: 'i' } },
      ];
    }
    const skip    = (parseInt(page) - 1) * parseInt(limit);
    const [courses, total] = await Promise.all([
      ExamCourse.find(query).skip(skip).limit(parseInt(limit)).lean(),
      ExamCourse.countDocuments(query),
    ]);
    res.json({ total, page: parseInt(page), limit: parseInt(limit), courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/courses/:examMasterID
// Get a single course by ExamMasterID
router.get('/courses/:examMasterID', async (req, res) => {
  try {
    const course = await ExamCourse.findOne({ examMasterID: req.params.examMasterID }).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
//  Q&A
// ─────────────────────────────────────────────

// GET /api/exams/qa
// Get Q&A with filters (examMasterID, examSubTestID, search)
router.get('/qa', async (req, res) => {
  try {
    const { examMasterID, examSubTestID, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (examMasterID)  query.examMasterID  = examMasterID;
    if (examSubTestID) query.examSubTestID = examSubTestID;
    if (search) {
      query.$or = [
        { question      : { $regex: search, $options: 'i' } },
        { courseTitle   : { $regex: search, $options: 'i' } },
        { examDesc      : { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [qa, total] = await Promise.all([
      ExamQA.find(query).skip(skip).limit(parseInt(limit)).lean(),
      ExamQA.countDocuments(query),
    ]);
    res.json({ total, page: parseInt(page), limit: parseInt(limit), qa });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/qa/:examMasterID
// Get all Q&A for a specific ExamMasterID (optionally filtered by examSubTestID)
router.get('/qa/:examMasterID', async (req, res) => {
  try {
    const { examSubTestID } = req.query;
    const query = { examMasterID: req.params.examMasterID };
    if (examSubTestID) query.examSubTestID = examSubTestID;
    const qa = await ExamQA.find(query).sort({ questionNum: 1 }).lean();
    // Sort numerically since questionNum is stored as string
    qa.sort((a, b) => parseInt(a.questionNum || 0) - parseInt(b.questionNum || 0));
    res.json({ total: qa.length, qa });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
//  CERT TRACKING
// ─────────────────────────────────────────────

// GET /api/exams/certs
// Get cert tracking with filters (examMasterID, state)
router.get('/certs', async (req, res) => {
  try {
    const { examMasterID, state, page = 1, limit = 50 } = req.query;
    const query = {};
    if (examMasterID) query.examMasterID = examMasterID;
    if (state)        query.state        = state.toUpperCase();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [certs, total] = await Promise.all([
      ExamCert.find(query).skip(skip).limit(parseInt(limit)).lean(),
      ExamCert.countDocuments(query),
    ]);
    res.json({ total, page: parseInt(page), limit: parseInt(limit), certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/certs/:examMasterID
// Get all certs for a specific ExamMasterID
router.get('/certs/:examMasterID', async (req, res) => {
  try {
    const certs = await ExamCert.find({ examMasterID: req.params.examMasterID }).lean();
    res.json({ total: certs.length, certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
//  COMBINED - Get everything for one ExamMasterID
// ─────────────────────────────────────────────

// GET /api/exams/:examMasterID/full
// Get course + all Q&A + all certs in one call
router.get('/:examMasterID/full', async (req, res) => {
  try {
    const { examMasterID } = req.params;
    const [course, qa, certs] = await Promise.all([
      ExamCourse.findOne({ examMasterID }).lean(),
      ExamQA.find({ examMasterID }).sort({ questionNum: 1 }).lean(),
      ExamCert.find({ examMasterID }).lean(),
    ]);
    res.json({ examMasterID, course, qa, certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;