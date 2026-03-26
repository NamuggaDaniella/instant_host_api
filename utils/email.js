/**
 * utils/email.js – Email Sending Utility
 *
 * Uses nodemailer with SMTP. Configure SMTP_HOST, SMTP_PORT,
 * SMTP_USER, SMTP_PASS in .env.
 */

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email.
 * @param {string} to – recipient email
 * @param {string} subject
 * @param {string} html – HTML content
 */
const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"INSTANT HOST" <${process.env.SMTP_USER || 'noreply@instanthost.com'}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('Email send error:', err.message);
    // Don't throw — email failure shouldn't break the request flow
  }
};

/**
 * Send a verification email with a link.
 */
const sendVerificationEmail = (email, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: #1B2A6B;">Welcome to INSTANT HOST! 🏠</h2>
      <p>Thank you for registering. Please verify your email address to activate your account.</p>
      <a href="${url}" style="display: inline-block; background: #1B2A6B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0;">
        Verify Email
      </a>
      <p style="color: #777; font-size: 13px;">If the button doesn't work, copy and paste this URL:<br/>${url}</p>
    </div>
  `;
  return sendEmail(email, 'Verify Your INSTANT HOST Account', html);
};

/**
 * Send a password reset email with a link.
 */
const sendPasswordResetEmail = (email, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: #1B2A6B;">Password Reset 🔐</h2>
      <p>You requested a password reset for your INSTANT HOST account. Click the button below to set a new password.</p>
      <a href="${url}" style="display: inline-block; background: #1B2A6B; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 0;">
        Reset Password
      </a>
      <p style="color: #777; font-size: 13px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail(email, 'Reset Your INSTANT HOST Password', html);
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
