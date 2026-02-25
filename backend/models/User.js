// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { webDB } = require('../config/db');

const userSchema = new mongoose.Schema({
  // ── Auth fields ──────────────────────────────────────────
  firstName: {
  type: String,
  required: [true, 'First name is required'],
  trim: true,
    },
    lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  resetPasswordCode: String,
  resetPasswordExpires: Date,

  // ── Role ─────────────────────────────────────────────────
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },

  // ── Link to Admin DB student record (if exists) ──────────
  adminStudentId: {
    type: String,
    default: null,
  },

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = webDB.model('User', userSchema);