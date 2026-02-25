const mongoose = require('mongoose');
const { webDB } = require('../config/db');

const CourseSchema = new mongoose.Schema({
  stateSlug: { type: String, required: true, index: true },
  name: { type: String, required: true },
  shortName: { type: String },
  description: { type: String },
  price: { type: Number, required: true },
  creditHours: { type: Number },
  courseType: { type: String },
  hasPrintedTextbook: { type: Boolean, default: false },
  printedTextbookPrice: { type: Number },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = webDB.model('Course', CourseSchema);