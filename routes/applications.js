const express = require('express');
const router = express.Router();
const {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationsByCandidate,
  getApplicationsByJob,
  getApplicationsByCompany,
  updateApplicationStatus,
  addMessage
} = require('../controllers/applicationController');

// GET all applications
router.get('/', getAllApplications);

// GET application by ID
router.get('/:id', getApplicationById);

// POST create new application
router.post('/', createApplication);

// PUT update application
router.put('/:id', updateApplication);

// DELETE application
router.delete('/:id', deleteApplication);

// GET applications by candidate
router.get('/candidate/:candidateId', getApplicationsByCandidate);

// GET applications by job
router.get('/job/:jobId', getApplicationsByJob);

// GET applications by company
router.get('/company/:companyId', getApplicationsByCompany);

// PATCH update application status
router.patch('/:id/status', updateApplicationStatus);

// POST add message to application
router.post('/:id/message', addMessage);

module.exports = router; 