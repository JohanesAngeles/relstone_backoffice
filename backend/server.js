// server.js
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();
require('./config/db');

const passport = require('./config/passport'); // ← move UP here

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize()); // ← initialize BEFORE routes

// ── Routes ──
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/insurance', require('./routes/insuranceRoutes'));
app.use('/api/admin',     require('./routes/adminAuth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/students',  require('./routes/students'));
app.use('/api/exams',     require('./routes/examRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '🚀 Relstone API is running' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
});