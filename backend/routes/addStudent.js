// routes/addStudent.js
// POST /api/students/add  — creates a new student with auto-generated Student ID
// GET  /api/students/next-id — returns the next available Student ID preview

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const mongoose = require('mongoose');
const { adminDB } = require('../config/db');
const { protectAdmin } = require('../middleware/adminAuth');

// ── Models ────────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  studentId:      { type: String, unique: true, index: true },
  name:           String,
  firstName:      String,
  lastName:       String,
  companyName:    String,
  mailingAddress: String,
  streetAddress:  String,
  city:           String,
  state:          String,
  postalCode:     String,
  email:          String,
  dreNumber:      String,
  licenseNumber:  String,
  cfpNumber:      String,
  npnNumber:      String,
  workPhone:      String,
  mobilePhone:    String,
  firstOrderDate: String,
  password:       String,   // hashed
  notes:          String,
  registrationYear: String,
  importedAt:     { type: Date, default: Date.now },
}, { timestamps: true });

const Student = adminDB.models.Student || adminDB.model('Student', studentSchema);

// ── Helper: generate next Student ID ─────────────────────────
// Format: YYYY-NNNNN  (year + 5-digit sequential number)
const getNextStudentId = async () => {
  const year = new Date().getFullYear().toString();

  // Find all students with IDs starting with this year
  const yearStudents = await Student.find(
    { studentId: new RegExp(`^${year}-`) },
    { studentId: 1 }
  ).lean();

  // Also find students with old format (pure numeric like 86443) to avoid collisions
  const allStudents = await Student.find({}, { studentId: 1 }).lean();

  // Extract all numeric suffixes
  const nums = allStudents
    .map(s => {
      const id = s.studentId || '';
      // Match YYYY-NNNNN format
      const yearMatch = id.match(/^\d{4}-(\d+)$/);
      if (yearMatch) return parseInt(yearMatch[1]);
      // Match plain numeric
      const plainMatch = id.match(/^(\d+)$/);
      if (plainMatch) return parseInt(plainMatch[1]);
      // Match 00-NNNNN format
      const oldMatch = id.match(/^\d{2}-(\d+)$/);
      if (oldMatch) return parseInt(oldMatch[1]);
      return 0;
    })
    .filter(n => !isNaN(n));

  const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
  const nextNum = String(maxNum + 1).padStart(5, '0');
  return `${year}-${nextNum}`;
};

// ── GET /api/students/next-id ─────────────────────────────────
router.get('/next-id', protectAdmin, async (req, res) => {
  try {
    const nextId = await getNextStudentId();
    res.json({ nextId });
  } catch (err) {
    console.error('next-id error:', err);
    res.status(500).json({ message: 'Failed to generate student ID' });
  }
});

// ── POST /api/students/add ────────────────────────────────────
router.post('/add', protectAdmin, async (req, res) => {
  try {
    const {
      firstName, lastName, companyName,
      email, mobilePhone, workPhone,
      streetAddress, city, state, postalCode,
      dreNumber, password, notes,
    } = req.body;

    // ── Validation ────────────────────────────────────────────
    const errors = [];
    if (!firstName?.trim()) errors.push('First name is required.');
    if (!lastName?.trim())  errors.push('Last name is required.');
    if (!email?.trim())     errors.push('Email address is required.');
    if (!streetAddress?.trim()) errors.push('Street address is required.');
    if (!city?.trim())      errors.push('City is required.');
    if (!state?.trim())     errors.push('State is required.');
    if (!postalCode?.trim()) errors.push('Postal code is required.');
    if (!password?.trim())  errors.push('System password is required.');

    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(' '), errors });
    }

    // ── Check duplicate email ─────────────────────────────────
    const existing = await Student.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: `A student with email "${email}" already exists (ID: ${existing.studentId}).` });
    }

    // ── Generate student ID ───────────────────────────────────
    const studentId = await getNextStudentId();

    // ── Hash password ─────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // ── Build full name and mailing address ───────────────────
    const fullName       = `${lastName.trim()}, ${firstName.trim()}`;
    const mailingAddress = `${streetAddress.trim()}, ${city.trim()}, ${state.trim()} ${postalCode.trim()}`;
    const registrationYear = new Date().getFullYear().toString();

    // ── Save student ──────────────────────────────────────────
    const student = await Student.create({
      studentId,
      name:           fullName,
      firstName:      firstName.trim(),
      lastName:       lastName.trim(),
      companyName:    companyName?.trim() || '',
      email:          email.trim().toLowerCase(),
      mobilePhone:    mobilePhone?.trim() || '',
      workPhone:      workPhone?.trim() || '',
      streetAddress:  streetAddress.trim(),
      city:           city.trim(),
      state:          state.trim(),
      postalCode:     postalCode.trim(),
      mailingAddress,
      dreNumber:      dreNumber?.trim() || '',
      password:       hashedPassword,
      notes:          notes?.trim() || '',
      registrationYear,
      firstOrderDate: '',
    });

    res.status(201).json({
      message: `Student record created successfully.`,
      studentId: student.studentId,
      name:      student.name,
    });

  } catch (err) {
    console.error('POST /students/add error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A student with this ID or email already exists.' });
    }
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;