const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobsByCompany,
  getRemoteJobs,
  getFeaturedJobs
} = require('../controllers/jobController');

// GET all jobs
router.get('/', getAllJobs);

// GET job by ID
router.get('/:id', getJobById);

// POST create new job
router.post('/', createJob);

// PUT update job
router.put('/:id', updateJob);

// DELETE job
router.delete('/:id', deleteJob);

// GET jobs by company
router.get('/company/:companyId', getJobsByCompany);

// GET remote jobs
router.get('/remote/all', getRemoteJobs);

// GET featured jobs
router.get('/featured/all', getFeaturedJobs);

module.exports = router; 