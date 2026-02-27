const mongoose = require('mongoose');
const { adminDB } = require('../config/db');

const ExamCourseSchema = new mongoose.Schema({
  rowNum        : { type: String },
  examMasterID  : { type: String, index: true },
  relstoneItem  : { type: String },
  courseTitle   : { type: String },
  masterCertUrl : { type: String },
  qaUrl         : { type: String },
}, { timestamps: true });

module.exports = adminDB.model('ExamCourse', ExamCourseSchema, 'examcourses');