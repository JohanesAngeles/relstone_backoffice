// routes/cecStudents.js
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { protectAdmin } = require('../middleware/adminAuth');

// ── Get adminDB connection ────────────────────────────────────
const { adminDB } = require('../config/db');

// ── Schemas (mirror exactly what the CEC seeder created) ─────
const cecStudentSchema = new mongoose.Schema({
  studentId:      { type: String, index: true },
  name:           String,
  companyName:    String,
  mailingAddress: String,
  email:          String,
  dreNumber:      String,
  licenseNumber:  String,
  cfpNumber:      String,
  npnNumber:      String,
  workPhone:      String,
  mobilePhone:    String,
  firstOrderDate: String,
  sourceFile:     String,
}, { timestamps: true });

const cecOrderSchema = new mongoose.Schema({
  studentId:   { type: String, index: true },
  studentName: String,
  date:        String,
  orderNumber: String,
  itemNumber:  String,
  description: String,
  price:       String,
  discount:    String,
  total:       String,
  sourceFile:  String,
}, { timestamps: true });

const cecCourseSchema = new mongoose.Schema({
  studentId:        { type: String, index: true },
  studentName:      String,
  registrationDate: String,
  expirationDate:   String,
  courseTitle:      String,
  examTitle:        String,
  earliestTestDate: String,
  status:           String,
  quizStatus:       String,
  completionDate:   String,
  score:            String,
  affidavitDate:    String,
  cdiDreAffidavit:  String,
  sourceFile:       String,
}, { timestamps: true });

// Use existing models if already registered (avoid OverwriteModelError)
const CECStudent = adminDB.models.CECStudent || adminDB.model('CECStudent', cecStudentSchema, 'cecstudents');
const CECOrder   = adminDB.models.CECOrder   || adminDB.model('CECOrder',   cecOrderSchema,   'cecorders');
const CECCourse  = adminDB.models.CECCourse  || adminDB.model('CECCourse',  cecCourseSchema,  'ceccourses');

// ── Helper: extract 2-letter state from mailingAddress ────────
// e.g. "123 Main St, Los Angeles, CA 90001" → "CA"
const extractState = (address = '') => {
  const match = address.match(/,\s*([A-Z]{2})\s*\d{0,5}\s*$/);
  return match ? match[1] : '';
};

// ── Helper: build search query ────────────────────────────────
const buildQuery = (search, state) => {
  const query = {};

  if (search) {
    const re = new RegExp(search, 'i');
    query.$or = [
      { name:          re },
      { email:         re },
      { studentId:     re },
      { licenseNumber: re },
      { dreNumber:     re },
      { workPhone:     re },
      { mobilePhone:   re },
    ];
  }

  if (state) {
    query.mailingAddress = new RegExp(`,\\s*${state}\\s*(\\d{0,5})\\s*$`, 'i');
  }

  return query;
};

// ── GET /api/cec-students ─────────────────────────────────────
// Query params: page, limit, search, state
router.get('/', protectAdmin, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const search = (req.query.search || '').trim();
    const state  = (req.query.state  || '').trim().toUpperCase();
    const skip   = (page - 1) * limit;

    const query = buildQuery(search, state);

    const [students, total] = await Promise.all([
      CECStudent.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      CECStudent.countDocuments(query),
    ]);

    // Get course counts for this page of students
    const ids = students.map(s => s.studentId);
    const courseCounts = await CECCourse.aggregate([
      { $match: { studentId: { $in: ids } } },
      { $group: { _id: '$studentId', count: { $sum: 1 } } },
    ]);
    const courseMap = {};
    courseCounts.forEach(c => { courseMap[c._id] = c.count; });

    const data = students.map(s => ({
      ...s,
      state:       extractState(s.mailingAddress),
      courseCount: courseMap[s.studentId] || 0,
    }));

    res.json({
      students: data,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    });
  } catch (err) {
    console.error('GET /cec-students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/cec-students/states ──────────────────────────────
// Returns distinct state list for the filter dropdown
router.get('/states', protectAdmin, async (req, res) => {
  try {
    const addresses = await CECStudent.distinct('mailingAddress');
    const states = [...new Set(
      addresses
        .map(a => extractState(a || ''))
        .filter(Boolean)
    )].sort();
    res.json(states);
  } catch (err) {
    console.error('GET /cec-students/states error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/cec-students/export ──────────────────────────────
// Returns CSV of all students matching current filters
router.get('/export', protectAdmin, async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const state  = (req.query.state  || '').trim().toUpperCase();

    const query = buildQuery(search, state);

    const students = await CECStudent.find(query).sort({ name: 1 }).lean();

    const headers = [
      'Student ID', 'Name', 'Email',
      'Work Phone', 'Mobile Phone',
      'DRE Number', 'License Number',
      'CFP Number', 'NPN Number',
      'Mailing Address', 'State',
      'First Order Date',
    ];

    const escape = v => `"${(v || '').replace(/"/g, '""')}"`;

    const rows = students.map(s => [
      s.studentId,
      s.name,
      s.email,
      s.workPhone,
      s.mobilePhone,
      s.dreNumber,
      s.licenseNumber,
      s.cfpNumber,
      s.npnNumber,
      s.mailingAddress,
      extractState(s.mailingAddress),
      s.firstOrderDate,
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="cec_students_export.csv"');
    res.send(csv);
  } catch (err) {
    console.error('GET /cec-students/export error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/cec-students/:id ─────────────────────────────────
// Returns single student with their orders + courses
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const student = await CECStudent.findOne({ studentId: req.params.id }).lean();
    if (!student) return res.status(404).json({ message: 'CEC Student not found' });

    const [orders, courses] = await Promise.all([
      CECOrder.find({ studentId: req.params.id }).sort({ date: -1 }).lean(),
      CECCourse.find({ studentId: req.params.id }).sort({ registrationDate: -1 }).lean(),
    ]);

    res.json({
      ...student,
      state: extractState(student.mailingAddress),
      orders,
      courses,
    });
  } catch (err) {
    console.error('GET /cec-students/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;