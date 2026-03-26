/**
 * controllers/authController.js – Authentication Controller (INSTANT HOST)
 *
 * Endpoints:
 *   POST /api/register         – Register with role selection
 *   POST /api/login            – Authenticate and receive JWT
 *   GET  /api/verify-email     – Verify email with token
 *   POST /api/forgot-password  – Request password reset link
 *   POST /api/reset-password   – Reset password with token
 */

const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

dotenv.config();

/**
 * POST /api/register
 * Body: { full_name, email, phone, password, role, institution }
 */
const register = async (req, res) => {
    const { full_name, email, phone, password, role, institution } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ error: 'full_name, email, and password are required.' });
    }

    // Validate role
    const validRoles = ['STUDENT', 'CUSTODIAN'];
    const userRole = role ? role.toUpperCase() : 'STUDENT';
    if (!validRoles.includes(userRole)) {
        return res.status(400).json({ error: 'Role must be STUDENT or CUSTODIAN.' });
    }

    try {
        const verification_token = uuidv4();

        await User.create({
            full_name,
            email,
            phone,
            password,
            role: userRole,
            institution,
            verification_token,
        });

        // Send verification email (non-blocking)
        sendVerificationEmail(email, verification_token);

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already in use.' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/login
 * Body: { email, password }
 * Response: { token, user: { id, full_name, email, role } }
 */
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const [results] = await User.findByEmail(email);
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = results[0];

        // Check if email is verified
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                institution: user.institution,
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/verify-email?token=xxx
 */
const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
    }

    try {
        const [results] = await User.findByVerificationToken(token);
        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        await User.verify(results[0].id);
        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/forgot-password
 * Body: { email }
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        const [results] = await User.findByEmail(email);
        if (results.length === 0) {
            // Don't reveal if email exists
            return res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
        }

        const reset_token = uuidv4();
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await User.setResetToken(results[0].id, reset_token, expires);
        sendPasswordResetEmail(email, reset_token);

        res.json({ message: 'If an account exists with that email, a reset link has been sent.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/reset-password
 * Body: { token, password }
 */
const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'Token and new password are required.' });
    }

    try {
        const [results] = await User.findByResetToken(token);
        if (results.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token.' });
        }

        await User.updatePassword(results[0].id, password);
        res.json({ message: 'Password reset successful! You can now log in with your new password.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };
