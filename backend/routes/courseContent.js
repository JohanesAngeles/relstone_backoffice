// routes/courseContent.js
// Admin: manage course sections + quiz questions
// Student: read section content, submit quiz answers, check exam unlock status
//
// Add to server.js:
//   app.use('/api/course-content', require('./routes/courseContent'));

const express        = require('express');
const router         = express.Router();
const mongoose       = require('mongoose');
const { adminDB }    = require('../config/db');
const { protectAdmin } = require('../middleware/adminAuth');
const { protect }    = require('../middleware/auth');

// ── Models ────────────────────────────────────────────────────────────────────

const CourseContent = require('../models/CourseContent');

// Course model (same one used in examSession.js)
const courseSchema = new mongoose.Schema({
  studentId:        String,
  bundleId:         String,
  examNames:        [String],
  enrolledAt:       Date,
  quizProgress:     { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  examAvailableAt:  { type: Map, of: Date, default: {} },
}, { strict: false });

const Course = adminDB.models.Course ||
  adminDB.model('Course', courseSchema);

// ── Unlock hours map per examName ─────────────────────────────────────────────
const UNLOCK_HOURS = {
  'agency':                                              48,
  'ethics':                                              48,
  'fair housing':                                        48,
  'trust fund':                                          48,
  'risk management':                                     48,
  'management and supervision':                          48,
  'implicit bias':                                       48,
  'selling business opportunities in california part 1': 96,
  'mortgage lending part 1':                             96,
  'selling business opportunities in california part 2': 144,
  'mortgage lending part 2':                             144,
};

const getUnlockHours = (examName = '') => {
  const lower = examName.toLowerCase();
  for (const [key, hours] of Object.entries(UNLOCK_HOURS)) {
    if (lower.includes(key)) return hours;
  }
  return 48;
};

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN ROUTES (protectAdmin)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/course-content
// List all courses (no full content — just meta + section headers)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const courses = await CourseContent.find(
      {},
      'examName courseName unlockHours sections.sectionNumber sections.title sections.pageRange'
    ).lean();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/course-content
