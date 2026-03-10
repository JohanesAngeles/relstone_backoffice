// models/CourseContent.js
// Stores the reading material + quiz questions per section for each CE course
// Uses adminDB — same DB as ExamQanda, Course, ExamSession

const mongoose = require('mongoose');
const { adminDB } = require('../config/db');

const QuizQuestionSchema = new mongoose.Schema({
  question:      { type: String, required: true },
  correctAnswer: { type: Boolean, required: true }, // true = True, false = False
  pageRef:       { type: String, default: '' },     // e.g. "Page 2, Paragraph 3"
});

const SectionSchema = new mongoose.Schema({
  sectionNumber: { type: Number, required: true }, // 1, 2, 3
  title:         { type: String, default: '' },    // "Section 1"
  pageRange:     { type: String, default: '' },    // "Pages 1-17"
  content:       { type: String, default: '' },    // Rich HTML text (from admin editor)
  quiz:          [QuizQuestionSchema],
});

const CourseContentSchema = new mongoose.Schema({
  // Must match examName in ExamQanda + Course.examNames[]
  // e.g. "Agency", "Ethics", "Real Estate Management and Supervision"
  examName:    { type: String, required: true, unique: true, index: true },

  // Display name (can differ slightly from examName)
  courseName:  { type: String, required: true },

  // Unlock hours from enrolledAt before exam is accessible
  // 48 = 2 days, 96 = 4 days, 144 = 6 days
  unlockHours: { type: Number, default: 48 },

  // The 3 sections (or more for larger courses like Mortgage Lending)
  sections:    [SectionSchema],

}, { timestamps: true });

module.exports = adminDB.models.CourseContent ||
  adminDB.model('CourseContent', CourseContentSchema, 'coursecontent');