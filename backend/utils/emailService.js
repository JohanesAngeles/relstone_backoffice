// utils/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit code
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, name, code) => {
  await transporter.sendMail({
    from: `"Relstone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your Relstone account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #091925; margin: 0 0 8px;">Hi ${name},</h2>
        <p style="color: #6b7280; margin: 0 0 24px;">Thanks for signing up! Use the code below to verify your email:</p>
        <div style="background: #091925; color: #ffffff; font-size: 2rem; font-weight: 700; letter-spacing: 0.4em; text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          ${code}
        </div>
        <p style="color: #9ca3af; font-size: 0.85rem;">This code expires in <strong>10 minutes</strong>. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, code) => {
  await transporter.sendMail({
    from: `"Relstone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset your Relstone password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #091925;">Password Reset</h2>
        <p style="color: #6b7280;">Use this code to reset your password:</p>
        <div style="background: #091925; color: #ffffff; font-size: 2rem; font-weight: 700; letter-spacing: 0.4em; text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          ${code}
        </div>
        <p style="color: #9ca3af; font-size: 0.85rem;">Expires in <strong>10 minutes</strong>.</p>
      </div>
    `,
  });
};

module.exports = { generateCode, sendVerificationEmail, sendPasswordResetEmail };