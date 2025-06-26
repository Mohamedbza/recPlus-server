const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByTeamMember,
  getProjectsByStatus,
  updateProjectProgress,
  addTeamMember,
  removeTeamMember,
  addTask,
  updateTask,
  deleteTask,
  getTasksByAssignee
} = require('../controllers/projectController');

// GET all projects
router.get('/', getAllProjects);

// GET project by ID
router.get('/:id', getProjectById);

// POST create new project
router.post('/', createProject);

// PUT update project
router.put('/:id', updateProject);

// DELETE project
router.delete('/:id', deleteProject);

// GET projects by team member
router.get('/team-member/:userId', getProjectsByTeamMember);

// GET projects by status
router.get('/status/:status', getProjectsByStatus);

// PUT update project progress
router.put('/:id/progress', updateProjectProgress);

// POST add team member to project
router.post('/:id/team-members', addTeamMember);

// DELETE remove team member from project
router.delete('/:id/team-members/:userId', removeTeamMember);

// Task routes
// POST add task to project - Using :id to match the project ID parameter in other routes
router.post('/:id/tasks', addTask);

// PUT update task
router.put('/:id/tasks/:taskId', updateTask);

// DELETE task
router.delete('/:id/tasks/:taskId', deleteTask);

// GET tasks by assignee
router.get('/tasks/assignee/:userId', getTasksByAssignee);

module.exports = router; 