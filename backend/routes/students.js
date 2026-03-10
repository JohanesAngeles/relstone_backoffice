// routes/students.js
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { protectAdmin } = require('../middleware/adminAuth');
const { sendAffidavitEmail, sendPasswordLinkEmail } = require('../utils/emailService');

// ── Get adminDB connection ────────────────────────────────────
const { adminDB } = require('../config/db');

// ── Models ────────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  // ── Core identity ──
  studentId:      { type: String, unique: true, index: true },
  name:           String,
  companyName:    String,
  mailingAddress: String,
  email:          String,

  // ── Phone ──
  workPhone:      String,
  mobilePhone:    String,
  homePhone:      String,       // ← NEW

  // ── License & ID ──
  dreNumber:      String,
  licenseNumber:  String,
  cfpNumber:      String,
  npnNumber:      String,
  nmlsId:         String,       // ← NEW
  lastWebsite:    String,       // ← NEW
  password:       String,       // ← NEW (admin-visible legacy password field)
  ssNumber:       String,       // ← NEW (SS #)

  // ── Access / Record ──
  recordType:     { type: String, default: 'R' },   // ← NEW
  accessDenied:   { type: String, default: 'N' },   // ← NEW  N=Allowed, Y=Denied
  cpaState:       String,                           // ← NEW
  insCertState:   String,                           // ← NEW

  // ── Flags ──
  txEthicsCust:   { type: String, default: 'N' },   // ← NEW  Y or N
  cfpCust:        { type: String, default: 'N' },   // ← NEW
  dmvCust:        { type: String, default: 'N' },   // ← NEW
  dmvExpDate:     String,                           // ← NEW
  orgRecordSource:String,                           // ← NEW  e.g. "RELS", "PC"

  // ── Notes ──
  mainNotes:      { type: String, default: '' },    // ← NEW  free-text notes
  teleNotes:      { type: String, default: '' },    // ← NEW  telemarketing notes text
  assignedRep:    { type: String, default: '' },    // ← NEW
  callbackDate:   { type: String, default: '' },    // ← NEW
  okayToCall:     { type: String, default: 'Yes' }, // ← NEW  Yes / No

  // ── Misc ──
  firstOrderDate: String,
  emailOptOut:    { type: String, default: 'No' },  // ← NEW  Yes / No

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
  // ── Core identifiers ──
  studentId:        { type: String, index: true },
  studentName:      String,

  // ── Bundle info (from examqanda) ──
  examMasterID:     String,   // = bundleId  e.g. "CE-15HR"
  bundleId:         String,   // same as examMasterID
  courseTitle:      String,   // first examName or bundle label
  courseType:       String,   // "CE" | "RE" | "PreLicense"
  versions:         [String], // ["Version A", "Version B"]
  examNames:        [String], // all exam names inside the bundle
  totalQuestions:   Number,   // total Q count

  // ── Dates ──
  registrationDate: String,
  expirationDate:   String,
  completionDate:   String,
  earliestTestDate: String,

  // ── Progress / Status ──
  status:           { type: String, default: 'In Progress' },
  quizStatus:       String,
  progress:         { type: Number, default: 0 },
  examScore:        { type: Number, default: null },
  examPassed:       { type: Boolean, default: null },

  // ── Per-exam results ──
  examResults:      { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  chosenElective:   { type: String, default: null },

  // ── Legacy field (kept for backward compat) ──
  examTitle:        String,
}, { timestamps: true });

// Use existing models if already registered (avoid OverwriteModelError)
const Student = adminDB.models.Student || adminDB.model('Student', studentSchema);
const Order   = adminDB.models.Order   || adminDB.model('Order',   orderSchema);
const Course  = adminDB.models.Course  || adminDB.model('Course',  courseSchema);

// ── Helper: extract state from mailingAddress ─────────────────
const extractState = (address = '') => {
  const match = address.match(/,\s*([A-Z]{2})\s*\d{0,5}\s*$/);
  return match ? match[1] : '';
};

