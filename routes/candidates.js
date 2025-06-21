const express = require('express');
const router = express.Router();
const {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidatesBySkill
} = require('../controllers/candidateController');

// GET all candidates
router.get('/', getAllCandidates);

// GET candidate by ID
router.get('/:id', getCandidateById);

// POST create new candidate
router.post('/', createCandidate);

// PUT update candidate
router.put('/:id', updateCandidate);

// DELETE candidate
router.delete('/:id', deleteCandidate);

// GET candidates by skill
router.get('/skill/:skill', getCandidatesBySkill);

module.exports = router; 