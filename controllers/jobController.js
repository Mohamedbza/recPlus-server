const Job = require('../models/job');
const Company = require('../models/company');

// Get all jobs
const getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, jobType, experienceLevel, skills } = req.query;
    
    let query = {};
    
    // For non-super_admin users, filter by region
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
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
    
    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
      if (skillsArray.length > 0) {
        const skillsQuery = { skills: { $in: skillsArray.map(skill => new RegExp(skill, 'i')) } };
        
        // Combine with existing query
        if (query.$and) {
          query.$and.push(skillsQuery);
        } else if (query.$or) {
          query = {
            $and: [
              { $or: query.$or },
              skillsQuery
            ]
          };
        } else {
          query = {
            ...query,
            ...skillsQuery
          };
        }
      }
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Job type filter
    if (jobType) {
      query.jobType = jobType;
    }
    
    // Experience level filter
    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }
    
    const jobs = await Job.find(query)
      .populate('companyId', 'name logo location')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    // For non-super_admin users, filter by region
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    const job = await Job.findOne(query).populate('companyId', 'name logo location');
    if (!job) {
      return res.status(404).json({ message: 'Job not found in your region' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new job
const createJob = async (req, res) => {
  try {
    const jobData = req.body;
    
    // For non-super_admin users, verify company is in their region and set job location
    if (req.userRegion) {
      const company = await Company.findById(jobData.companyId);
      if (!company || company.location !== req.userRegion) {
        return res.status(403).json({ message: 'Cannot create job for company outside your region' });
      }
      jobData.location = req.userRegion;
    }
    
    const job = new Job(jobData);
    const newJob = await job.save();
    
    // Populate company details in response
    const populatedJob = await Job.findById(newJob._id).populate('companyId', 'name logo location');
    
    res.status(201).json(populatedJob);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    // For non-super_admin users, verify job exists in their region
    if (req.userRegion) {
      const existingJob = await Job.findOne({
        _id: req.params.id,
        location: req.userRegion
      });
      
      if (!existingJob) {
        return res.status(404).json({ message: 'Job not found in your region' });
      }
      
      // Force location to user's region
      req.body.location = req.userRegion;
    }
    
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('companyId', 'name logo location');
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // For non-super_admin users, verify job exists in their region
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    const job = await Job.findOneAndDelete(query);
    if (!job) {
      return res.status(404).json({ message: 'Job not found in your region' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob
}; 