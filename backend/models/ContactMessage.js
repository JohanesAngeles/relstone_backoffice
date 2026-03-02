const mongoose = require('mongoose');
const { webDB } = require('../config/db');

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    message: { type: String, default: '', trim: true, maxlength: 5000 },
    status: { type: String, enum: ['new', 'in_progress', 'closed'], default: 'new' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = webDB.model('ContactMessage', ContactMessageSchema);