// routes/certificate.js
//
// Handles:
//   POST /api/certificate/generate         — auto-called when bundle hits 100%
//   GET  /api/certificate/download/:courseId — admin or student downloads the PDF
//   POST /api/certificate/send/:courseId   — admin sends cert to student via email
//   GET  /api/certificate/status/:courseId — returns cert status
//
// Setup:
//   npm install docxtemplater pizzip nodemailer
//   Place approved template at: backend/templates/COMPLETION_CERTIFICATE.docx
//   LibreOffice must be installed on the server for DOCX → PDF conversion
//   Linux: sudo apt install libreoffice
//   Mac:   brew install --cask libreoffice

const express      = require('express');
const router       = require('express').Router();
const path         = require('path');
const fs           = require('fs');
const os           = require('os');
const mongoose     = require('mongoose');

const PizZip        = require('pizzip');
const Docxtemplater = require('docxtemplater');
const nodemailer    = require('nodemailer');
const { execFile }  = require('child_process');

const { adminDB }    = require('../config/db');
const { protect }    = require('../middleware/auth');
const { protectAdmin } = require('../middleware/adminAuth');

// ── Reuse existing models — never re-register ─────────────────────────────────

// Student (relstone-admin DB)
// Exact fields from routes/students.js studentSchema:
//   name, email, mailingAddress, workPhone, mobilePhone, homePhone,
//   dreNumber, licenseNumber, studentId
const studentSchema = new mongoose.Schema({
  studentId:      { type: String, unique: true, index: true },
  name:           String,   // "LastName, FirstName" format
  companyName:    String,
  mailingAddress: String,
  email:          String,
  workPhone:      String,
  mobilePhone:    String,
  homePhone:      String,
  dreNumber:      String,
  licenseNumber:  String,
}, { strict: false });

const Student = adminDB.models.Student ||
  adminDB.model('Student', studentSchema);

// Course (relstone-admin DB)
// Exact fields from routes/students.js courseSchema
const courseSchema = new mongoose.Schema({
  studentId:        { type: String, index: true },
  studentName:      String,
  examMasterID:     String,
  bundleId:         String,
  courseTitle:      String,
  courseType:       String,
  examNames:        [String],
  registrationDate: String,
  expirationDate:   String,
  completionDate:   String,
  status:           { type: String, default: 'In Progress' },
  progress:         { type: Number, default: 0 },
  examResults:      { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  chosenElective:   { type: String, default: null },
  examTitle:        String,
  // Certificate fields — added by this module
  certificatePath:        String,
  certificateNumber:      String,
  certificateGeneratedAt: Date,
  certificateSentAt:      Date,
  certificateSentTo:      String,
}, { strict: false });

const Course = adminDB.models.Course ||
  adminDB.model('Course', courseSchema);

// ── Paths ─────────────────────────────────────────────────────────────────────

const TEMPLATE_PATH = path.join(__dirname, '../templates/COMPLETION_CERTIFICATE.docx');
const CERT_DIR      = path.join(__dirname, '../generated_certificates');

if (!fs.existsSync(CERT_DIR)) fs.mkdirSync(CERT_DIR, { recursive: true });

// ── Email transporter — matches your existing emailService env vars ────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Helper: generate cert number YYYY-NNNN ────────────────────────────────────
const generateCertNumber = async () => {
  const year  = new Date().getFullYear();
  const count = await Course.countDocuments({
    certificateNumber: { $exists: true, $ne: null },
  });
  return `${year}-${String(count + 1).padStart(4, '0')}`;
};

// ── Helper: extract first name from "LastName, FirstName Middle" format ────────
// Matches your existing pattern in routes/students.js email-affidavit handler
const getFirstName = (fullName = '') => {
  if (!fullName) return 'Student';
  return fullName.includes(',')
    ? fullName.split(',')[1].trim().split(' ')[0]
    : fullName.trim().split(' ')[0];
};

// ── Helper: format date MM/DD/YYYY ────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return new Date().toLocaleDateString('en-US');
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString('en-US');
};

// ── Helper: format date "Month DD, YYYY" ──────────────────────────────────────
const formatDateLong = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  return isNaN(d.getTime())
    ? String(dateStr)
    : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

