const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { checkRegionAccess } = require('../middleware/regionAccess');

// Public registration route (no middleware)
router.post('/register', candidateController.registerCandidate);

// Protected routes with region access check
router.get('/', checkRegionAccess, candidateController.getAllCandidates);
router.get('/:id', checkRegionAccess, candidateController.getCandidateById);
router.post('/', checkRegionAccess, candidateController.createCandidate);
router.put('/:id', checkRegionAccess, candidateController.updateCandidate);
router.delete('/:id', checkRegionAccess, candidateController.deleteCandidate);
router.get('/skills/:skill', checkRegionAccess, candidateController.getCandidatesBySkill);

module.exports = router; 