// Create a new course with empty sections
router.post('/', protectAdmin, async (req, res) => {
  try {
    const { examName, courseName, unlockHours, sections } = req.body;

    const existing = await CourseContent.findOne({
      examName: { $regex: `^${examName}$`, $options: 'i' }
    });
    if (existing) return res.status(400).json({ message: 'Course already exists' });

    const course = new CourseContent({
      examName,
      courseName,
      unlockHours: unlockHours || getUnlockHours(examName),
      sections: sections || [
        { sectionNumber: 1, title: 'Section 1', pageRange: '', content: '', quiz: [] },
        { sectionNumber: 2, title: 'Section 2', pageRange: '', content: '', quiz: [] },
        { sectionNumber: 3, title: 'Section 3', pageRange: '', content: '', quiz: [] },
      ],
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT ROUTES (protect)
//  *** MUST be defined BEFORE /:examName to avoid route conflict ***
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/course-content/student/:examName
// Returns section content for a student (checks enrollment)
router.get('/student/:examName', protect, async (req, res) => {
  try {
    const { studentId, bundleId } = req.query;
    if (!studentId || !bundleId) {
      return res.status(400).json({ message: 'studentId and bundleId required' });
    }

    // Verify student is enrolled
    const course = await Course.findOne({ studentId, bundleId }).lean();
    if (!course) return res.status(403).json({ message: 'Not enrolled' });

    const content = await CourseContent.findOne({
      examName: { $regex: `^${req.params.examName}$`, $options: 'i' }
    }).lean();
    if (!content) return res.status(404).json({ message: 'Course content not found' });

    // Get quiz progress for this exam
    const quizProgress = course.quizProgress
      ? (course.quizProgress instanceof Map
          ? Object.fromEntries(course.quizProgress)
          : course.quizProgress)
      : {};

    const examProgress = quizProgress[req.params.examName] || {
      sectionsRead:      [],
      quizzesCompleted:  [],
    };

    // Check exam availability
    const examAvailableAt = course.examAvailableAt
      ? (course.examAvailableAt instanceof Map
          ? Object.fromEntries(course.examAvailableAt)
          : course.examAvailableAt)
      : {};

    const availableAt    = examAvailableAt[req.params.examName] || null;
    const examUnlocked   = availableAt ? new Date() >= new Date(availableAt) : false;
    const allQuizzesDone = examProgress.quizzesCompleted.length >= content.sections.length;

    // Strip quiz correct answers from section data for student
    const sectionsForStudent = content.sections.map(s => ({
      sectionNumber: s.sectionNumber,
      title:         s.title,
      pageRange:     s.pageRange,
      content:       s.content,
      quizQuestions: s.quiz.map(q => ({
        _id:      q._id,
        question: q.question,
        // correctAnswer intentionally NOT exposed to student
      })),
      isRead:        examProgress.sectionsRead.includes(s.sectionNumber),
      quizCompleted: examProgress.quizzesCompleted.includes(s.sectionNumber),
    }));

    res.json({
      examName:      content.examName,
      courseName:    content.courseName,
      sections:      sectionsForStudent,
      examUnlocked,
      allQuizzesDone,
      availableAt,
      progress:      examProgress,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/course-content/student/:examName/mark-read
// Mark a section as read
router.post('/student/:examName/mark-read', protect, async (req, res) => {
  try {
    const { studentId, bundleId, sectionNumber } = req.body;
    if (!studentId || !bundleId || !sectionNumber) {
      return res.status(400).json({ message: 'studentId, bundleId, sectionNumber required' });
    }

    const course = await Course.findOne({ studentId, bundleId });
    if (!course) return res.status(403).json({ message: 'Not enrolled' });

    const qp = course.quizProgress instanceof Map
      ? Object.fromEntries(course.quizProgress)
      : (course.quizProgress || {});

    const examKey = req.params.examName;
    if (!qp[examKey]) qp[examKey] = { sectionsRead: [], quizzesCompleted: [] };
    if (!qp[examKey].sectionsRead.includes(sectionNumber)) {
      qp[examKey].sectionsRead.push(sectionNumber);
    }

    await Course.findByIdAndUpdate(course._id, { $set: { quizProgress: qp } });
    res.json({ ok: true, sectionsRead: qp[examKey].sectionsRead });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/course-content/student/:examName/submit-quiz
// Submit quiz answers for a section, get back results
router.post('/student/:examName/submit-quiz', protect, async (req, res) => {
  try {
    const { studentId, bundleId, sectionNumber, answers } = req.body;
    // answers: { [questionIndex]: true | false }
    if (!studentId || !bundleId || !sectionNumber || !answers) {
      return res.status(400).json({ message: 'studentId, bundleId, sectionNumber, answers required' });
    }

    const course = await Course.findOne({ studentId, bundleId });
    if (!course) return res.status(403).json({ message: 'Not enrolled' });

    // Get quiz for this section
    const content = await CourseContent.findOne({
      examName: { $regex: `^${req.params.examName}$`, $options: 'i' }
    }).lean();
    if (!content) return res.status(404).json({ message: 'Course content not found' });

    const section = content.sections.find(s => s.sectionNumber === parseInt(sectionNumber));
    if (!section) return res.status(404).json({ message: 'Section not found' });

    // Grade quiz (True/False)
    const results = section.quiz.map((q, idx) => {
      const studentAnswer = answers[idx]; // true | false
      const isCorrect     = studentAnswer === q.correctAnswer;
      return {
        question:      q.question,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        pageRef:       isCorrect ? null : q.pageRef, // show page ref only for wrong answers
      };
    });

    // Mark quiz as completed regardless of score (DRE: no minimum score for quizzes)
    const qp = course.quizProgress instanceof Map
      ? Object.fromEntries(course.quizProgress)
      : (course.quizProgress || {});

    const examKey = req.params.examName;
    if (!qp[examKey]) qp[examKey] = { sectionsRead: [], quizzesCompleted: [] };
    if (!qp[examKey].quizzesCompleted.includes(parseInt(sectionNumber))) {
      qp[examKey].quizzesCompleted.push(parseInt(sectionNumber));
    }

    // Check if all quizzes for this exam are now done + set examAvailableAt
    const totalSections = content.sections.length;
    const allDone       = qp[examKey].quizzesCompleted.length >= totalSections;

    const examAvailableAt = course.examAvailableAt instanceof Map
      ? Object.fromEntries(course.examAvailableAt)
      : (course.examAvailableAt || {});

    // Only set availableAt once (don't overwrite)
    if (allDone && !examAvailableAt[examKey]) {
      const enrolledAt  = course.enrolledAt || course.createdAt || new Date();
      const unlockHours = content.unlockHours || getUnlockHours(examKey);
      examAvailableAt[examKey] = new Date(
        new Date(enrolledAt).getTime() + unlockHours * 60 * 60 * 1000
      );
    }

    await Course.findByIdAndUpdate(course._id, {
      $set: { quizProgress: qp, examAvailableAt },
    });

    res.json({
      ok:              true,
      results,
      quizCompleted:   true,
      allQuizzesDone:  allDone,
      examAvailableAt: examAvailableAt[examKey] || null,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN /:examName ROUTES — MUST be AFTER all /student/* routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/course-content/:examName
// Full course detail with content + quiz (admin only)
router.get('/:examName', protectAdmin, async (req, res) => {
  try {
    const course = await CourseContent.findOne({
      examName: { $regex: `^${req.params.examName}$`, $options: 'i' }
    }).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/course-content/:examName/sections/:sectionNumber
// Update a section's content + quiz (admin only)
router.put('/:examName/sections/:sectionNumber', protectAdmin, async (req, res) => {
  try {
    const course = await CourseContent.findOne({
      examName: { $regex: `^${req.params.examName}$`, $options: 'i' }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionNum = parseInt(req.params.sectionNumber);
    const idx = course.sections.findIndex(s => s.sectionNumber === sectionNum);

    const { title, pageRange, content, quiz } = req.body;

    if (idx === -1) {
      course.sections.push({ sectionNumber: sectionNum, title, pageRange, content, quiz: quiz || [] });
    } else {
      if (title     !== undefined) course.sections[idx].title     = title;
      if (pageRange !== undefined) course.sections[idx].pageRange = pageRange;
      if (content   !== undefined) course.sections[idx].content   = content;
      if (quiz      !== undefined) course.sections[idx].quiz      = quiz;
    }

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/course-content/:examName (admin only)
router.delete('/:examName', protectAdmin, async (req, res) => {
  try {
    await CourseContent.findOneAndDelete({
      examName: { $regex: `^${req.params.examName}$`, $options: 'i' }
    });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;