// ── Helper: derive CE category from bundleId / courseTitle ────────────────────
// Customize to match your actual bundle ID naming conventions
const deriveCECategory = (bundleId = '', courseTitle = '') => {
  const id    = (bundleId || '').toUpperCase();
  const title = (courseTitle || '').toLowerCase();
  if (id.includes('ETH') || title.includes('ethics'))  return 'ETHICS';
  if (id.includes('LAW') || title.includes('law'))     return 'LAW';
  if (id.includes('5HR'))                              return 'ETHICS';
  if (id.includes('INS') || title.includes('survey')) return 'CONSUMER PROTECTION';
  return 'GENERAL';
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE: generateCertificate(course, student)
// Exported so examSession.js can call it directly without HTTP round-trip
// ─────────────────────────────────────────────────────────────────────────────
const generateCertificate = async (course, student) => {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    throw new Error(
      `Certificate template not found at: ${TEMPLATE_PATH}\n` +
      `Please place COMPLETION_CERTIFICATE.docx in backend/templates/`
    );
  }

  const certNumber  = await generateCertNumber();
  const clockHours  = course.clockHours || course.examNames?.length || 3;
  const bundleIdKey = course.bundleId || course.examMasterID || '';
  const ceCategory  = deriveCECategory(bundleIdKey, course.courseTitle);

  // Template placeholders — must match {PLACEHOLDERS} in the DOCX exactly
  const data = {
    STUDENT_NAME:      student.name           || '—',
    STUDENT_ADDRESS:   student.mailingAddress  || '—',
    // dreNumber is the DRE/real estate license number in your Student schema
    LICENSE_NUMBER:    student.dreNumber       || student.licenseNumber || '—',
    PHONE:             student.workPhone       || student.mobilePhone   || student.homePhone || '—',
    COURSE_TITLE:      course.courseTitle      || '—',
    CERT_NUMBER:       certNumber,
    REGISTRATION_DATE: formatDate(course.registrationDate),
    COMPLETION_DATE:   formatDate(course.completionDate || new Date().toISOString()),
    CLOCK_HOURS:       String(clockHours),
    CE_CATEGORY:       ceCategory,
    ISSUANCE_DATE:     formatDateLong(new Date().toISOString()),
    // Set ADMIN_SIGNATURE_NAME in your .env to change the signature name
    ADMIN_NAME:        process.env.ADMIN_SIGNATURE_NAME || 'Amina Ahmed',
  };

  // Render template with docxtemplater
  const templateBuf = fs.readFileSync(TEMPLATE_PATH);
  const zip         = new PizZip(templateBuf);
  const doc         = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  doc.render(data);

  const docxBuffer = doc.getZip().generate({ type: 'nodebuffer' });

  // Convert DOCX → PDF via LibreOffice (installed via Aptfile on Heroku)
  const cleanName    = `cert_${student.studentId}_${bundleIdKey}_${Date.now()}`;
  const tmpDocxPath  = path.join(os.tmpdir(), `${cleanName}.docx`);
  fs.writeFileSync(tmpDocxPath, docxBuffer);

  // Find soffice binary — Heroku apt installs to /app/.apt/usr/bin/soffice
  const soffice = fs.existsSync('/app/.apt/usr/bin/soffice')
    ? '/app/.apt/usr/bin/soffice'
    : 'soffice';

  await new Promise((resolve, reject) => {
    execFile(soffice, [
      '--headless',
      '--convert-to', 'pdf',
      '--outdir', CERT_DIR,
      tmpDocxPath,
    ], { timeout: 60000 }, (err, stdout, stderr) => {
      try { fs.unlinkSync(tmpDocxPath); } catch {}
      if (err) return reject(new Error(`LibreOffice conversion failed: ${stderr || err.message}`));
      resolve();
    });
  });

  const finalPdfPath = path.join(CERT_DIR, `${cleanName}.pdf`);

  // Save cert info to course record
  await Course.findByIdAndUpdate(course._id, {
    $set: {
      certificatePath:        finalPdfPath,
      certificateNumber:      certNumber,
      certificateGeneratedAt: new Date(),
    },
  });

  console.log(`✅ Certificate generated: ${cleanName} [#${certNumber}]`);
  return { pdfPath: finalPdfPath, certNumber };
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 1: POST /api/certificate/generate
// Body: { studentId, courseId }
// Called from examSession.js when progress hits 100% — see trigger snippet below
// ─────────────────────────────────────────────────────────────────────────────
router.post('/generate', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId)
      return res.status(400).json({ message: 'studentId and courseId are required.' });

    const [course, student] = await Promise.all([
      Course.findById(courseId).lean(),
      Student.findOne({ studentId }).lean(),
    ]);

    if (!course)  return res.status(404).json({ message: 'Course not found.' });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    if ((course.progress || 0) < 100)
      return res.status(400).json({ message: 'Bundle is not yet 100% complete.' });

    // Skip if already generated and file still exists on disk
    if (course.certificatePath && fs.existsSync(course.certificatePath)) {
      return res.json({ message: 'Certificate already exists.', certNumber: course.certificateNumber });
    }

    const { certNumber } = await generateCertificate(course, student);
    res.json({ message: 'Certificate generated successfully.', certNumber });

  } catch (err) {
    console.error('Certificate generate error:', err);
    res.status(500).json({ message: err.message || 'Failed to generate certificate.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 2: GET /api/certificate/download/:courseId
// Admin or authenticated student downloads the PDF
// ─────────────────────────────────────────────────────────────────────────────
router.get('/download/:courseId', async (req, res) => {
  try {
    let course = await Course.findById(req.params.courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    // Auto-generate if missing
    if (!course.certificatePath || !fs.existsSync(course.certificatePath)) {
      const student = await Student.findOne({ studentId: course.studentId }).lean();
      if (!student) return res.status(404).json({ message: 'Student not found.' });
      await generateCertificate(course, student);
      course = await Course.findById(req.params.courseId).lean();
    }

    const safeName = (course.courseTitle || 'Completion').replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Certificate_${safeName}.pdf"`);
    fs.createReadStream(course.certificatePath).pipe(res);

  } catch (err) {
    console.error('Certificate download error:', err);
    res.status(500).json({ message: err.message || 'Failed to download certificate.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 3: POST /api/certificate/send/:courseId
// Admin sends the certificate PDF to the student's email
// Body (optional): { message }  — custom note shown in the email
// Admin-only
// ─────────────────────────────────────────────────────────────────────────────
router.post('/send/:courseId', protectAdmin, async (req, res) => {
  try {
    let course = await Course.findById(req.params.courseId).lean();
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    // student.name is "LastName, FirstName" per your studentSchema
    const student = await Student.findOne({ studentId: course.studentId }).lean();
    if (!student)       return res.status(404).json({ message: 'Student not found.' });
    if (!student.email) return res.status(400).json({ message: 'Student has no email on file.' });

    // Generate cert if not yet done
    if (!course.certificatePath || !fs.existsSync(course.certificatePath)) {
      await generateCertificate(course, student);
      course = await Course.findById(req.params.courseId).lean();
    }

    // Extract first name using same pattern as your existing email-affidavit handler
    const firstName     = getFirstName(student.name);
    const customMessage = req.body?.message
      ? `<p style="font-style:italic;color:#595959;margin:12px 0;">${req.body.message}</p>`
      : '';

    await transporter.sendMail({
      from:    `"Real Estate License Services" <${process.env.EMAIL_USER || process.env.SMTP_USER}>`,
      to:      student.email,
      subject: `Your Completion Certificate — ${course.courseTitle}`,
      html: `
        <div style="font-family:Georgia,serif;color:#0D2436;max-width:600px;margin:0 auto;">
          <h2 style="color:#0D2436;margin-bottom:8px;">Congratulations, ${firstName}!</h2>
          <p style="color:#595959;">
            You have successfully completed <strong>${course.courseTitle}</strong>.
            Your official Completion Certificate is attached to this email.
          </p>
          ${customMessage}
          <table style="font-size:13px;color:#595959;border-collapse:collapse;margin:16px 0;">
            <tr>
              <td style="padding:4px 16px 4px 0;font-weight:bold;">Certificate #</td>
              <td>${course.certificateNumber || '—'}</td>
            </tr>
            <tr>
              <td style="padding:4px 16px 4px 0;font-weight:bold;">Completion Date</td>
              <td>${formatDate(course.completionDate)}</td>
            </tr>
            <tr>
              <td style="padding:4px 16px 4px 0;font-weight:bold;">Course</td>
              <td>${course.courseTitle}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #0D2436;margin:20px 0;" />
          <p style="font-size:12px;color:#7F7F7F;">
            <strong>REMINDER:</strong> DRE requires that the CE Course Verification (RE 251) form
            be used upon license renewal. You are responsible for reporting your course completion
            to DRE — DRE does not accept completions directly from schools. Credit will expire
            if not used within four years of the completion date.
          </p>
          <p style="font-size:12px;color:#7F7F7F;">
            Real Estate License Services &nbsp;|&nbsp;
            <a href="https://www.dre.ca.gov" style="color:#2EABFE;">www.dre.ca.gov</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename:    `Certificate_${(course.courseTitle || 'Completion').replace(/\s+/g, '_')}.pdf`,
          path:        course.certificatePath,
          contentType: 'application/pdf',
        },
      ],
    });

    // Record send timestamp and recipient on the course
    await Course.findByIdAndUpdate(req.params.courseId, {
      $set: {
        certificateSentAt: new Date(),
        certificateSentTo: student.email,
      },
    });

    console.log(`📧 Certificate sent to ${student.email} — ${course.courseTitle}`);
    res.json({ message: `Certificate sent to ${student.email}`, sentTo: student.email });

  } catch (err) {
    console.error('Certificate send error:', err);
    res.status(500).json({ message: err.message || 'Failed to send certificate.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE 4: GET /api/certificate/status/:courseId
// Returns cert status — used by admin StudentDetail + student MyCourses page
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status/:courseId', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .select('certificatePath certificateNumber certificateGeneratedAt certificateSentAt certificateSentTo progress status courseTitle')
      .lean();

    if (!course) return res.status(404).json({ message: 'Course not found.' });

    res.json({
      generated:   !!(course.certificatePath && fs.existsSync(course.certificatePath)),
      certNumber:  course.certificateNumber       || null,
      generatedAt: course.certificateGeneratedAt  || null,
      sentAt:      course.certificateSentAt       || null,
      sentTo:      course.certificateSentTo       || null,
      progress:    course.progress,
      status:      course.status,
    });

  } catch (err) {
    console.error('Certificate status error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Export both the router and generateCertificate so examSession.js can import directly
module.exports = { router, generateCertificate };