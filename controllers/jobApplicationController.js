const JobApplication = require('../models/jobApplication');

// Get all job applications
const getAllJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, candidate, job } = req.query;
    
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
    
    const jobApplications = await JobApplication.find(query)
      .populate('candidate', 'firstName lastName email')
      .populate({
        path: 'job',
        select: 'title companyId',
        populate: { path: 'companyId', model: 'Company', select: 'name' }
      })
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
      .populate('job', 'title company description');
      
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
    /*
      ------------------------------------------------------------
      1.  Quick pre–validation
          ---------------------
          Before we even talk to MongoDB we make sure that the
          request body contains the absolutely required fields.
          If something is missing we short-circuit the request
          and let the caller know exactly which fields are absent.
      ------------------------------------------------------------
    */
    const requiredFields = ['candidate', 'job']; // keep this list in-sync with the schema!
    const missingFields  = requiredFields.filter(f => !req.body[f]);

    if (missingFields.length) {
      return res.status(400).json({
        type         : 'MissingRequiredFields',
        message      : 'Some required fields are missing',
        missingFields
      });
    }

    /*
      ------------------------------------------------------------
      2.  Create & persist the document
      ------------------------------------------------------------
    */
    const jobApplication = await JobApplication.create(req.body);

    /*
      ------------------------------------------------------------
      3.  Populate relations so the client receives a fully
          hydrated document in one round-trip.
      ------------------------------------------------------------
    */
    const populatedJobApplication = await JobApplication.findById(jobApplication._id)
      .populate('candidate', 'firstName lastName email')
      .populate({
        path   : 'job',
        select : 'title companyId',
        populate: { path: 'companyId', model: 'Company', select: 'name' }
      });

    return res.status(201).json(populatedJobApplication);
  } catch (error) {
    /*
      ------------------------------------------------------------
      4.  Granular error handling
      ------------------------------------------------------------
    */
    if (error.name === 'ValidationError') {
      // Mongoose validation failed (required, enum, minlength, etc.)
      const fieldErrors = Object.values(error.errors).map(e => ({
        field   : e.path,
        kind    : e.kind,
        message : e.message
      }));

      // Extract specifically the "required" violations so the UI
      // can highlight what is missing.
      const requiredViolations = fieldErrors
        .filter(e => e.kind === 'required')
        .map(e => e.field);

      return res.status(422).json({
        type          : 'ValidationError',
        message       : 'Job application validation failed',
        missingFields : requiredViolations,
        errors        : fieldErrors
      });
    }

    if (error.name === 'CastError') {
      // Wrong ObjectId format
      return res.status(400).json({
        type    : 'CastError',
        message : `Invalid ${error.path}: ${error.value}`
      });
    }

    if (error.code === 11000) {
      // Duplicate key violation
      return res.status(409).json({
        type    : 'DuplicateKeyError',
        message : 'Duplicate value entered',
        fields  : error.keyValue
      });
    }

    // Unknown / unhandled error
    return res.status(500).json({
      type    : 'ServerError',
      message : error.message || 'Internal server error'
    });
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
     .populate({
    path: 'job',
    select: 'title companyId',
    populate: { path: 'companyId', model: 'Company', select: 'name' }
  });
     
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

// Update job application status
const updateJobApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const jobApplication = await JobApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('candidate', 'firstName lastName email')
     .populate({
    path: 'job',
    select: 'title companyId',
    populate: { path: 'companyId', model: 'Company', select: 'name' }
  });
     
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
     .populate({
    path: 'job',
    select: 'title companyId',
    populate: { path: 'companyId', model: 'Company', select: 'name' }
  });
     
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
  updateJobApplicationStatus,
  addJobApplicationFeedback
}; 