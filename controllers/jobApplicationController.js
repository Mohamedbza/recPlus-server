const JobApplication = require('../models/jobApplication');
const Job = require('../models/job');
const Company = require('../models/company');
const Candidate = require('../models/candidate');

// Get all job applications
const getAllJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    
    let query = {};
    
    // For non-super_admin users, first get companies in their region
    if (req.userRegion) {
      // Get companies in user's region
      const companyIds = await Company.find({ location: req.userRegion }).select('_id');
      
      // Get jobs from those companies
      const jobs = await Job.find({ companyId: { $in: companyIds } }).select('_id');
      
      // Filter applications for those jobs
      query.job = { $in: jobs.map(j => j._id) };
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    const applications = await JobApplication.find(query)
      .populate({
        path: 'job',
        populate: {
          path: 'companyId',
          select: 'name logo location'
        }
      })
      .populate('candidate', 'firstName lastName email location')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await JobApplication.countDocuments(query);
    
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

// Get job application by ID
const getJobApplicationById = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // For non-super_admin users, verify application is for job from company in their region
    if (req.userRegion) {
      const application = await JobApplication.findById(req.params.id)
        .populate({
          path: 'job',
          populate: {
            path: 'companyId',
            select: 'location'
          }
        });
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      if (application.job.companyId.location !== req.userRegion) {
        return res.status(403).json({ message: 'Cannot access application from company outside your region' });
      }
    }
    
    const application = await JobApplication.findOne(query)
      .populate({
        path: 'job',
        populate: {
          path: 'companyId',
          select: 'name logo location'
        }
      })
      .populate('candidate', 'firstName lastName email location');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new job application
const createJobApplication = async (req, res) => {
  try {
    const applicationData = req.body;
    
    // For non-super_admin users, verify job is from company in their region
    if (req.userRegion) {
      const job = await Job.findById(applicationData.job).populate('companyId', 'location');
      if (!job || job.companyId.location !== req.userRegion) {
        return res.status(403).json({ message: 'Cannot create application for job from company outside your region' });
      }
    }
    
    const application = new JobApplication(applicationData);
    const newApplication = await application.save();
    
    // Populate response
    const populatedApplication = await JobApplication.findById(newApplication._id)
      .populate({
        path: 'job',
        populate: {
          path: 'companyId',
          select: 'name logo location'
        }
      })
      .populate('candidate', 'firstName lastName email location');
    
    res.status(201).json(populatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update job application
const updateJobApplication = async (req, res) => {
  try {
    // For non-super_admin users, verify application is for job from company in their region
    if (req.userRegion) {
      const application = await JobApplication.findById(req.params.id)
        .populate({
          path: 'job',
          populate: {
            path: 'companyId',
            select: 'location'
          }
        });
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      if (application.job.companyId.location !== req.userRegion) {
        return res.status(403).json({ message: 'Cannot update application from company outside your region' });
      }
    }
    
    const application = await JobApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate({
      path: 'job',
      populate: {
        path: 'companyId',
        select: 'name logo location'
      }
    })
    .populate('candidate', 'firstName lastName email location');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete job application
const deleteJobApplication = async (req, res) => {
  try {
    // For non-super_admin users, verify application is for job from company in their region
    if (req.userRegion) {
      const application = await JobApplication.findById(req.params.id)
        .populate({
          path: 'job',
          populate: {
            path: 'companyId',
            select: 'location'
          }
        });
      
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      
      if (application.job.companyId.location !== req.userRegion) {
        return res.status(403).json({ message: 'Cannot delete application from company outside your region' });
      }
    }
    
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllJobApplications,
  getJobApplicationById,
  createJobApplication,
  updateJobApplication,
  deleteJobApplication
}; 