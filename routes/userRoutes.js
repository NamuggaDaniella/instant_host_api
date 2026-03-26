/**
 * routes/userRoutes.js – User Management Routes (INSTANT HOST)
 *
 * Protected routes:
 *   GET    /api/users/me       → own profile (any authenticated user)
 *   PUT    /api/users/me       → update own profile
 *   GET    /api/users          → list all users (ADMIN)
 *   GET    /api/users/:id      → get user by ID (ADMIN)
 *   PUT    /api/users/:id      → update user (ADMIN)
 *   DELETE /api/users/:id      → delete user (ADMIN)
 */

const express = require('express');
const {
    getProfile, updateProfile, getAllUsers, getUserById, updateUser, deleteUser,
} = require('../controllers/userController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Any authenticated user can manage their own profile
router.get('/users/me', authenticateToken, getProfile);
router.put('/users/me', authenticateToken, updateProfile);

// Admin-only routes
router.get('/users', authenticateToken, authorize('ADMIN'), getAllUsers);
router.get('/users/:id', authenticateToken, authorize('ADMIN'), getUserById);
router.put('/users/:id', authenticateToken, authorize('ADMIN'), updateUser);
router.delete('/users/:id', authenticateToken, authorize('ADMIN'), deleteUser);

module.exports = router;
