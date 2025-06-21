const Skill = require('../models/Skill');

exports.createSkill = async (req, res) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        res.status(201).json(skill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSkillById = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id);
        if (!skill) return res.status(404).json({ error: 'Skill not found' });
        res.json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!skill) return res.status(404).json({ error: 'Skill not found' });
        res.json(skill);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteSkill = async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) return res.status(404).json({ error: 'Skill not found' });
        res.json({ message: 'Skill deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.searchSkills = async (req, res) => {
    try {
        const { query } = req.query;
        const skills = await Skill.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
