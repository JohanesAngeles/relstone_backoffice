// models/SystemService.js
// Stores your system services — pinged automatically, admin can override status
// Lives in adminDB

const mongoose = require('mongoose');
const { adminDB } = require('../config/db');

const systemServiceSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },  // e.g. 'Examination Server'
    sub:      { type: String, default: '' },      // e.g. 'Main exam delivery'
    url:      { type: String, default: null },    // URL to ping for health check

    // Last ping result (set automatically by the ping job)
    pingStatus: {
      type: String,
      enum: ['online', 'offline', 'unknown'],
      default: 'unknown',
    },
    lastPingedAt: { type: Date, default: null },

    // Admin override — if set, this takes priority over pingStatus
    overrideStatus: {
      type: String,
      enum: ['online', 'offline', 'maintenance', null],
      default: null,
    },
    overrideNote:   { type: String, default: '' }, // e.g. 'Network migration in progress'
    overrideSetAt:  { type: Date, default: null },

    sortOrder: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = adminDB.model('SystemService', systemServiceSchema);