const mongoose = require('mongoose');
const { adminDB } = require('../config/db');

const ExamQandaSchema = new mongoose.Schema(
  {
    courseType:     { type: String, enum: ['CE', 'RE', 'PreLicense'], required: true, index: true },
    bundleId:       { type: String, index: true },
    questionNumber: { type: Number },
    examName:       { type: String, index: true },
    version:        { type: String },   // "Version A" | "Version B"
    question:       { type: String },
    options: {
      A: { type: String, default: '' },
      B: { type: String, default: '' },
      C: { type: String, default: '' },
      D: { type: String, default: '' },
    },
    correctAnswer:  { type: String },
    pageReference:  { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = adminDB.model('ExamQanda', ExamQandaSchema, 'examqanda');