const express = require('express');
const router = express.Router();
const {
  getAllJobApplications,
  getJobApplicationById,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
  getJobApplicationsByCandidate,
  getJobApplicationsByJob,
  getJobApplicationsByCompany,
  updateJobApplicationStatus,
  addJobApplicationFeedback
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

// GET job applications by candidate
router.get('/candidate/:candidateId', getJobApplicationsByCandidate);

// GET job applications by job
router.get('/job/:jobId', getJobApplicationsByJob);

// GET job applications by company
router.get('/company/:companyId', getJobApplicationsByCompany);

// PATCH update job application status
router.patch('/:id/status', updateJobApplicationStatus);

// PATCH add feedback to job application
router.patch('/:id/feedback', addJobApplicationFeedback);

module.exports = router; 