const JobApplication = require('../models/jobApplication');

// Get all job applications
const getAllJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, candidate, job, company } = req.query;
    
    let query = {};
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Candidate filter
    if (candidate) {
      query.candidate = candidate;
    }
    
    // Job filter
    if (job) {
      query.job = job;
    }
    
    // Company filter
    if (company) {
      query.company = company;
    }
    
    const jobApplications = await JobApplication.find(query)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company')
      .populate('company', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await JobApplication.countDocuments(query);
    
    res.json({
      jobApplications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job application by ID
const getJobApplicationById = async (req, res) => {
  try {
    const jobApplication = await JobApplication.findById(req.params.id)
      .populate('candidate', 'firstName lastName email phone')
      .populate('job', 'title company description')
      .populate('company', 'name email');
      
    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json(jobApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new job application
const createJobApplication = async (req, res) => {
  try {
    const jobApplication = new JobApplication(req.body);
    const newJobApplication = await jobApplication.save();
    const populatedJobApplication = await JobApplication.findById(newJobApplication._id)
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title company')
      .populate('company', 'name');
    res.status(201).json(populatedJobApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update job application
const updateJobApplication = async (req, res) => {
  try {
    const jobApplication = await JobApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('candidate', 'firstName lastName email')
     .populate('job', 'title company')
     .populate('company', 'name');
     
    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json(jobApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete job application
const deleteJobApplication = async (req, res) => {
  try {
    const jobApplication = await JobApplication.findByIdAndDelete(req.params.id);
    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json({ message: 'Job application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job applications by candidate
const getJobApplicationsByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const jobApplications = await JobApplication.find({ candidate: candidateId })
      .populate('job', 'title company location')
      .populate('company', 'name')
      .sort({ createdAt: -1 });
    res.json(jobApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job applications by job
const getJobApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobApplications = await JobApplication.find({ job: jobId })
      .populate('candidate', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(jobApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job applications by company
const getJobApplicationsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const jobApplications = await JobApplication.find({ company: companyId })
      .populate('candidate', 'firstName lastName email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });
    res.json(jobApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update job application status
const updateJobApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const jobApplication = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('candidate', 'firstName lastName email')
     .populate('job', 'title company')
     .populate('company', 'name');
     
    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json(jobApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add feedback to job application
const addJobApplicationFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;
    const jobApplication = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { feedback },
      { new: true, runValidators: true }
    ).populate('candidate', 'firstName lastName email')
     .populate('job', 'title company')
     .populate('company', 'name');
     
    if (!jobApplication) {
      return res.status(404).json({ message: 'Job application not found' });
    }
    res.json(jobApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllJobApplications,
  getJobApplicationById,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication,
  getJobApplicationsByCandidate,
  getJobApplicationsByJob,
  getJobApplicationsByCompany,
  updateJobApplicationStatus,
  addJobApplicationFeedback
}; 