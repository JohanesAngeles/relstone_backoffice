// routes/students.js
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { protectAdmin } = require('../middleware/adminAuth');

// ── Get adminDB connection ────────────────────────────────────
const { adminDB } = require('../config/db');

// ── Models ────────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  studentId:     { type: String, unique: true, index: true },
  name:          String,
  companyName:   String,
  mailingAddress:String,
  email:         String,
  dreNumber:     String,
  licenseNumber: String,
  cfpNumber:     String,
  npnNumber:     String,
  workPhone:     String,
  mobilePhone:   String,
  firstOrderDate:String,
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  studentId:    { type: String, index: true },
  studentName:  String,
  date:         String,
  orderNumber:  String,
  itemNumber:   String,
  description:  String,
  price:        String,
  discount:     String,
  total:        String,
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
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
}, { timestamps: true });

// Use existing models if already registered (avoid OverwriteModelError)
const Student = adminDB.models.Student || adminDB.model('Student', studentSchema);
const Order   = adminDB.models.Order   || adminDB.model('Order',   orderSchema);
const Course  = adminDB.models.Course  || adminDB.model('Course',  courseSchema);

// ── Helper: extract state from mailingAddress ─────────────────
const extractState = (address = '') => {
  // Matches 2-letter state code before ZIP: ", CA 90210" or ", TX"
  const match = address.match(/,\s*([A-Z]{2})\s*\d{0,5}\s*$/);
  return match ? match[1] : '';
};

// ── GET /api/students ─────────────────────────────────────────
// Query params: page, limit, search, state
router.get('/', protectAdmin, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 25);
    const search = (req.query.search || '').trim();
    const state  = (req.query.state  || '').trim().toUpperCase();
    const skip   = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [
        { name:          re },
        { email:         re },
        { studentId:     re },
        { dreNumber:     re },
        { licenseNumber: re },
        { workPhone:     re },
        { mobilePhone:   re },
      ];
    }
    if (state) {
      query.mailingAddress = new RegExp(`,\\s*${state}\\s*(\\d{0,5})\\s*$`, 'i');
    }

    const [students, total] = await Promise.all([
      Student.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Student.countDocuments(query),
    ]);

    // Get course counts for this page of students
    const ids = students.map(s => s.studentId);
    const courseCounts = await Course.aggregate([
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
    console.error('GET /students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/students/states ──────────────────────────────────
// Returns distinct state list for filter dropdown
router.get('/states', protectAdmin, async (req, res) => {
  try {
    const addresses = await Student.distinct('mailingAddress');
    const states = [...new Set(
      addresses
        .map(a => extractState(a || ''))
        .filter(Boolean)
    )].sort();
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/students/export ──────────────────────────────────
// Returns CSV of all students matching current filters
router.get('/export', protectAdmin, async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const state  = (req.query.state  || '').trim().toUpperCase();

    const query = {};
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [
        { name: re }, { email: re }, { studentId: re },
        { dreNumber: re }, { licenseNumber: re },
      ];
    }
    if (state) {
      query.mailingAddress = new RegExp(`,\\s*${state}\\s*(\\d{0,5})\\s*$`, 'i');
    }

    const students = await Student.find(query).sort({ name: 1 }).lean();

    // Build CSV
    const headers = ['Student ID', 'Name', 'Email', 'Work Phone', 'Mobile Phone', 'DRE Number', 'License Number', 'Mailing Address', 'First Order Date'];
    const escape  = v => `"${(v || '').replace(/"/g, '""')}"`;
    const rows    = students.map(s => [
      s.studentId, s.name, s.email, s.workPhone, s.mobilePhone,
      s.dreNumber, s.licenseNumber, s.mailingAddress, s.firstOrderDate,
    ].map(escape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students_export.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/students/:id ─────────────────────────────────────
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id }).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const [orders, courses] = await Promise.all([
      Order.find({ studentId: req.params.id }).sort({ date: -1 }).lean(),
      Course.find({ studentId: req.params.id }).sort({ registrationDate: -1 }).lean(),
    ]);

    res.json({
      ...student,
      state:   extractState(student.mailingAddress),
      orders,
      courses,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/students/:id/add-exam
router.post('/:id/add-exam', async (req, res) => {
  try {
    const { examMasterID, courseTitle } = req.body;

    if (!examMasterID || !courseTitle) {
      return res.status(400).json({ message: 'examMasterID and courseTitle are required' });
    }

    // Find student by studentId field (not _id)
    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Build the new course entry (matches your existing courses array shape)
    const newCourse = {
      examMasterID,
      courseTitle,
      examTitle:        '',
      registrationDate: new Date().toLocaleDateString('en-US'), // MM/DD/YYYY
      expirationDate:   '',
      completionDate:   '',
      completionPercent: '',
      status:           'In Progress',
    };

    // Push to student's courses array and save
    student.courses = student.courses || [];
    student.courses.push(newCourse);
    await student.save();

    res.json({
      message: 'Exam added successfully',
      course:  newCourse,
    });
  } catch (err) {
    console.error('add-exam error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;