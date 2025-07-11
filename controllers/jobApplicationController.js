const JobApplication = require('../models/jobApplication');
const Job = require('../models/job');
const Company = require('../models/company');
const Candidate = require('../models/candidate');

// Get all job applications
const getAllJobApplications = async (req, res) => {
  try {
    const startTime = Date.now();
    const { page = 1, limit = 10, search, status } = req.query;
    
    console.log('\n📝 Job Applications Query:');
    console.log('- User:', req.user ? {
      id: req.user._id,
      role: req.user.role,
      region: req.user.region
    } : 'No user');
    console.log('- User Region from middleware:', req.userRegion);
    
    let query = {};
    
    // Add region filter for non-super_admin users
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { 'candidate.firstName': { $regex: search, $options: 'i' } },
        { 'candidate.lastName': { $regex: search, $options: 'i' } },
        { 'job.title': { $regex: search, $options: 'i' } }
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
    
    console.log('- Final query:', JSON.stringify(query, null, 2));
    
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
    
    console.log(`- Found ${applications.length} applications out of ${total} total`);
    console.log('- First application:', applications[0] ? JSON.stringify(applications[0], null, 2) : 'No applications found');
    console.log('- Query execution time:', Date.now() - startTime, 'ms');
    
    const response = {
      jobApplications: applications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
    
    console.log('- Response structure:', Object.keys(response));
    console.log('- Response jobApplications array length:', response.jobApplications.length);
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error in getAllJobApplications:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get job application by ID
const getJobApplicationById = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // For non-super_admin users, filter by region
    if (req.userRegion) {
      query.location = req.userRegion;
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
      return res.status(404).json({ message: 'Application not found in your region' });
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
    
    console.log('\n📝 Creating Job Application:');
    console.log('- User:', req.user ? {
      id: req.user._id,
      role: req.user.role,
      region: req.user.region
    } : 'No user');
    console.log('- Initial application data:', applicationData);
    
    // For non-super_admin users, verify job and candidate are in their region
    if (req.userRegion) {
      // Check job location
      const job = await Job.findById(applicationData.job);
      console.log('- Job found:', job ? { id: job._id, location: job.location } : 'Not found');
      if (!job || job.location !== req.userRegion) {
        return res.status(403).json({ message: 'Cannot create application for job outside your region' });
      }
      
      // Check candidate location
      const candidate = await Candidate.findById(applicationData.candidate);
      console.log('- Candidate found:', candidate ? { id: candidate._id, location: candidate.location } : 'Not found');
      if (!candidate || candidate.location !== req.userRegion) {
        return res.status(403).json({ message: 'Cannot create application for candidate outside your region' });
      }
      
      // Set application location
      applicationData.location = req.userRegion;
      console.log('- Setting application location:', applicationData.location);
    }
    
    console.log('- Final application data:', applicationData);
    
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
    
    console.log('- Application created successfully:', { id: newApplication._id, location: newApplication.location });
    
    res.status(201).json(populatedApplication);
  } catch (error) {
    console.error('❌ Error in createJobApplication:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update job application
const updateJobApplication = async (req, res) => {
  try {
    // For non-super_admin users, verify application exists in their region
    if (req.userRegion) {
      const existingApplication = await JobApplication.findOne({
        _id: req.params.id,
        location: req.userRegion
      });
      
      if (!existingApplication) {
        return res.status(404).json({ message: 'Application not found in your region' });
      }
      
      // Force location to user's region
      req.body.location = req.userRegion;
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
    const query = { _id: req.params.id };
    
    // For non-super_admin users, verify application exists in their region
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    const application = await JobApplication.findOneAndDelete(query);
    if (!application) {
      return res.status(404).json({ message: 'Application not found in your region' });
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