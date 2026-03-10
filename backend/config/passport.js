const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');
const { adminDB } = require('./db');
const jwt = require('jsonwebtoken');

// ── Reuse Student model ───────────────────────────────────────
const studentSchema = new mongoose.Schema({
  studentId:        { type: String, unique: true, index: true },
  name:             String,
  firstName:        String,
  lastName:         String,
  email:            String,
  registrationYear: String,
  firstOrderDate:   String,
  companyName:      String,
  mailingAddress:   String,
  streetAddress:    String,
  city:             String,
  state:            String,
  postalCode:       String,
  workPhone:        String,
  mobilePhone:      String,
  dreNumber:        String,
  notes:            String,
  password:         String,
  webUserId:        { type: String, default: '' },
  registeredViaWeb: { type: Boolean, default: true },
}, { timestamps: true });

const Student = adminDB.models.Student || adminDB.model('Student', studentSchema);

const getNextStudentId = async () => {
  const year = new Date().getFullYear().toString();
  const allStudents = await Student.find({}, { studentId: 1 }).lean();
  const nums = allStudents.map(s => {
    const id = s.studentId || '';
    const m = id.match(/^\d{4}-(\d+)$/) || id.match(/^(\d+)$/) || id.match(/^\d{2}-(\d+)$/);
    return m ? parseInt(m[1]) : 0;
  }).filter(n => !isNaN(n));
  const nextNum = String((nums.length > 0 ? Math.max(...nums) : 0) + 1).padStart(5, '0');
  return `${year}-${nextNum}`;
};

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email     = profile.emails[0].value.toLowerCase();
    const firstName = profile.name.givenName  || profile.displayName.split(' ')[0];
    const lastName  = profile.name.familyName || profile.displayName.split(' ')[1] || '';
    const googleId  = profile.id;

    // ── 1. Find or create web user ────────────────────────────
    let user = await User.findOne({ email });

    if (!user) {
      // New user — create with a random password (Google users won't use it)
      const crypto = require('crypto');
      user = await User.create({
        firstName,
        lastName,
        email,
        password:   crypto.randomBytes(32).toString('hex'),
        isVerified: true,   // Google already verified the email
        googleId,
      });
    } else {
      // Existing user — mark as verified and save googleId if missing
      if (!user.googleId) user.googleId = googleId;
      if (!user.isVerified) user.isVerified = true;
      await user.save();
    }

    // ── 2. Find or create student in relstone-admin ───────────
    const existingStudent = await Student.findOne({ email });

    if (!existingStudent) {
      const studentId        = await getNextStudentId();
      const fullName         = `${lastName.trim()}, ${firstName.trim()}`;
      const registrationYear = new Date().getFullYear().toString();

      await Student.create({
        studentId,
        name:             fullName,
        firstName:        firstName.trim(),
        lastName:         lastName.trim(),
        email,
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

      console.log(`✅ Google OAuth: Student created — ${studentId}`);
    } else if (!existingStudent.webUserId) {
      await Student.findOneAndUpdate(
        { email },
        { $set: { webUserId: user._id.toString() } }
      );
      console.log(`🔗 Google OAuth: Linked existing student — ${email}`);
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// Not using sessions — JWT only, so these are minimal stubs
passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

module.exports = passport;