const Application = require('../models/application');

// Get all applications
const getAllApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, candidateId, jobId, companyId } = req.query;
    
    let query = {};
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Candidate filter
    if (candidateId) {
      query.candidateId = candidateId;
    }
    
    // Job filter
    if (jobId) {
      query.jobId = jobId;
    }
    
    // Company filter
    if (companyId) {
      query.companyId = companyId;
    }
    
    const applications = await Application.find(query)
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'title company')
      .populate('companyId', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ appliedAt: -1 });
    
    const total = await Application.countDocuments(query);
    
    res.json({
      applications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('candidateId', 'firstName lastName email phone')
      .populate('jobId', 'title company description')
      .populate('companyId', 'name email');
      
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new application
const createApplication = async (req, res) => {
  try {
    const application = new Application(req.body);
    const newApplication = await application.save();
    const populatedApplication = await Application.findById(newApplication._id)
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'title company')
      .populate('companyId', 'name');
    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update application
const updateApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('candidateId', 'firstName lastName email')
     .populate('jobId', 'title company')
     .populate('companyId', 'name');
     
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete application
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications by candidate
const getApplicationsByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const applications = await Application.find({ candidateId })
      .populate('jobId', 'title company location')
      .populate('companyId', 'name')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications by job
const getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await Application.find({ jobId })
      .populate('candidateId', 'firstName lastName email')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get applications by company
const getApplicationsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const applications = await Application.find({ companyId })
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'title')
      .sort({ appliedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('candidateId', 'firstName lastName email')
     .populate('jobId', 'title company')
     .populate('companyId', 'name');
     
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add message to application
const addMessage = async (req, res) => {
  try {
    const { sender, message } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.messages.push({
      sender,
      message,
      timestamp: new Date()
    });
    
    await application.save();
    
    const updatedApplication = await Application.findById(req.params.id)
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'title company')
      .populate('companyId', 'name');
      
    res.json(updatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationsByCandidate,
  getApplicationsByJob,
  getApplicationsByCompany,
  updateApplicationStatus,
  addMessage
}; 