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

// Send Affidavit Ready email
const sendAffidavitEmail = async ({ email, firstName, password }) => {
  await transporter.sendMail({
    from: `"C.E. Credits / Cal-State Exams" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Affidavit Has Been Processed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
        <p style="margin: 0 0 12px;"><strong>${firstName},</strong></p>
        <p style="margin: 0 0 12px;">We have processed your Affidavits(s)</p>
        <p style="margin: 0 0 12px;">
          Now you may go back to our website:
          <a href="https://relstoneexams.com/relsexsys/" style="color: #2563eb;">relstoneexams.com/relsexsys/</a>
          and log in using your password.
        </p>
        <p style="margin: 0 0 12px;">Please go ahead and print your <strong>Completion Certificate</strong>.</p>
        <p style="margin: 0 0 12px;">Thank You,</p>
        <p style="margin: 0; color: #374151;">
          -- C.E. Credits / Cal-State Exams<br/>
          -- A California School Since 1978
        </p>
      </div>
    `,
  });
};

// Send Password Link email
const sendPasswordLinkEmail = async ({ email, firstName, password }) => {
  await transporter.sendMail({
    from: `"RELSTONE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your RELSTONE Login Information',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <p style="margin: 0 0 12px;"><strong>${firstName},</strong></p>

        <p style="margin: 0 0 12px;">Thank you for Registering for your Online C.E. Examinations.</p>

        <p style="margin: 0 0 12px;">
          To access your materials, go to:
          <a href="https://relstoneexams.com/relsexsys/" style="color: #2563eb;">
            RELSTONE Courses4RealEstate
          </a>
        </p>

        <p style="margin: 0 0 12px;">
          To login you'll need your E-Mail Address:
          &lt;<strong>${email}</strong>&gt; as your UserID and<br/>
          Your Password is: &lt;<strong>${password}</strong>&gt;
        </p>

        <br/>

        <p style="margin: 0 0 12px;">
          Examination System Login (use also for mandatory quizzes if taking real estate license renewal courses):
          <a href="https://relstoneexams.com" style="color: #2563eb;">RELSTONEexams.com</a>
        </p>

        <p style="margin: 0 0 12px;">Good Luck on Your Exam(s)!</p>

        <p style="margin: 0 0 4px;">-- RELSTONE, Educational Products and Services</p>
        <p style="margin: 0 0 24px;">-- A California School Since 1978</p>

        <p style="margin: 0; font-size: 11px; color: #6b7280;">
          This is an automated email please do not reply to this message.<br/>
          This message is for the designated recipient only and may contain privileged, proprietary, or otherwise private information.<br/>
          If you have received it in error, please delete. Any other use of the email by you is prohibited.
        </p>
      </div>
    `,
  });
};

module.exports = {
  generateCode,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAffidavitEmail,
  sendPasswordLinkEmail,
};