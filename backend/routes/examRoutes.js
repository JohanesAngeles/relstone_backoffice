// routes/examRoutes.js
const express    = require('express');
const router     = express.Router();
const ExamCourse = require('../models/ExamCourse');
const ExamQA     = require('../models/ExamQA');
const ExamCert   = require('../models/ExamCert');
const ExamQanda  = require('../models/ExamQanda');

// ─────────────────────────────────────────────
//  EXAM COURSES  (fetches from recatalog)
// ─────────────────────────────────────────────

// GET /api/exams/courses
router.get('/courses', async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;

    const { adminDB } = require('../config/db');
    const mongoose    = require('mongoose');

    const reCatalogSchema = new mongoose.Schema({
      courseCode:     String,
      courseTitle:    String,
      type:           String,
      hours:          Number,
      designation:    String,
      refNumber:      String,
      stateCert:      String,
      certExpiry:     String,
      withinTenYears: String,
    }, { timestamps: true });

    const RECatalog = adminDB.models.RECatalog ||
      adminDB.model('RECatalog', reCatalogSchema, 'recatalog');

    const query = {};
    if (search) {
      query.$or = [
        { courseTitle: { $regex: search, $options: 'i' } },
        { courseCode:  { $regex: search, $options: 'i' } },
        { type:        { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [courses, total] = await Promise.all([
      RECatalog.find(query).skip(skip).limit(parseInt(limit)).lean(),
      RECatalog.countDocuments(query),
    ]);

    const mapped = courses.map(c => ({
      _id:            c._id,
      examMasterID:   c.courseCode,
      courseTitle:    c.courseTitle,
      type:           c.type,
      hours:          c.hours,
      designation:    c.designation,
      refNumber:      c.refNumber,
      stateCert:      c.stateCert,
      certExpiry:     c.certExpiry,
      withinTenYears: c.withinTenYears,
    }));

    res.json({ total, page: parseInt(page), limit: parseInt(limit), courses: mapped });
  } catch (err) {
    console.error('GET /exams/courses error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/courses/:examMasterID
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
//  Q&A  (legacy examqanda collection)
// ─────────────────────────────────────────────

// GET /api/exams/qa
router.get('/qa', async (req, res) => {
  try {
    const { examMasterID, examSubTestID, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (examMasterID)  query.examMasterID  = examMasterID;
    if (examSubTestID) query.examSubTestID = examSubTestID;
    if (search) {
      query.$or = [
        { question    : { $regex: search, $options: 'i' } },
        { courseTitle : { $regex: search, $options: 'i' } },
        { examDesc    : { $regex: search, $options: 'i' } },
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
router.get('/qa/:examMasterID', async (req, res) => {
  try {
    const { examSubTestID } = req.query;
    const query = { examMasterID: req.params.examMasterID };
    if (examSubTestID) query.examSubTestID = examSubTestID;
    const qa = await ExamQA.find(query).sort({ questionNum: 1 }).lean();
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
router.get('/certs/:examMasterID', async (req, res) => {
  try {
    const certs = await ExamCert.find({ examMasterID: req.params.examMasterID }).lean();
    res.json({ total: certs.length, certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
//  QANDA — CE / RE / PreLicense question bank
//  ⚠️  Route order matters: exact → static → param
// ─────────────────────────────────────────────

// GET /api/exams/qanda
router.get('/qanda', async (req, res) => {
  try {
    const { courseType, examName, version, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (courseType) query.courseType = courseType;
    if (examName)   query.examName   = { $regex: examName, $options: 'i' };
    if (version)    query.version    = version;
    if (search) {
      query.$or = [
        { question:    { $regex: search, $options: 'i' } },
        { examName:    { $regex: search, $options: 'i' } },
        { 'options.A': { $regex: search, $options: 'i' } },
        { 'options.B': { $regex: search, $options: 'i' } },
        { 'options.C': { $regex: search, $options: 'i' } },
        { 'options.D': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [questions, total] = await Promise.all([
      ExamQanda.find(query).sort({ examName: 1, version: 1, questionNumber: 1 }).skip(skip).limit(parseInt(limit)).lean(),
      ExamQanda.countDocuments(query),
    ]);

    res.json({ total, page: parseInt(page), limit: parseInt(limit), questions });
  } catch (err) {
    console.error('GET /exams/qanda error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/qanda/summary  ← static segment BEFORE /:examName param
router.get('/qanda/summary', async (req, res) => {
  try {
    const { courseType } = req.query;
    const matchStage = courseType ? { $match: { courseType } } : { $match: {} };

    const summary = await ExamQanda.aggregate([
      matchStage,
      {
        $group: {
          _id:        { courseType: '$courseType', examName: '$examName' },
          totalCount: { $sum: 1 },
          versions:   { $addToSet: '$version' },
        },
      },
      {
        $group: {
          _id:            '$_id.courseType',
          exams:          { $push: { examName: '$_id.examName', totalCount: '$totalCount', versions: '$versions' } },
          totalQuestions: { $sum: '$totalCount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ summary });
  } catch (err) {
    console.error('GET /exams/qanda/summary error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/exams/qanda/:examName  ← param route LAST
router.get('/qanda/:examName', async (req, res) => {
  try {
    const { version, courseType } = req.query;
    const query = { examName: { $regex: `^${req.params.examName}$`, $options: 'i' } };
    if (version)    query.version    = version;
    if (courseType) query.courseType = courseType;

    const questions = await ExamQanda
      .find(query)
      .sort({ version: 1, questionNumber: 1 })
      .lean();

    res.json({ total: questions.length, questions });
  } catch (err) {
    console.error('GET /exams/qanda/:examName error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
//  COMBINED
// ─────────────────────────────────────────────

// GET /api/exams/:examMasterID/full
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