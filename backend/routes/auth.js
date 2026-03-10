// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateCode, sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { protect } = require('../middleware/auth');
const passport = require('../config/passport');
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Get adminDB connection ────────────────────────────────────────────────────
const { adminDB } = require('../config/db');

// ── Student model ─────────────────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  studentId:        { type: String, unique: true, index: true },
  name:             String,
  firstName:        String,
  lastName:         String,
  companyName:      String,
  mailingAddress:   String,
  streetAddress:    String,
  city:             String,
  state:            String,
  postalCode:       String,
  email:            String,
  dreNumber:        String,
  licenseNumber:    String,
  cfpNumber:        String,
  npnNumber:        String,
  workPhone:        String,
  mobilePhone:      String,
  firstOrderDate:   String,
  password:         String,
  notes:            String,
  registrationYear: String,
  importedAt:       { type: Date, default: Date.now },
  webUserId:        { type: String, default: '' },
  registeredViaWeb: { type: Boolean, default: true },
}, { timestamps: true });

const Student = adminDB.models.Student || adminDB.model('Student', studentSchema);

// ── Helper: generate next Student ID ─────────────────────────────────────────
const getNextStudentId = async () => {
  const year = new Date().getFullYear().toString();
  const allStudents = await Student.find({}, { studentId: 1 }).lean();

  const nums = allStudents
    .map(s => {
      const id = s.studentId || '';
      const yearMatch  = id.match(/^\d{4}-(\d+)$/);
      if (yearMatch) return parseInt(yearMatch[1]);
      const plainMatch = id.match(/^(\d+)$/);
      if (plainMatch) return parseInt(plainMatch[1]);
      const oldMatch   = id.match(/^\d{2}-(\d+)$/);
      if (oldMatch) return parseInt(oldMatch[1]);
      return 0;
    })
    .filter(n => !isNaN(n));

  const maxNum  = nums.length > 0 ? Math.max(...nums) : 0;
  const nextNum = String(maxNum + 1).padStart(5, '0');
  return `${year}-${nextNum}`;
};

