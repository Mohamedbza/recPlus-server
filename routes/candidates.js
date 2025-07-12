const express = require('express');
const router = express.Router();
const {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  registerCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidatesBySkill
} = require('../controllers/candidateController');

// GET all candidates
router.get('/', getAllCandidates);

// GET candidate by ID
router.get('/:id', getCandidateById);

// POST create new candidate (with region filtering)
router.post('/', createCandidate);

// POST public registration (no region filtering)
router.post('/register', registerCandidate);

// PUT update candidate
router.put('/:id', updateCandidate);

// DELETE candidate
router.delete('/:id', deleteCandidate);

// GET candidates by skill
router.get('/skill/:skill', getCandidatesBySkill);

module.exports = router; 