const express = require('express');
const router = express.Router();
const {
  getAllJobApplications,
  getJobApplicationById,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication
} = require('../controllers/jobApplicationController');

// GET all job applications
router.get('/', getAllJobApplications);

// GET job application by ID
router.get('/:id', getJobApplicationById);

// POST create new job application
router.post('/', createJobApplication);

// PUT update job application
router.put('/:id', updateJobApplication);

// DELETE job application
router.delete('/:id', deleteJobApplication);

module.exports = router; 