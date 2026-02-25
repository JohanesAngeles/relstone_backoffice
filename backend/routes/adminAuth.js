const express = require('express');
const router = express.Router();
const svgCaptcha = require('svg-captcha');

// ── In-memory store (server-side only, never exposed to client) ──
let currentNumber = null;
let currentCaptchaText = null;

// Base password — move this to your .env file as ADMIN_BASE_PASSWORD
const BASE_PASSWORD = process.env.ADMIN_BASE_PASSWORD || 'relstone';

// ── Helper: generate a random number (10–99) ─────────────────────
function generateNumber() {
  return Math.floor(Math.random() * 10) * 10;
}

// ── Helper: generate a new CAPTCHA ───────────────────────────────
function generateCaptcha() {
  const captcha = svgCaptcha.create({
    size: 6,           // 6 characters
    noise: 3,          // number of noise lines
    color: true,       // colored characters
    background: '#f0f0f0',
  });
  currentCaptchaText = captcha.text.toLowerCase();
  return captcha.data; // SVG string
}


// ── ROUTE 1: GET /api/admin/get-number ───────────────────────────
// Called when the login page loads. Generates and returns a fresh number.
router.get('/get-number', (req, res) => {
  currentNumber = generateNumber();
  res.json({ number: currentNumber });
});


// ── ROUTE 2: POST /api/admin/verify-password ─────────────────────
// Checks: submitted password === BASE_PASSWORD + currentNumber
// Success → returns a CAPTCHA image (SVG)
// Failure → generates a new number and returns it
router.post('/verify-password', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required.' });
  }

  const expectedPassword = `${BASE_PASSWORD}${currentNumber}`;

  if (password === expectedPassword) {
    // ✅ Correct — generate CAPTCHA for Step 2
    const captchaSvg = generateCaptcha();
    return res.json({
      success: true,
      captcha: captchaSvg, // SVG image sent to frontend
    });
  } else {
    // ❌ Wrong — rotate the number
    currentNumber = generateNumber();
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Try again.',
      newNumber: currentNumber,
    });
  }
});


// ── ROUTE 3: POST /api/admin/verify-captcha ──────────────────────
// Checks submitted CAPTCHA text against stored answer
// Success → issues admin JWT token
// Failure → generates fresh CAPTCHA
router.post('/verify-captcha', (req, res) => {
  const { captchaInput } = req.body;

  if (!captchaInput) {
    return res.status(400).json({ message: 'CAPTCHA input is required.' });
  }

  if (captchaInput.toLowerCase() === currentCaptchaText) {
    // ✅ Correct — clear captcha from memory, issue admin token
    currentCaptchaText = null;

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      success: true,
      token,
      message: 'Welcome to the Back Office.',
    });
  } else {
    // ❌ Wrong — generate a fresh CAPTCHA
    const captchaSvg = generateCaptcha();
    return res.status(401).json({
      success: false,
      message: 'Incorrect CAPTCHA. Try again.',
      captcha: captchaSvg,
    });
  }
});


module.exports = router;