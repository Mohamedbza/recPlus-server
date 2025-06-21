const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
  getActiveUsers,
  updateUserStatus
} = require('../controllers/userController');

// GET all users
router.get('/', getAllUsers);

// GET user by ID
router.get('/:id', getUserById);

// POST create new user
router.post('/', createUser);

// PUT update user
router.put('/:id', updateUser);

// DELETE user
router.delete('/:id', deleteUser);

// GET users by role
router.get('/role/:role', getUsersByRole);

// GET active users
router.get('/active/all', getActiveUsers);

// PATCH update user status
router.patch('/:id/status', updateUserStatus);

module.exports = router; 