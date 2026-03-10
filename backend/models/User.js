<<<<<<< HEAD
// models/User.js
=======
>>>>>>> feat/matt
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { webDB } = require('../config/db');

const userSchema = new mongoose.Schema({
<<<<<<< HEAD
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
=======
  // ── Auth fields ──────────────────────────────────────────────────────────
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
>>>>>>> feat/matt
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  googleId: {
  type: String,
  default: null,
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

<<<<<<< HEAD
  // ── Role ─────────────────────────────────────────────────
=======
  // ── Role ──────────────────────────────────────────────────────────────────
>>>>>>> feat/matt
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },

<<<<<<< HEAD
  // ── Link to Admin DB student record (if exists) ──────────
=======
  // ── Link to Admin DB student record (if exists) ──────────────────────────
>>>>>>> feat/matt
  adminStudentId: {
    type: String,
    default: null,
  },

<<<<<<< HEAD
=======
  // ── Google OAuth ──────────────────────────────────────────────────────────
  googleId: {
    type: String,
    default: null,
  },

>>>>>>> feat/matt
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