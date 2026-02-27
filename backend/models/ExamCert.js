const mongoose = require('mongoose');
const { adminDB } = require('../config/db');

const ExamCertSchema = new mongoose.Schema({
  examMasterID    : { type: String, index: true },
  examSubTestID   : { type: String, index: true },
  refNo           : { type: String },
  ceHours         : { type: String },
  dreCertNum      : { type: String },
  courseTitle     : { type: String },
  stateCertNum    : { type: String },
  certDate        : { type: String },
  certDateLookup  : { type: String },
  state           : { type: String, index: true },
  creditHrDetails : { type: String },
}, { timestamps: true });

module.exports = adminDB.model('ExamCert', ExamCertSchema, 'examcerttracking');