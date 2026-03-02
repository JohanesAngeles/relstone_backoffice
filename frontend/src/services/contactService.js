const ContactMessage = require('../models/ContactMessage');

// Optional email notification via nodemailer
let transporter = null;
const nodemailer = require('nodemailer');

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

async function createContactMessage(payload, meta = {}) {
  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim().toLowerCase();
  const subject = String(payload.subject || '').trim();
  const message = String(payload.message || '').trim();

  if (!name) throw new Error('Name is required.');
  if (!email || !isValidEmail(email)) throw new Error('Valid email is required.');
  if (!subject) throw new Error('Subject is required.');

  const doc = await ContactMessage.create({
    name,
    email,
    subject,
    message,
    ipAddress: meta.ipAddress || '',
    userAgent: meta.userAgent || '',
  });

  // Optional: notify support email
  const tx = getTransporter();
  const SUPPORT_TO = process.env.SUPPORT_TO_EMAIL || 'support@relstone.com';
  const SUPPORT_FROM = process.env.SUPPORT_FROM_EMAIL || process.env.SMTP_USER;

  if (tx && SUPPORT_FROM) {
    await tx.sendMail({
      from: SUPPORT_FROM,
      to: SUPPORT_TO,
      subject: `New Contact Message: ${subject}`,
      text:
`New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message || '(no message)'}

Message ID: ${doc._id}
Created At: ${doc.createdAt}
`,
    });
  }

  return doc;
}

module.exports = { createContactMessage };