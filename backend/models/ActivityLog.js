// models/ActivityLog.js
// Tracks all activity across the system: exams, certs, orders, admin actions
// Lives in adminDB — written to by backend whenever these events happen

const mongoose = require('mongoose');
const { adminDB } = require('../config/db');

const activityLogSchema = new mongoose.Schema(
  {
    // Type controls the color/badge shown in the dashboard
    type: {
      type: String,
      enum: ['exam', 'certificate', 'order', 'admin', 'info'],
      required: true,
    },

    // What to show in the activity feed
    title:       { type: String, required: true },
    description: { type: String, required: true },

    // Optional references to related records
    relatedId:   { type: String, default: null }, // e.g. order ID, exam ID
    relatedModel:{ type: String, default: null }, // e.g. 'Order', 'Exam'

    // Who triggered this (student email or admin name)
    actor:       { type: String, default: 'System' },
    actorType:   { type: String, enum: ['student', 'admin', 'system'], default: 'system' },
  },
  { timestamps: true } // createdAt = when the event happened
);

// Always return newest first
activityLogSchema.index({ createdAt: -1 });

module.exports = adminDB.model('ActivityLog', activityLogSchema);