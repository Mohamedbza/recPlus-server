const Skill = require('../models/skill');

// Get all skills
const getAllSkills = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    const skills = await Skill.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 }); // Sort by name alphabetically
    
    const total = await Skill.countDocuments(query);
    
    res.json({
      skills,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get skill by ID
const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new skill
const createSkill = async (req, res) => {
  try {
    const skill = new Skill(req.body);
    const newSkill = await skill.save();
    res.status(201).json(newSkill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update skill
const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json(skill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete skill
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get skills by category
const getSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const skills = await Skill.find({
      category: { $regex: category, $options: 'i' },
      isActive: true
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get popular skills
const getPopularSkills = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const skills = await Skill.find({ isActive: true })
      .sort({ popularity: -1, usageCount: -1 })
      .limit(parseInt(limit));
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get skill categories
const getSkillCategories = async (req, res) => {
  try {
    const categories = await Skill.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillsByCategory,
  getPopularSkills,
  getSkillCategories
}; 