// routes/examSession.js
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { adminDB } = require('../config/db');
const { protectAdmin } = require('../middleware/adminAuth');
const { protect } = require('../middleware/auth');
const { generateCertificate } = require('./certificate');

// ── Models ────────────────────────────────────────────────────────────────────

// ExamQanda — questions bank
const examQandaSchema = new mongoose.Schema({
  courseType:     String,
  bundleId:       String,
  courseGroup:    String,
  electiveGroup:  String,
  part:           String,
  questionNumber: Number,
  examName:       String,
  version:        String,
  question:       String,
  options:        { A: String, B: String, C: String, D: String },
  correctAnswer:  String,
  pageReference:  String,
}, { strict: false });

const ExamQanda = adminDB.models.ExamQanda ||
  adminDB.model('ExamQanda', examQandaSchema, 'examqanda');

// ExamSession — tracks an active or completed exam attempt
const examSessionSchema = new mongoose.Schema({
  // ── Identity ──
  studentId:    { type: String, index: true, required: true },
  bundleId:     { type: String, required: true },
  examName:     { type: String, required: true },
  version:      { type: String, required: true },   // "Version A" | "Version B"
  attemptNumber:{ type: Number, default: 1 },        // 1, 2, 3...

  // ── Questions (shuffled order, stored so order doesn't change on resume) ──
  questionIds:  [{ type: mongoose.Schema.Types.ObjectId }], // shuffled question _ids

  // ── Student answers ──
  // { "questionId": "A" | "B" | "C" | "D" }
  answers:      { type: Map, of: String, default: {} },

  // ── Timer ──
  totalSeconds:     { type: Number, required: true }, // credit hours × 3600
  secondsRemaining: { type: Number, required: true },
  startedAt:        { type: Date, default: Date.now },
  lastSavedAt:      { type: Date, default: Date.now },

  // ── Integrity tracking ──
  leaveCount:   { type: Number, default: 0 },  // times student left the page
  leaveLog:     [{ leftAt: Date, returnedAt: Date }],

  // ── Status ──
  status: {
    type: String,
    enum: ['in-progress', 'submitted', 'timed-out'],
    default: 'in-progress',
  },

  // ── Result (filled on submit) ──
  score:        { type: Number, default: null },   // 0–100
  passed:       { type: Boolean, default: null },
  correctCount: { type: Number, default: null },
  totalCount:   { type: Number, default: null },
  submittedAt:  { type: Date, default: null },

}, { timestamps: true });

const ExamSession = adminDB.models.ExamSession ||
  adminDB.model('ExamSession', examSessionSchema, 'examsessions');

