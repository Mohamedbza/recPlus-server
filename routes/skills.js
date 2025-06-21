const express = require('express');
const router = express.Router();
const {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillsByCategory,
  getPopularSkills,
  getSkillCategories
} = require('../controllers/skillController');

// GET all skills
router.get('/', getAllSkills);

// GET skill by ID
router.get('/:id', getSkillById);

// POST create new skill
router.post('/', createSkill);

// PUT update skill
router.put('/:id', updateSkill);

// DELETE skill
router.delete('/:id', deleteSkill);

// GET skills by category
router.get('/category/:category', getSkillsByCategory);

// GET popular skills
router.get('/popular/all', getPopularSkills);

// GET skill categories
router.get('/categories/all', getSkillCategories);

module.exports = router; 