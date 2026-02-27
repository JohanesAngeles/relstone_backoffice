const mongoose = require('mongoose');
const { adminDB } = require('../config/db');

const ExamQASchema = new mongoose.Schema({
  examMasterID  : { type: String, index: true },
  examSubTestID : { type: String, index: true },
  courseTitle   : { type: String },
  courseDesc    : { type: String },
  examDesc      : { type: String },
  qaUrl         : { type: String },
  questionNum   : { type: String },
  question      : { type: String },
  optionA       : { type: String },
  optionB       : { type: String },
  optionC       : { type: String },
  optionD       : { type: String },
  optionE       : { type: String },
  correctAnswer : { type: String },
  explanation   : { type: String },
}, { timestamps: true });

module.exports = adminDB.model('ExamQA', ExamQASchema, 'examqanda');