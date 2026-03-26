/**
 * controllers/userController.js – User Management Controller (INSTANT HOST)
 *
 * Endpoints:
 *   GET    /api/users          → list all users (ADMIN)
 *   GET    /api/users/me       → get current user profile
 *   GET    /api/users/:id      → get user by ID (ADMIN)
 *   PUT    /api/users/me       → update own profile
 *   PUT    /api/users/:id      → update user (ADMIN)
 *   DELETE /api/users/:id      → delete user (ADMIN)
 */

const User = require('../models/userModel');

/**
 * GET /api/users/me – Get current authenticated user's profile
 */
const getProfile = async (req, res) => {
    try {
        const [results] = await User.findById(req.user.id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/users/me – Update own profile
 * Body: { full_name, email, phone, institution }
 */
const updateProfile = async (req, res) => {
    const { full_name, email, phone, institution } = req.body;

    if (!full_name || !email) {
        return res.status(400).json({ error: 'full_name and email are required.' });
    }

    try {
        await User.update(req.user.id, { full_name, email, phone, institution });
        res.json({ message: 'Profile updated successfully.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already in use.' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/users – List all users (Admin only)
 * Query: ?role=STUDENT|CUSTODIAN|ADMIN
 */
const getAllUsers = async (req, res) => {
    try {
        const [users] = await User.getAll(req.query.role || null);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET /api/users/:id – Get user by ID (Admin only)
 */
const getUserById = async (req, res) => {
    try {
        const [results] = await User.findById(req.params.id);
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * PUT /api/users/:id – Update user (Admin only)
 */
const updateUser = async (req, res) => {
    const { full_name, email, phone, institution } = req.body;

    if (!full_name || !email) {
        return res.status(400).json({ error: 'full_name and email are required.' });
    }

    try {
        await User.update(req.params.id, { full_name, email, phone, institution });
        res.json({ message: 'User updated successfully.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already in use.' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * DELETE /api/users/:id – Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
    try {
        await User.delete(req.params.id);
        res.json({ message: 'User deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getProfile, updateProfile, getAllUsers, getUserById, updateUser, deleteUser };