// ── GET /api/students ─────────────────────────────────────────
router.get('/', protectAdmin, async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 25);
    const search = (req.query.search || '').trim();
    const state  = (req.query.state  || '').trim().toUpperCase();
    const skip   = (page - 1) * limit;

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

    res.json({ students: data, total, page, pages: Math.ceil(total / limit), limit });
  } catch (err) {
    console.error('GET /students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/students/states ──────────────────────────────────
router.get('/states', protectAdmin, async (req, res) => {
  try {
    const addresses = await Student.distinct('mailingAddress');
    const states = [...new Set(
      addresses.map(a => extractState(a || '')).filter(Boolean)
    )].sort();
    res.json(states);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/students/export ──────────────────────────────────
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

    const headers = ['Student ID','Name','Email','Work Phone','Mobile Phone','DRE Number','License Number','Mailing Address','First Order Date'];
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
      state: extractState(student.mailingAddress),
      orders,
      courses,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/students/:id ───────────────────────────────────
// General-purpose update — used for contact edits, notes, flags, etc.
// Only updates fields that are explicitly sent in the request body.
const ALLOWED_UPDATE_FIELDS = [
  // Contact
  'name', 'email', 'companyName', 'mailingAddress',
  'workPhone', 'mobilePhone', 'homePhone',
  // License & ID
  'dreNumber', 'licenseNumber', 'cfpNumber', 'npnNumber',
  'nmlsId', 'lastWebsite', 'password', 'ssNumber',
  // Access / Record
  'recordType', 'accessDenied', 'cpaState', 'insCertState',
  // Flags
  'txEthicsCust', 'cfpCust', 'dmvCust', 'dmvExpDate', 'orgRecordSource',
  // Notes
  'mainNotes', 'teleNotes', 'assignedRep', 'callbackDate', 'okayToCall',
  // Misc
  'emailOptOut',
];

router.patch('/:id', protectAdmin, async (req, res) => {
  try {
    // Build a safe update object — only pick allowed fields
    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const student = await Student.findOneAndUpdate(
      { studentId: req.params.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json({ message: 'Student updated', student });
  } catch (err) {
    console.error('PATCH /students/:id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/students/:id/add-exam ───────────────────────────
router.post('/:id/add-exam', protectAdmin, async (req, res) => {
  try {
    const {
      examMasterID,   // bundleId  e.g. "CE-15HR"
      courseTitle,    // first examName or bundleId label
      bundleId,       // same as examMasterID
      courseType,     // "CE" | "RE" | "PreLicense"
      versions,       // ["Version A", "Version B"]
      examNames,      // ["Ethics...", "Trust Funds..."]
      totalQuestions, // number
    } = req.body;

    if (!examMasterID || !courseTitle) {
      return res.status(400).json({ message: 'examMasterID and courseTitle are required' });
    }

    const student = await Student.findOne({ studentId: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // ── Save to the relstone-admin > courses collection ───────
    // This is the collection MyCourses reads from
    const existingCourse = await Course.findOne({
      studentId:    req.params.id,
      examMasterID: examMasterID,
    });

    if (existingCourse) {
      return res.status(409).json({
        message: `Bundle "${examMasterID}" is already assigned to this student.`,
      });
    }

    const newCourse = await Course.create({
      studentId:         req.params.id,
      studentName:       student.name,
      examMasterID:      examMasterID,      // bundleId
      bundleId:          bundleId || examMasterID,
      courseTitle:       courseTitle,
      courseType:        courseType || '',
      versions:          versions   || [],
      examNames:         examNames  || [],
      totalQuestions:    totalQuestions || 0,
      registrationDate:  new Date().toLocaleDateString('en-US'),
      expirationDate:    '',
      completionDate:    '',
      status:            'In Progress',
      quizStatus:        '',
      progress:          0,                  // 0–100
      examScore:         null,
      examPassed:        null,
    });

    res.json({
      message: `Bundle "${examMasterID}" added to student record successfully.`,
      course:  newCourse,
    });

  } catch (err) {
    console.error('add-exam error:', err);
    res.status(500).json({ message: err.message });
  }
});


router.post('/:id/email-affidavit', protectAdmin, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id }).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.email) {
      return res.status(400).json({ message: 'Student has no email address on file' });
    }

    // Extract first name from full name (e.g. "Ukap, Victor George" → "Victor")
    // Handles both "Last, First Middle" and "First Last" formats
    const nameParts  = student.name || '';
    const firstName  = nameParts.includes(',')
      ? nameParts.split(',')[1].trim().split(' ')[0]   // "Ukap, Victor George" → "Victor"
      : nameParts.trim().split(' ')[0];                // "Victor George" → "Victor"

    await sendAffidavitEmail({
      email:     student.email,
      firstName,
      password:  student.password || '(no password on file)',
    });

    // Return the confirmation data the frontend needs to display
    res.json({
      ok:        true,
      firstName,
      email:     student.email,
      password:  student.password || '(no password on file)',
    });

  } catch (err) {
    console.error('email-affidavit error:', err);
    res.status(500).json({ message: 'Failed to send email. Please try again.' });
  }
});

router.post('/:id/email-password-link', protectAdmin, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.id }).lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.email) {
      return res.status(400).json({ message: 'Student has no email address on file' });
    }
    if (!student.password) {
      return res.status(400).json({ message: 'Student has no password on file' });
    }

    // Extract first name — handles "Last, First Middle" and "First Last" formats
    const nameParts = student.name || '';
    const firstName = nameParts.includes(',')
      ? nameParts.split(',')[1].trim().split(' ')[0]
      : nameParts.trim().split(' ')[0];

    await sendPasswordLinkEmail({
      email:     student.email,
      firstName,
      password:  student.password,
    });

    res.json({
      ok:        true,
      firstName,
      email:     student.email,
    });

  } catch (err) {
    console.error('email-password-link error:', err);
    res.status(500).json({ message: 'Failed to send email. Please try again.' });
  }
});

module.exports = router;