// ── JWT helper ────────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const code    = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      verificationCode:        code,
      verificationCodeExpires: expires,
    });

    try {
      const existingStudent = await Student.findOne({ email: email.trim().toLowerCase() });

      if (!existingStudent) {
        const studentId        = await getNextStudentId();
        const fullName         = `${lastName.trim()}, ${firstName.trim()}`;
        const registrationYear = new Date().getFullYear().toString();

        await Student.create({
          studentId,
          name:             fullName,
          firstName:        firstName.trim(),
          lastName:         lastName.trim(),
          email:            email.trim().toLowerCase(),
          registrationYear,
          firstOrderDate:   '',
          companyName:      '',
          mailingAddress:   '',
          streetAddress:    '',
          city:             '',
          state:            '',
          postalCode:       '',
          workPhone:        '',
          mobilePhone:      '',
          dreNumber:        '',
          notes:            '',
          password:         '',
          webUserId:        user._id.toString(),
          registeredViaWeb: true,
        });

        console.log(`✅ Student record created in relstone-admin: ${studentId} — ${fullName}`);
      } else {
        await Student.findOneAndUpdate(
          { email: email.trim().toLowerCase() },
          { $set: { webUserId: user._id.toString() } }
        );
        console.log(`🔗 Linked existing admin student to web user: ${email}`);
      }
    } catch (studentErr) {
      console.error('⚠️  Failed to create student in relstone-admin:', studentErr.message);
    }

    await sendVerificationEmail(email, `${firstName} ${lastName}`, code);

    res.status(201).json({
      message: 'Account created. Please check your email for a verification code.',
      userId:  user._id,
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

// ── POST /api/auth/verify ─────────────────────────────────────────────────────
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

    user.isVerified              = true;
    user.verificationCode        = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    const adminStudentV = await Student.findOne({ email: user.email.toLowerCase() }).lean();

    res.json({
      message: 'Email verified successfully!',
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        name:      `${user.firstName} ${user.lastName}`,
        email:     user.email,
        role:      user.role,
        studentId: adminStudentV?.studentId || null,
      },
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/resend-code ────────────────────────────────────────────────
router.post('/resend-code', async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user)           return res.status(404).json({ message: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified.' });

    const code = generateCode();
    user.verificationCode        = code;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, `${user.firstName} ${user.lastName}`, code);
    res.json({ message: 'New verification code sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
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
        message:           'Please verify your email before logging in.',
        userId:            user._id,
        needsVerification: true,
      });

    const token = signToken(user._id);
    const adminStudent = await Student.findOne({ email: user.email.toLowerCase() }).lean();

    res.json({
      token,
      user: {
        id:        user._id,
        firstName: user.firstName,
        lastName:  user.lastName,
        name:      `${user.firstName} ${user.lastName}`,
        email:     user.email,
        role:      user.role,
        studentId: adminStudent?.studentId || null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'No account found with that email.' });

    const code = generateCode();
    user.resetPasswordCode    = code;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(email, code);
    res.json({ message: 'Password reset code sent to your email.', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, code, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (user.resetPasswordCode !== code)
      return res.status(400).json({ message: 'Invalid code.' });

    if (user.resetPasswordExpires < new Date())
      return res.status(400).json({ message: 'Code expired.' });

    user.password             = newPassword;
    user.resetPasswordCode    = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const adminStudentMe = await Student.findOne({ email: user.email.toLowerCase() }).lean();

    res.json({
      id:        user._id,
      firstName: user.firstName,
      lastName:  user.lastName,
      name:      `${user.firstName} ${user.lastName}`,
      email:     user.email,
      role:      user.role,
      studentId: adminStudentMe?.studentId || null,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── Course model (relstone-admin > courses) ───────────────────────────────────
const courseSchemaAuth = new mongoose.Schema({
  studentId:        String,
  examMasterID:     String,
  bundleId:         String,
  courseTitle:      String,
  courseType:       String,
  versions:         [String],
  examNames:        [String],
  totalQuestions:   Number,
  registrationDate: String,
  expirationDate:   String,
  completionDate:   String,
  status:           String,
  progress:         Number,
  examScore:        Number,
  examPassed:       Boolean,
}, { strict: false });

const AdminCourse = adminDB.models.Course || adminDB.model('Course', courseSchemaAuth);

// ── GET /api/auth/my-courses ──────────────────────────────────────────────────
router.get('/my-courses', protect, async (req, res) => {
  try {
    const webUser = await User.findById(req.user._id).select('email firstName lastName');
    if (!webUser) return res.status(404).json({ message: 'User not found.' });

    const student = await Student.findOne({ email: webUser.email.toLowerCase() }).lean();

    if (!student) {
      return res.json({ student: null, courses: [], message: 'No student record found.' });
    }

    const courses = await AdminCourse.find({ studentId: student.studentId })
      .sort({ registrationDate: -1 })
      .lean();

    res.json({
      student: {
        studentId: student.studentId,
        name:      student.name,
        email:     student.email,
        firstName: webUser.firstName,
        lastName:  webUser.lastName,
      },
      courses,
    });

  } catch (err) {
    console.error('GET /auth/my-courses error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// ── GET /api/auth/google ──────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// ── GET /api/auth/google/callback ─────────────────────────────────────────────
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google`,
    session: false,
  }),
  async (req, res) => {
    try {
      const user    = req.user;
      const token   = signToken(user._id);
      const student = await Student.findOne({ email: user.email.toLowerCase() }).lean();

      const params = new URLSearchParams({
        token,
        userId:    user._id.toString(),
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        studentId: student?.studentId || '',
      });

      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server`);
    }
  }
);
router.post('/google/mobile', async (req, res) => {
  try {
    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, given_name, family_name, sub: googleId } = payload;

    let user = await User.findOne({ $or: [{ email }, { googleId }] });
    if (!user) {
      const crypto = require('crypto');
      user = await User.create({
        email,
        name: name || `${given_name} ${family_name}`,
        firstName: given_name,
        lastName:  family_name,
        googleId,
        password:   crypto.randomBytes(16).toString('hex'),
        isVerified: true,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }

    let student = await Student.findOne({ email: email.toLowerCase() });
   if (!student) {
  const studentId = await getNextStudentId();
  student = await Student.create({
    studentId,
    // ── match old imported format ──────────────
    name:             `${family_name}, ${given_name}`,
    firstName:        given_name,
    lastName:         family_name,
    companyName:      '',
    mailingAddress:   '',
    streetAddress:    '',
    city:             '',
    state:            '',
    postalCode:       '',
    workPhone:        '',
    mobilePhone:      '',
    dreNumber:        '',
    licenseNumber:    '',
    cfpNumber:        '',
    npnNumber:        '',
    firstOrderDate:   '',
    notes:            '',
    // ── web-specific fields ────────────────────
    email:            email.toLowerCase(),
    registrationYear: new Date().getFullYear().toString(),
    webUserId:        user._id.toString(),
    registeredViaWeb: true,
    password:         require('crypto').randomBytes(16).toString('hex'),
  });
    } else if (!student.webUserId) {
      student.webUserId = user._id.toString();
      await student.save();
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        _id:       user._id,
        name:      user.name || `${user.firstName} ${user.lastName}`,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
        studentId: student?.studentId || null,
        role:      user.role || 'student',
      },
    });
  } catch (err) {
    console.error('Google mobile auth error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

module.exports = router;