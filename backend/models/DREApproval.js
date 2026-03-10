const mongoose = require('mongoose');
const { adminDB } = require('../config/db');

const DREApprovalSchema = new mongoose.Schema({
  courseKey:   { type: String, required: true, index: true }, // e.g. 'AGENCY', 'FAIR_HOUSING'
  courseTitle: { type: String, required: true },              // e.g. 'Agency'
  dreNumber:   { type: String, required: true },              // e.g. '1035-1144'
  begDate:     { type: Date,   required: true },
  endDate:     { type: Date,   required: true },
}, { timestamps: true });

// Compound index for fast date-range lookups
DREApprovalSchema.index({ courseKey: 1, begDate: 1, endDate: 1 });

module.exports = adminDB.models.DREApproval || adminDB.model('DREApproval', DREApprovalSchema);