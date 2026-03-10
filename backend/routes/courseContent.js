// routes/courseContent.js
// Admin: manage course sections + quiz questions
// Student: read section content, submit quiz answers, check exam unlock status
//
// Add to server.js:
//   app.use('/api/course-content', require('./routes/courseContent'));

const express          = require('express');
const router           = express.Router();
const mongoose         = require('mongoose');
const multer           = require('multer');
const PDFParser        = require('pdf2json');
const { adminDB }      = require('../config/db');
const { protectAdmin } = require('../middleware/adminAuth');
const { protect }      = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

// ── Models ────────────────────────────────────────────────────────────────────

const CourseContent = require('../models/CourseContent');

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

// ── Unlock hours map ──────────────────────────────────────────────────────────
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
//  ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

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
//  STUDENT ROUTES — MUST be BEFORE /:examName
// ─────────────────────────────────────────────────────────────────────────────

router.get('/student/:examName', protect, async (req, res) => {
  try {
    const { studentId, bundleId } = req.query;
    if (!studentId || !bundleId) {
      return res.status(400).json({ message: 'studentId and bundleId required' });
    }

    const course = await Course.findOne({ studentId, bundleId }).lean();
    if (!course) return res.status(403).json({ message: 'Not enrolled' });

    const content = await CourseContent.findOne({
      examName: { $regex: `^${req.params.examName}$`, $options: 'i' }
    }).lean();
    if (!content) return res.status(404).json({ message: 'Course content not found' });

    const quizProgress = course.quizProgress
      ? (course.quizProgress instanceof Map
          ? Object.fromEntries(course.quizProgress)
          : course.quizProgress)
      : {};

    const examProgress = quizProgress[req.params.examName] || {
      sectionsRead:     [],
      quizzesCompleted: [],
    };

    const examAvailableAt = course.examAvailableAt
      ? (course.examAvailableAt instanceof Map
          ? Object.fromEntries(course.examAvailableAt)
          : course.examAvailableAt)
      : {};

    const availableAt    = examAvailableAt[req.params.examName] || null;
    const examUnlocked   = availableAt ? new Date() >= new Date(availableAt) : false;
    const allQuizzesDone = examProgress.quizzesCompleted.length >= content.sections.length;

    const sectionsForStudent = content.sections.map(s => ({
      sectionNumber: s.sectionNumber,
      title:         s.title,
      pageRange:     s.pageRange,
      content:       s.content,
      quizQuestions: s.quiz.map(q => ({
        _id:      q._id,
        question: q.question,
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

router.post('/student/:examName/submit-quiz', protect, async (req, res) => {
  try {
    const { studentId, bundleId, sectionNumber, answers } = req.body;
    if (!studentId || !bundleId || !sectionNumber || !answers) {
      return res.status(400).json({ message: 'studentId, bundleId, sectionNumber, answers required' });
    }

    const course = await Course.findOne({ studentId, bundleId });
    if (!course) return res.status(403).json({ message: 'Not enrolled' });

    const content = await CourseContent.findOne({
      examName: { $regex: `^${req.params.examName}$`, $options: 'i' }
    }).lean();
    if (!content) return res.status(404).json({ message: 'Course content not found' });

    const section = content.sections.find(s => s.sectionNumber === parseInt(sectionNumber));
    if (!section) return res.status(404).json({ message: 'Section not found' });

    const results = section.quiz.map((q, idx) => {
      const studentAnswer = answers[idx];
      const isCorrect     = studentAnswer === q.correctAnswer;
      return {
        question:      q.question,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        pageRef:       isCorrect ? null : q.pageRef,
      };
    });

    const qp = course.quizProgress instanceof Map
      ? Object.fromEntries(course.quizProgress)
      : (course.quizProgress || {});

    const examKey = req.params.examName;
    if (!qp[examKey]) qp[examKey] = { sectionsRead: [], quizzesCompleted: [] };
    if (!qp[examKey].quizzesCompleted.includes(parseInt(sectionNumber))) {
      qp[examKey].quizzesCompleted.push(parseInt(sectionNumber));
    }

    const totalSections   = content.sections.length;
    const allDone         = qp[examKey].quizzesCompleted.length >= totalSections;

    const examAvailableAt = course.examAvailableAt instanceof Map
      ? Object.fromEntries(course.examAvailableAt)
      : (course.examAvailableAt || {});

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

// POST /api/course-content/extract-pdf
// Splits PDF by "Review for Section #N" markers — no AI needed
router.post('/extract-pdf', protectAdmin, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No PDF file uploaded' });

    // Extract raw text
    const pdfText = await new Promise((resolve, reject) => {
      const parser = new PDFParser(null, 1);
      parser.on('pdfParser_dataReady', () => resolve(parser.getRawTextContent()));
      parser.on('pdfParser_dataError', reject);
      parser.parseBuffer(req.file.buffer);
    });

    if (!pdfText || pdfText.trim().length < 100) {
      return res.status(400).json({
        message: 'Could not extract text from PDF. Make sure it is not a scanned image PDF.',
      });
    }

    const lines = pdfText.split('\n').map(l => l.trim()).filter(Boolean);
    const sections = [];

    // Find all "Review for Section #N" marker indexes
    const reviewIndexes = [];
    lines.forEach((line, i) => {
      if (/^\*{0,3}\s*review for section #\d/i.test(line)) {
        reviewIndexes.push(i);
      }
    });

    if (reviewIndexes.length >= 1) {
      // Each section = content up to the NEXT review marker
      // Section 1: lines[0] → lines[reviewIndex[1]-1]  (includes quiz of section 1 at reviewIndex[0])
      // Section 2: lines[reviewIndex[1]] → lines[reviewIndex[2]-1]
      // etc.
      const breakPoints = [0, ...reviewIndexes.slice(1), lines.length];

      for (let i = 0; i < breakPoints.length - 1; i++) {
        const chunk = lines.slice(breakPoints[i], breakPoints[i + 1]);

        // Find the review/quiz marker inside this chunk
        const quizStart = chunk.findIndex(l =>
          /^\*{0,3}\s*review for section #\d/i.test(l)
        );

        // Content = everything before the quiz marker (or all if no marker in this chunk)
        const contentLines = quizStart >= 0 ? chunk.slice(0, quizStart) : chunk;

        // Quiz questions = numbered lines after the marker
        const qBlock = quizStart >= 0 ? chunk.slice(quizStart + 1) : [];
        const quizQuestions = qBlock
          .filter(l => /^\d+\./.test(l))
          .map(q => ({
            question:      q.replace(/^\d+\.\s*/, '').trim(),
            correctAnswer: true,
            pageRef:       '',
          }));

        sections.push({
          title:         `Section ${i + 1}`,
          pageRange:     '',
          content:       `<p>${contentLines.join('</p><p>')}</p>`,
          quizQuestions,
        });
      }
    }

    // Fallback: equal 3-part split if no markers found
    if (sections.length === 0) {
      const third = Math.ceil(lines.length / 3);
      for (let i = 0; i < 3; i++) {
        const chunk = lines.slice(i * third, (i + 1) * third);
        sections.push({
          title:         `Section ${i + 1}`,
          pageRange:     '',
          content:       `<p>${chunk.join('</p><p>')}</p>`,
          quizQuestions: [],
        });
      }
    }

    res.json({ sections });

  } catch (err) {
    console.error('PDF extract error:', err);
    res.status(500).json({ message: err.message || 'Failed to process PDF' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN /:examName ROUTES — MUST be AFTER /student/* and /extract-pdf
// ─────────────────────────────────────────────────────────────────────────────

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

router.put('/:examName/sections/:sectionNumber', protectAdmin, async (req, res) => {
  try {
    const course = await CourseContent.findOne({
      examName: { $regex: `^${req.params.examName}$`, $options: 'i' }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const sectionNum = parseInt(req.params.sectionNumber);
    const idx        = course.sections.findIndex(s => s.sectionNumber === sectionNum);
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