const express = require('express');
const router = express.Router();
const {
  loginUser,
  verifyToken,
  getCurrentUser,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUsersByRegion,
  getActiveUsers,
  updateUserStatus,
  updateConnectionStatus,
  getOnlineUsers
} = require('../controllers/userController');

// Public routes
// POST login
router.post('/login', loginUser);

// Protected routes (require authentication)
// GET current user
router.get('/me', verifyToken, getCurrentUser);

// GET all users
router.get('/', verifyToken, getAllUsers);

// GET user by ID
router.get('/:id', verifyToken, getUserById);

// POST create new user
router.post('/', verifyToken, createUser);

// PUT update user
router.put('/:id', verifyToken, updateUser);

// DELETE user
router.delete('/:id', verifyToken, deleteUser);

// GET users by role
router.get('/role/:role', verifyToken, getUsersByRole);

// GET users by region
router.get('/region/:region', verifyToken, getUsersByRegion);

// GET active users
router.get('/active/all', verifyToken, getActiveUsers);

// PATCH update user status
router.patch('/:id/status', verifyToken, updateUserStatus);

// PATCH update connection status
router.patch('/:id/connection', verifyToken, updateConnectionStatus);

// GET online users
router.get('/online/all', verifyToken, getOnlineUsers);

module.exports = router; 