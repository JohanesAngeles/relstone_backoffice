// routes/orders.js
const express  = require('express');
const router   = express.Router();
const mongoose = require('mongoose');
const { adminDB } = require('../config/db');
const { protectAdmin } = require('../middleware/adminAuth');

const orderSchema = new mongoose.Schema({
  studentId:    { type: String, index: true },
  studentName:  String,
  date:         String,
  orderNumber:  String,
  itemNumber:   String,
  description:  String,
  price:        String,
  discount:     String,
  total:        String,
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  studentId:     { type: String, unique: true, index: true },
  name:          String,
  companyName:   String,
  mailingAddress:String,
  email:         String,
  dreNumber:     String,
  licenseNumber: String,
  workPhone:     String,
  mobilePhone:   String,
  firstOrderDate:String,
}, { timestamps: true });

const Order   = adminDB.models.Order   || adminDB.model('Order',   orderSchema);
const Student = adminDB.models.Student || adminDB.model('Student', studentSchema);

// ── GET /api/orders/lookup ────────────────────────────────────
// Query params (at least one required):
//   orderNumber, email, lastName, companyName, creditCard, itemNumber
router.get('/lookup', protectAdmin, async (req, res) => {
  try {
    const {
      orderNumber, email, lastName,
      companyName, creditCard, itemNumber,
    } = req.query;

    // Must have at least one search param
    const hasAny = [orderNumber, email, lastName, companyName, creditCard, itemNumber]
      .some(v => v && v.trim());

    if (!hasAny) {
      return res.status(400).json({ message: 'Please enter at least one search field.' });
    }

    // ── Step 1: Find matching students ────────────────────────
    const studentQuery = {};
    const studentConditions = [];

    if (email)       studentConditions.push({ email:       new RegExp(email.trim(),       'i') });
    if (lastName)    studentConditions.push({ name:        new RegExp(lastName.trim(),     'i') });
    if (companyName) studentConditions.push({ companyName: new RegExp(companyName.trim(),  'i') });

    let studentIds = [];

    if (studentConditions.length > 0) {
      studentQuery.$or = studentConditions;
      const students = await Student.find(studentQuery).select('studentId').lean();
      studentIds = students.map(s => s.studentId);
    }

    // ── Step 2: Build order query ─────────────────────────────
    const orderConditions = [];

    if (orderNumber) orderConditions.push({ orderNumber: new RegExp(orderNumber.trim(), 'i') });
    if (itemNumber)  orderConditions.push({ itemNumber:  new RegExp(itemNumber.trim(),  'i') });
    if (studentIds.length > 0) orderConditions.push({ studentId: { $in: studentIds } });

    // creditCard: match last 4 digits against description or itemNumber (best effort)
    if (creditCard) {
      orderConditions.push({ description: new RegExp(creditCard.trim(), 'i') });
    }

    if (orderConditions.length === 0) {
      return res.json({ orders: [], total: 0 });
    }

    const orders = await Order.find({ $or: orderConditions })
      .sort({ date: -1 })
      .limit(200)
      .lean();

    // ── Step 3: Enrich with student info ──────────────────────
    const uniqueStudentIds = [...new Set(orders.map(o => o.studentId))];
    const students = await Student.find({ studentId: { $in: uniqueStudentIds } })
      .select('studentId name email workPhone mailingAddress companyName')
      .lean();

    const studentMap = {};
    students.forEach(s => { studentMap[s.studentId] = s; });

    const enriched = orders.map(o => ({
      ...o,
      student: studentMap[o.studentId] || null,
    }));

    res.json({ orders: enriched, total: enriched.length });

  } catch (err) {
    console.error('GET /orders/lookup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/orders/by-date ───────────────────────────────────
// Query params: date (YYYY-MM-DD), month (YYYY-MM), entire (bool)
router.get('/by-date', protectAdmin, async (req, res) => {
  try {
    const { date, month, entire } = req.query;

    let query = {};

    if (entire === 'true' && month) {
      // e.g. month=2020-05 → match all dates starting with "05-"
      const [year, mon] = month.split('-');
      query.date = new RegExp(`^${mon}-\\d{2}-${year}|^${year}-${mon}`);
    } else if (date) {
      query.date = new RegExp(date.replace(/-/g, '[-/]'));
    }

    const orders = await Order.find(query).sort({ date: -1 }).limit(500).lean();

    // Enrich with student info
    const ids = [...new Set(orders.map(o => o.studentId))];
    const students = await Student.find({ studentId: { $in: ids } })
      .select('studentId name email')
      .lean();
    const studentMap = {};
    students.forEach(s => { studentMap[s.studentId] = s; });

    const enriched = orders.map(o => ({ ...o, student: studentMap[o.studentId] || null }));

    res.json({ orders: enriched, total: enriched.length });
  } catch (err) {
    console.error('GET /orders/by-date error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;