const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskNote,
  getAssignableUsersController,
  getTaskStats
} = require('../controllers/calendarTaskController');

// GET /api/calendar-tasks - Get tasks for current user based on role
router.get('/', getTasks);

// GET /api/calendar-tasks/stats - Get task statistics
router.get('/stats', getTaskStats);

// GET /api/calendar-tasks/assignable-users - Get users that can be assigned tasks
router.get('/assignable-users', getAssignableUsersController);

// POST /api/calendar-tasks - Create new task (admin/super-admin only)
router.post('/', createTask);

// GET /api/calendar-tasks/:id - Get specific task by ID
router.get('/:id', getTaskById);

// PUT /api/calendar-tasks/:id - Update task
router.put('/:id', updateTask);

// DELETE /api/calendar-tasks/:id - Delete task (soft delete)
router.delete('/:id', deleteTask);

// POST /api/calendar-tasks/:id/notes - Add note to task
router.post('/:id/notes', addTaskNote);

module.exports = router; 