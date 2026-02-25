const mongoose = require('mongoose');
const { webDB } = require('../config/db');

const PackageSchema = new mongoose.Schema({
  stateSlug: { type: String, required: true, index: true },
  name: { type: String, required: true },
  coursesIncluded: [{ type: String }],
  totalHours: { type: Number },
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = webDB.model('Package', PackageSchema);