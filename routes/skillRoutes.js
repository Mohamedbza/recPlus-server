const express = require('express');
const router = express.Router();
const {
    createSkill,
    getAllSkills,
    getSkillById,
    updateSkill,
    deleteSkill,
    searchSkills
} = require('../controllers/skillController');

router.post('/', createSkill);
router.get('/', getAllSkills);
router.get('/search', searchSkills);
router.get('/:id', getSkillById);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

module.exports = router;
