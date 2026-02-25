// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateCode, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── POST /api/auth/register ──────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password)
        return res.status(400).json({ message: 'All fields are required.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        verificationCode: code,
        verificationCodeExpires: expires,
        });

        await sendVerificationEmail(email, `${firstName} ${lastName}`, code);

    res.status(201).json({
      message: 'Account created. Please check your email for a verification code.',
      userId: user._id,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/verify ────────────────────────────────────
router.post('/verify', async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified.' });

    if (user.verificationCode !== code)
      return res.status(400).json({ message: 'Invalid verification code.' });

    if (user.verificationCodeExpires < new Date())
      return res.status(400).json({ message: 'Code expired. Please request a new one.' });

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/resend-code ───────────────────────────────
router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified.' });

    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, user.name, code);
    res.json({ message: 'New verification code sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' });

    if (!user.isVerified)
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        userId: user._id,
        needsVerification: true,
      });

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/forgot-password ──────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'No account found with that email.' });

    const code = generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, code);
    res.json({ message: 'Password reset code sent to your email.', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/reset-password ───────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, code, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.resetPasswordCode !== code)
      return res.status(400).json({ message: 'Invalid code.' });

    if (user.resetPasswordExpires < new Date())
      return res.status(400).json({ message: 'Code expired.' });

    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;