// Course — student's enrolled courses
const courseSchema = new mongoose.Schema({
  studentId:        String,
  bundleId:         String,
  examMasterID:     String,
  courseTitle:      String,
  courseType:       String,
  versions:         [String],
  examNames:        [String],
  totalQuestions:   Number,
  registrationDate: String,
  expirationDate:   String,
  completionDate:   String,
  status:           String,
  progress:         Number,
  examScore:        Number,
  examPassed:       Boolean,
  // Per-exam results map: { "Agency": { passed, score, version, attempts } }
  examResults:      { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  // Student's chosen elective: "Mortgage Lending" | "Selling Business Opportunities in California"
  chosenElective:   { type: String, default: null },
}, { strict: false });

const Course = adminDB.models.Course ||
  adminDB.model('Course', courseSchema);

const studentSchema = new mongoose.Schema({
  studentId:      { type: String, unique: true, index: true },
  name:           String,
  mailingAddress: String,
  email:          String,
  workPhone:      String,
  mobilePhone:    String,
  homePhone:      String,
  dreNumber:      String,
  licenseNumber:  String,
}, { strict: false });

const Student = adminDB.models.Student ||
  adminDB.model('Student', studentSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────

// Shuffle array (Fisher-Yates)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Credit hours per exam name — used to calculate timer
// Format: keywords (lowercase) → hours
const EXAM_HOURS = [
  { keywords: ['implicit bias'],                                    hours: 2 },
  { keywords: ['agency'],                                           hours: 3 },
  { keywords: ['ethics'],                                           hours: 3 },
  { keywords: ['fair housing'],                                     hours: 3 },
  { keywords: ['trust fund'],                                       hours: 3 },
  { keywords: ['risk management'],                                  hours: 3 },
  { keywords: ['management and supervision', 'management & supervision'], hours: 3 },
  { keywords: ['mortgage lending', 'part one', 'part 1'],          hours: 13 },
  { keywords: ['mortgage lending', 'part two', 'part 2'],          hours: 12 },
  { keywords: ['selling business', 'part one', 'part 1'],          hours: 13 },
  { keywords: ['selling business', 'part two', 'part 2'],          hours: 12 },
];

const getExamHours = (examName = '') => {
  const lower = examName.toLowerCase();
  for (const entry of EXAM_HOURS) {
    if (entry.keywords.every(kw => lower.includes(kw))) return entry.hours;
  }
  return 3; // default 3 hours
};

// Determine which version to use for next attempt
// Looks at past sessions for this student + exam
const getNextVersion = async (studentId, bundleId, examName) => {
  const lastSession = await ExamSession.findOne(
    { studentId, bundleId, examName },
    { version: 1, passed: 1 },
    { sort: { createdAt: -1 } }
  ).lean();

  if (!lastSession) return 'Version A'; // first attempt

  // If last attempt was passed — shouldn't be starting again, but default to A
  if (lastSession.passed) return 'Version A';

  // Alternate: A → B → A → B
  return lastSession.version === 'Version A' ? 'Version B' : 'Version A';
};

// Calculate bundle overall progress (0–100) based on individual exam results
const calcBundleProgress = (examResults = {}, examNames = [], chosenElective = null) => {
  if (!examNames.length) return 0;

  // Mandatory exams (non-elective)
  const MANDATORY = [
    'agency', 'ethics', 'fair housing', 'trust fund',
    'risk management', 'management and supervision', 'implicit bias',
  ];

  const isMandatory = (name) => MANDATORY.some(kw => name.toLowerCase().includes(kw));
  const isElective  = (name) => !isMandatory(name);

  const mandatoryExams = examNames.filter(isMandatory);
  const electiveExams  = chosenElective
    ? examNames.filter(n => isElective(n) && n.toLowerCase().includes(chosenElective.toLowerCase().slice(0, 8)))
    : [];

  const allRequired = [...mandatoryExams, ...electiveExams];
  if (!allRequired.length) return 0;

  const passedCount = allRequired.filter(name => {
    const result = examResults[name];
    return result?.passed === true;
  }).length;

  return Math.round((passedCount / allRequired.length) * 100);
};

// ── ROUTES ────────────────────────────────────────────────────────────────────

// ── GET /api/exam-session/start ───────────────────────────────────────────────
// Query: studentId, bundleId, examName
// Returns: session (with shuffled questions), resuming: true/false
router.get('/start', async (req, res) => {
  try {
    const { studentId, bundleId, examName } = req.query;
    if (!studentId || !bundleId || !examName) {
      return res.status(400).json({ message: 'studentId, bundleId, examName are required' });
    }

    // ── Check for existing in-progress session (resume) ───────
    const existing = await ExamSession.findOne({
      studentId, bundleId, examName,
      status: 'in-progress',
    }).lean();

    if (existing) {
      // Fetch the questions in the saved shuffled order
      const questions = await ExamQanda.find({
        _id: { $in: existing.questionIds },
      }).lean();

      // Re-sort to match saved shuffle order
      const idOrder = existing.questionIds.map(id => id.toString());
      const sorted  = idOrder
        .map(id => questions.find(q => q._id.toString() === id))
        .filter(Boolean);

      // Strip correct answers before sending to client
      const safeQuestions = sorted.map(({ correctAnswer, pageReference, ...q }) => q);

      return res.json({
        resuming:         true,
        sessionId:        existing._id,
        version:          existing.version,
        attemptNumber:    existing.attemptNumber,
        questions:        safeQuestions,
        answers:          existing.answers instanceof Map ? Object.fromEntries(existing.answers) : (existing.answers || {}),
        secondsRemaining: existing.secondsRemaining,
        totalSeconds:     existing.totalSeconds,
        leaveCount:       existing.leaveCount,
        examName,
        bundleId,
      });
    }

    // ── New session — fetch all questions for this exam + version ─
    const version    = await getNextVersion(studentId, bundleId, examName);
    const allQuestions = await ExamQanda.find({ bundleId, examName, version }).lean();

    if (!allQuestions.length) {
      return res.status(404).json({
        message: `No questions found for "${examName}" (${version}) in bundle "${bundleId}"`,
      });
    }

    // Shuffle questions
    const shuffled    = shuffle(allQuestions);
    const questionIds = shuffled.map(q => q._id);

    // Calculate timer from credit hours
    const hours        = getExamHours(examName);
    const totalSeconds = hours * 3600;

    // Count previous attempts
    const attemptCount = await ExamSession.countDocuments({ studentId, bundleId, examName });

    // Create session
    const session = await ExamSession.create({
      studentId,
      bundleId,
      examName,
      version,
      attemptNumber:    attemptCount + 1,
      questionIds,
      answers:          {},
      totalSeconds,
      secondsRemaining: totalSeconds,
      startedAt:        new Date(),
    });

    // Strip correct answers before sending to client
    const safeQuestions = shuffled.map(({ correctAnswer, pageReference, ...q }) => q);

    res.json({
      resuming:         false,
      sessionId:        session._id,
      version,
      attemptNumber:    session.attemptNumber,
      questions:        safeQuestions,
      answers:          {},
      secondsRemaining: totalSeconds,
      totalSeconds,
      leaveCount:       0,
      examName,
      bundleId,
    });

  } catch (err) {
    console.error('GET /exam-session/start error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/exam-session/save ───────────────────────────────────────────────
// Auto-save answers + time remaining every 30 seconds
router.post('/save', async (req, res) => {
  try {
    const { sessionId, answers, secondsRemaining } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    await ExamSession.findByIdAndUpdate(sessionId, {
      $set: {
        answers:          new Map(Object.entries(answers || {})),
        secondsRemaining: secondsRemaining ?? 0,
        lastSavedAt:      new Date(),
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /exam-session/save error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/exam-session/leave ──────────────────────────────────────────────
// Called when student leaves the page (beforeunload / visibilitychange)
router.post('/leave', async (req, res) => {
  try {
    const { sessionId, answers, secondsRemaining } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    await ExamSession.findByIdAndUpdate(sessionId, {
      $set: {
        answers:          new Map(Object.entries(answers || {})),
        secondsRemaining: secondsRemaining ?? 0,
        lastSavedAt:      new Date(),
      },
      $inc: { leaveCount: 1 },
      $push: { leaveLog: { leftAt: new Date() } },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /exam-session/leave error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/exam-session/return ─────────────────────────────────────────────
// Called when student returns to the page
router.post('/return', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    // Update the last leave log entry with returnedAt
    await ExamSession.findByIdAndUpdate(sessionId, {
      $set: { 'leaveLog.$[last].returnedAt': new Date() },
    }, {
      arrayFilters: [{ 'last.returnedAt': { $exists: false } }],
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /exam-session/return error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/exam-session/submit ─────────────────────────────────────────────
// Scores the exam, saves result, updates student course record
router.post('/submit', async (req, res) => {
  try {
    const { sessionId, answers, secondsRemaining } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    const session = await ExamSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status === 'submitted') {
      return res.status(400).json({ message: 'Exam already submitted' });
    }

    // ── Fetch correct answers ─────────────────────────────────
    const questions = await ExamQanda.find({
      _id: { $in: session.questionIds },
    }).lean();

    // ── Score ─────────────────────────────────────────────────
    const finalAnswers = answers || (session.answers ? Object.fromEntries(session.answers) : {});
    let correctCount = 0;

    const gradedQuestions = questions.map(q => {
      const studentAnswer  = finalAnswers[q._id.toString()] || null;
      const isCorrect      = studentAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        _id:            q._id,
        questionNumber: q.questionNumber,
        question:       q.question,
        options:        q.options,
        studentAnswer,
        correctAnswer:  q.correctAnswer,
        isCorrect,
        pageReference:  q.pageReference,
      };
    });

    const totalCount = questions.length;
    const score      = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const passed     = score >= 70;

    // ── Update session ────────────────────────────────────────
    session.answers          = new Map(Object.entries(finalAnswers));
    session.secondsRemaining = secondsRemaining ?? 0;
    session.status           = 'submitted';
    session.score            = score;
    session.passed           = passed;
    session.correctCount     = correctCount;
    session.totalCount       = totalCount;
    session.submittedAt      = new Date();
    await session.save();

    // ── Update student Course record ──────────────────────────
    const course = await Course.findOne({
      studentId: session.studentId,
      bundleId:  session.bundleId,
    });

    if (course) {
      const currentResults = course.examResults instanceof Map
        ? Object.fromEntries(course.examResults)
        : (course.examResults || {});

      currentResults[session.examName] = {
        passed,
        score,
        version:     session.version,
        attempts:    session.attemptNumber,
        submittedAt: new Date(),
      };

      const newProgress = calcBundleProgress(
        currentResults,
        course.examNames || [],
        course.chosenElective,
      );

      const updateFields = {
        examResults: currentResults,
        progress:    newProgress,
        status:      newProgress === 100 ? 'Complete' : 'In Progress',
      };
      if (newProgress === 100) {
        updateFields.completionDate = new Date().toLocaleDateString('en-US');
        updateFields.examPassed     = true;
      }

      await Course.findByIdAndUpdate(course._id, { $set: updateFields });

      // Auto-generate certificate when bundle hits 100%
      if (newProgress === 100) {
        const freshCourse = await Course.findById(course._id).lean();
        const student     = await Student.findOne({ studentId: session.studentId }).lean();
        if (student) {
          generateCertificate(freshCourse, student)
            .then(({ certNumber }) =>
              console.log(`🏆 Certificate generated: #${certNumber} for ${session.studentId}`)
            )
            .catch(err =>
              console.error('⚠️ Auto cert generation failed:', err.message)
            );
        }
      }

    } 

    res.json({
      ok:              true,
      score,
      passed,
      correctCount,
      totalCount,
      passingScore:    70,
      version:         session.version,
      attemptNumber:   session.attemptNumber,
      gradedQuestions, // full review with correct answers
    });

  } catch (err) {
    console.error('POST /exam-session/submit error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/exam-session/bundle/:studentId/:bundleId ─────────────────────────
// Returns bundle overview: each exam's status, score, attempts, leave count
router.get('/bundle/:studentId/:bundleId', async (req, res) => {
  try {
    const { studentId, bundleId } = req.params;

    // Get student's course record
    const course = await Course.findOne({ studentId, bundleId }).lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Get all sessions for this student + bundle
    const sessions = await ExamSession.find(
      { studentId, bundleId },
      { examName: 1, version: 1, score: 1, passed: 1, status: 1,
        attemptNumber: 1, leaveCount: 1, submittedAt: 1, createdAt: 1 }
    ).sort({ createdAt: -1 }).lean();

    // Build per-exam summary
    const examSummaryMap = {};
    for (const s of sessions) {
      if (!examSummaryMap[s.examName]) {
        // First (most recent) session for this exam
        examSummaryMap[s.examName] = {
          examName:      s.examName,
          latestVersion: s.version,
          latestScore:   s.score,
          passed:        s.passed,
          attempts:      s.attemptNumber,
          leaveCount:    s.leaveCount,
          lastActivity:  s.submittedAt || s.createdAt,
          status:        s.passed ? 'passed'
                       : s.status === 'in-progress' ? 'in-progress'
                       : 'failed',
          inProgressSession: s.status === 'in-progress' ? s._id : null,
        };
      }
    }

    res.json({
      bundleId,
      studentId,
      courseTitle:     course.courseTitle,
      courseType:      course.courseType,
      examNames:       course.examNames || [],
      chosenElective:  course.chosenElective || null,
      progress:        course.progress || 0,
      bundleStatus:    course.status,
      examSummary:     examSummaryMap,
    });

  } catch (err) {
    console.error('GET /exam-session/bundle error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/exam-session/choose-elective ────────────────────────────────────
// Student picks their elective: Mortgage Lending OR Business Opportunities
router.post('/choose-elective', async (req, res) => {
  try {
    const { studentId, bundleId, elective } = req.body;
    // elective = "Mortgage Lending" | "Selling Business Opportunities in California"

    const VALID = ['Mortgage Lending', 'Selling Business Opportunities in California'];
    if (!VALID.includes(elective)) {
      return res.status(400).json({ message: 'Invalid elective choice' });
    }

    const course = await Course.findOne({ studentId, bundleId });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.chosenElective && course.chosenElective !== elective) {
      return res.status(400).json({
        message: 'Elective already chosen and cannot be changed.',
        chosenElective: course.chosenElective,
      });
    }

    course.chosenElective = elective;
    await course.save();

    res.json({ ok: true, chosenElective: elective });
  } catch (err) {
    console.error('POST /exam-session/choose-elective error:', err);
    res.status(500).json({ message: err.message });
  }
});


// ── GET /api/exam-session/result/:sessionId ───────────────────────────────────
router.get('/result/:sessionId', async (req, res) => {
  try {
    const session = await ExamSession.findById(req.params.sessionId).lean();
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status !== 'submitted') return res.status(400).json({ message: 'Exam not yet submitted' });

    const questions = await ExamQanda.find({ _id: { $in: session.questionIds } }).lean();
    const idOrder   = session.questionIds.map(id => id.toString());
    const sorted    = idOrder.map(id => questions.find(q => q._id.toString() === id)).filter(Boolean);
    const finalAnswers = session.answers ? Object.fromEntries(session.answers) : {};

    const gradedQuestions = sorted.map(q => ({
      _id:            q._id,
      questionNumber: q.questionNumber,
      question:       q.question,
      options:        q.options,
      studentAnswer:  finalAnswers[q._id.toString()] || null,
      correctAnswer:  q.correctAnswer,
      isCorrect:      finalAnswers[q._id.toString()] === q.correctAnswer,
      pageReference:  q.pageReference,
    }));

    res.json({
      examName: session.examName,
      bundleId: session.bundleId,
      result: {
        score:           session.score,
        passed:          session.passed,
        correctCount:    session.correctCount,
        totalCount:      session.totalCount,
        version:         session.version,
        attemptNumber:   session.attemptNumber,
        gradedQuestions,
      },
    });
  } catch (err) {
    console.error('GET /exam-session/result error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
