const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
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

module.exports = router; 