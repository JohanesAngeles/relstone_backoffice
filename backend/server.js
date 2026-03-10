// server.js
const express = require('express');
<<<<<<< HEAD
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars first
dotenv.config();

// Initialize DB connections
require('./config/db');

const app = express();

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.ADMIN_URL  || 'http://localhost:5174',
  ],
=======
<<<<<<< HEAD
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

require('./config/db');

const passport = require('./config/passport'); // ← move to top
=======
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();
require('./config/db');

const passport = require('./config/passport'); // ← move UP here
>>>>>>> feat/matt-clean

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
>>>>>>> feat/matt
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
<<<<<<< HEAD

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/insurance', require('./routes/insuranceRoutes')); 
app.use('/api/admin', require('./routes/adminAuth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/students', require('./routes/addStudent'));
app.use('/api/students', require('./routes/students'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/dre-approvals', require('./routes/dreApprovals'));
app.use('/api/exam-qanda', require('./routes/examQanda'));
app.use('/api/exam-session', require('./routes/examSession'));
app.use('/api/certificate',  require('./routes/certificate').router);
app.use('/api/course-content', require('./routes/courseContent'));


// Combined Conflict Routes
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/cec-students', require('./routes/cecStudents'));
app.use('/api/orders', require('./routes/orders'));


// ── Health check ─────────────────────────────────────────────
=======
app.use(passport.initialize()); // ← initialize BEFORE routes

<<<<<<< HEAD
// ── Routes ───────────────────────────────────────────────────
=======
// ── Routes ──
>>>>>>> feat/matt-clean
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/insurance', require('./routes/insuranceRoutes'));
app.use('/api/admin',     require('./routes/adminAuth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/students',  require('./routes/students'));
app.use('/api/exams',     require('./routes/examRoutes'));

>>>>>>> feat/matt
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🚀 Relstone API is running' });
});

<<<<<<< HEAD
// ── 404 handler ──────────────────────────────────────────────
=======
>>>>>>> feat/matt
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

<<<<<<< HEAD
// ── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

// ── Start server ─────────────────────────────────────────────
=======
app.use((err, req, res, next) => {
  console.error(err.stack);
<<<<<<< HEAD
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
=======
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
>>>>>>> feat/matt-clean
});

>>>>>>> feat/matt
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
});