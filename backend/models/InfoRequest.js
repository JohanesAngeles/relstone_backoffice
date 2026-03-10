// models/InfoRequest.js
// Stores contact form submissions from the website
// Lives in webDB so the website can write to it directly

const mongoose = require('mongoose');
const { webDB } = require('../config/db');

const infoRequestSchema = new mongoose.Schema(
  {
    // Who submitted
    firstName:   { type: String, required: true, trim: true },
    lastName:    { type: String, required: true, trim: true },
    email:       { type: String, required: true, trim: true, lowercase: true },
    phone:       { type: String, trim: true },

    // What they're asking about
    subject:     { type: String, required: true, trim: true },
    message:     { type: String, required: true, trim: true },
    stateSlug:   { type: String, trim: true }, // which state page they submitted from
    courseType:  { type: String, trim: true }, // 'real-estate', 'insurance', etc.

    // Admin workflow
    status: {
      type: String,
      enum: ['new', 'in-progress', 'follow-up', 'closed'],
      default: 'new',
    },
    assignedTo:  { type: String, default: null }, // admin name handling this
    adminNotes:  { type: String, default: '' },
    followUpDate: { type: Date, default: null },
    closedAt:    { type: Date, default: null },
  },
  { timestamps: true } // createdAt = when form was submitted
);

module.exports = webDB.model('InfoRequest', infoRequestSchema);