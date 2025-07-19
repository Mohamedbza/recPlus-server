const express = require('express');
const router = express.Router();
const JobApplication = require('../models/jobApplication');
const Job = require('../models/job');
const Candidate = require('../models/candidate');
const { verifyToken } = require('../middleware/auth');

// POST create new job application (for candidates)
router.post('/', verifyToken, async (req, res) => {
  try {
    const applicationData = req.body;
    
    console.log('\n📝 Creating Job Application (Public):');
    console.log('- User Type:', req.userType);
    console.log('- User:', req.user ? {
      id: req.user._id,
      email: req.user.email,
      location: req.user.location
    } : 'No user');
    console.log('- Initial application data:', applicationData);
    
    // Only candidates can create job applications
    if (req.userType !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can apply for jobs' });
    }
    
    // Set candidate ID from authenticated user
    applicationData.candidate = req.user._id;
    
    // Verify job exists and is in the same region as candidate
    const job = await Job.findById(applicationData.job);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.location !== req.user.location) {
      return res.status(403).json({ message: 'Cannot apply for job outside your region' });
    }
    
    // Set application location to match candidate's location
    applicationData.location = req.user.location;
    
    // Check if candidate has already applied for this job
    const existingApplication = await JobApplication.findOne({
      candidate: req.user._id,
      job: applicationData.job
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
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
    console.error('❌ Error in createJobApplication (Public):', error);
    res.status(400).json({ message: error.message });
  }
});

// GET job applications for the authenticated candidate
router.get('/my-applications', verifyToken, async (req, res) => {
  try {
    // Only candidates can view their own applications
    if (req.userType !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can view their applications' });
    }
    
    const { page = 1, limit = 10 } = req.query;
    
    const applications = await JobApplication.find({ candidate: req.user._id })
      .populate({
        path: 'job',
        populate: {
          path: 'companyId',
          select: 'name logo location'
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await JobApplication.countDocuments({ candidate: req.user._id });
    
    const response = {
      jobApplications: applications,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    };
    
    res.json(response);
  } catch (error) {
    console.error('❌ Error in getMyApplications:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET specific job application for the authenticated candidate
router.get('/my-applications/:id', verifyToken, async (req, res) => {
  try {
    // Only candidates can view their own applications
    if (req.userType !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can view their applications' });
    }
    
    const application = await JobApplication.findOne({
      _id: req.params.id,
      candidate: req.user._id
    })
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
});

// GET recommended jobs for the authenticated candidate based on skills
router.get('/recommended-jobs', verifyToken, async (req, res) => {
  try {
    // Only candidates can get recommended jobs
    if (req.userType !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can get recommended jobs' });
    }
    
    const { limit = 5 } = req.query;
    
    // Get the candidate with their skills
    const candidate = await Candidate.findById(req.user._id);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    
    console.log(`Candidate ${candidate._id} has skills:`, candidate.skills);
    
    // Manually set the region for job filtering (since we don't have regionAccessMiddleware)
    const candidateRegion = req.user.location;
    
    console.log(`Searching for jobs in region: ${candidateRegion}`);
    
    // Get all active jobs in the candidate's region
    const jobs = await Job.find({ 
      status: 'active',
      location: candidateRegion 
    }).populate('companyId', 'name logo location');
    
    console.log(`Found ${jobs.length} jobs in region ${candidateRegion} for candidate ${candidate._id}`);
    
    if (jobs.length > 0) {
      console.log('Sample job skills:', jobs[0].skills);
    }
    
    // Calculate match scores for each job
    const jobsWithScores = jobs.map(job => {
      let matchScore = 0;
      let matchingSkills = [];
      
      if (job.skills && job.skills.length > 0 && candidate.skills && candidate.skills.length > 0) {
        const jobSkillNames = job.skills.map(skill => skill.toLowerCase());
        const candidateSkillNames = candidate.skills.map(skill => skill.toLowerCase());
        
        console.log(`Job "${job.title}" skills:`, jobSkillNames);
        console.log(`Candidate skills:`, candidateSkillNames);
        
        matchingSkills = jobSkillNames.filter(jobSkill => 
          candidateSkillNames.some(candidateSkill => 
            candidateSkill.includes(jobSkill) || jobSkill.includes(candidateSkill)
          )
        );
        
        matchScore = Math.round((matchingSkills.length / jobSkillNames.length) * 100);
        
        console.log(`Job "${job.title}" - Matching skills:`, matchingSkills, `Score: ${matchScore}%`);
      } else {
        console.log(`Job "${job.title}" - No skills to match. Job skills:`, job.skills, `Candidate skills:`, candidate.skills);
      }
      
      return {
        ...job.toObject(),
        matchScore,
        matchingSkills
      };
    });
    
    // Sort by match score (highest first) and limit results
    const sortedJobs = jobsWithScores
      .filter(job => job.matchScore > 0) // Only include jobs with some match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));
    
    console.log(`Returning ${sortedJobs.length} recommended jobs with match scores:`, 
      sortedJobs.map(job => ({ title: job.title, matchScore: job.matchScore }))
    );
    
    res.json({
      success: true,
      data: {
        candidate: {
          id: candidate._id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          skills: candidate.skills
        },
        jobs: sortedJobs,
        total: sortedJobs.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in getRecommendedJobs:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET debug endpoint to check jobs and candidates
router.get('/debug', verifyToken, async (req, res) => {
  try {
    // Only candidates can access debug info
    if (req.userType !== 'candidate') {
      return res.status(403).json({ message: 'Only candidates can access debug info' });
    }
    
    const candidate = await Candidate.findById(req.user._id);
    const allJobs = await Job.find({}).populate('companyId', 'name logo location');
    const activeJobs = await Job.find({ status: 'active' }).populate('companyId', 'name logo location');
    const regionJobs = await Job.find({ 
      status: 'active',
      location: req.user.location 
    }).populate('companyId', 'name logo location');
    
    res.json({
      candidate: {
        id: candidate._id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        location: candidate.location,
        skills: candidate.skills
      },
      jobs: {
        total: allJobs.length,
        active: activeJobs.length,
        inRegion: regionJobs.length,
        sample: regionJobs.slice(0, 3).map(job => ({
          id: job._id,
          title: job.title,
          location: job.location,
          status: job.status,
          skills: job.skills,
          company: job.companyId?.name
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 