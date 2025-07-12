const Candidate = require('../models/candidate');
const bcrypt = require('bcryptjs');

// Public registration endpoint for candidates
const registerCandidate = async (req, res) => {
  try {
    const { password, ...candidateData } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const candidate = new Candidate({
      ...candidateData,
      password: hashedPassword
    });
    
    const newCandidate = await candidate.save();
    
    // Remove password from response
    const candidateResponse = newCandidate.toObject();
    delete candidateResponse.password;
    
    res.status(201).json({
      success: true,
      data: candidateResponse
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get all candidates
const getAllCandidates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let query = {};
    
    // Add region filter for non-super_admin users
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { experience: { $regex: search, $options: 'i' } }
      ];
      
      // Ensure region filter is applied to search results
      if (req.userRegion) {
        query.$and = [
          { location: req.userRegion },
          { $or: query.$or }
        ];
        delete query.$or;
      }
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    const candidates = await Candidate.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Candidate.countDocuments(query);
    
    res.json({
      candidates,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get candidate by ID
const getCandidateById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // Add region check for non-super_admin users
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    const candidate = await Candidate.findOne(query);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new candidate
const createCandidate = async (req, res) => {
  try {
    const { password, ...candidateData } = req.body;
    
    // Force location to user's region for non-super_admin users
    if (req.userRegion) {
      candidateData.location = req.userRegion;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const candidate = new Candidate({
      ...candidateData,
      password: hashedPassword
    });
    
    const newCandidate = await candidate.save();
    
    // Remove password from response
    const candidateResponse = newCandidate.toObject();
    delete candidateResponse.password;
    
    res.status(201).json(candidateResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update candidate
const updateCandidate = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // For non-super_admin users, ensure candidate exists in their region
    if (req.userRegion) {
      const existingCandidate = await Candidate.findOne({
        _id: req.params.id,
        location: req.userRegion
      });
      
      if (!existingCandidate) {
        return res.status(404).json({ message: 'Candidate not found in your region' });
      }
      
      // Force location to user's region
      updateData.location = req.userRegion;
    }
    
    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }
    
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    // Remove password from response
    const candidateResponse = candidate.toObject();
    delete candidateResponse.password;
    
    res.json(candidateResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete candidate
const deleteCandidate = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // Add region check for non-super_admin users
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    const candidate = await Candidate.findOneAndDelete(query);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found in your region' });
    }
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get candidates by skill
const getCandidatesBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const query = {
      skills: { $regex: skill, $options: 'i' }
    };
    
    // Add region filter for non-super_admin users
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    const candidates = await Candidate.find(query);
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  getCandidatesBySkill,
  registerCandidate
}; 