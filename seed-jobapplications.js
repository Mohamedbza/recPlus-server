require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Candidate = require('./models/candidate');
const Company = require('./models/company');
const Job = require('./models/job');
const JobApplication = require('./models/jobApplication');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing jobapplications
const clearJobApplications = async () => {
  try {
    await Application.deleteMany({});
    console.log('🗑️  Existing jobapplications cleared');
  } catch (error) {
    console.error('❌ Error clearing jobapplications:', error);
  }
};

// Seed Job Applications
const createJobApplications = async () => {
  try {
    // Get existing data from database
    const candidates = await Candidate.find({});
    const jobs = await Job.find({});
    const companies = await Company.find({});

    if (candidates.length === 0 || jobs.length === 0 || companies.length === 0) {
      console.log('❌ Please run the main seed script first to create candidates, jobs, and companies');
      return;
    }

    const jobapplications = [
      {
        candidate: candidates[0]._id, // Alice Johnson
        job: jobs[0]._id, // Senior Full Stack Developer
        company: companies[0]._id, // TechCorp Solutions
        status: 'reviewed',
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        coverLetter: 'I am very interested in this position and believe my skills align well with your requirements. I have 5 years of experience in full-stack development and am passionate about creating scalable web applications.',
        resume: 'alice_johnson_resume.pdf',
        feedback: 'Strong candidate with good React experience. Technical skills match requirements well.',
        candidateRating: 4,
        companyRating: 5
      },
      {
        candidate: candidates[1]._id, // Bob Smith
        job: jobs[3]._id, // Backend Developer
        company: companies[3]._id, // CloudFirst Technologies
        status: 'interview',
        reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        coverLetter: 'With 7 years of backend experience, I am confident I can contribute to your team. I have extensive experience with Python, Java, and cloud platforms.',
        resume: 'bob_smith_resume.pdf',
        feedback: 'Scheduled for technical interview. Strong backend skills demonstrated.',
        interviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        interviewLocation: 'Seattle, WA',
        interviewType: 'onsite',
        interviewNotes: 'Candidate shows strong technical background. Prepare Python coding questions.',
        candidateRating: 4,
        companyRating: 4
      },
      {
        candidate: candidates[2]._id, // Carol Davis
        job: jobs[1]._id, // Frontend Developer
        company: companies[1]._id, // InnovateLabs
        status: 'offer',
        reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
        coverLetter: 'I am excited about the opportunity to work with modern frontend technologies. My experience with React and Vue.js aligns perfectly with your requirements.',
        resume: 'carol_davis_resume.pdf',
        feedback: 'Excellent technical skills, offer extended. Strong frontend portfolio.',
        offerAmount: 95000,
        offerCurrency: 'USD',
        offerDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        offerAccepted: null,
        candidateRating: 5,
        companyRating: 5
      },
      {
        candidate: candidates[3]._id, // David Wilson
        job: jobs[2]._id, // DevOps Engineer
        company: companies[2]._id, // DataDrive Inc
        status: 'hired',
        reviewedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        coverLetter: 'My 10 years of DevOps experience makes me a perfect fit for this role. I have managed large-scale cloud infrastructure and deployment pipelines.',
        resume: 'david_wilson_resume.pdf',
        feedback: 'Hired! Start date: next Monday. Excellent DevOps skills and team fit.',
        offerAmount: 115000,
        offerCurrency: 'USD',
        offerAccepted: true,
        candidateRating: 5,
        companyRating: 5
      },
      {
        candidate: candidates[4]._id, // Eva Brown
        job: jobs[0]._id, // Senior Full Stack Developer
        company: companies[0]._id, // TechCorp Solutions
        status: 'rejected',
        reviewedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        coverLetter: 'I am interested in joining your development team. I have experience with React and Node.js.',
        resume: 'eva_brown_resume.pdf',
        feedback: 'Skills did not match senior level requirements. Consider for mid-level positions.',
        candidateRating: 3,
        companyRating: 4
      },
      {
        candidate: candidates[5]._id, // Frank Garcia
        job: jobs[4]._id, // Mobile Developer
        company: companies[4]._id, // MobileWave Studios
        status: 'rejected',
        reviewedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        coverLetter: 'I have extensive mobile development experience with React Native and native platforms.',
        resume: 'frank_garcia_resume.pdf',
        feedback: 'Candidate withdrew application. Received better offer elsewhere.',
        candidateRating: 4,
        companyRating: 3
      },
      {
        candidate: candidates[6]._id, // Grace Martinez
        job: jobs[1]._id, // Frontend Developer
        company: companies[1]._id, // InnovateLabs
        status: 'reviewed',
        reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        coverLetter: 'As a UI/UX designer with frontend development skills, I bring a unique perspective to frontend development.',
        resume: 'grace_martinez_resume.pdf',
        feedback: 'Portfolio review in progress. Strong design skills, need to assess technical capabilities.',
        candidateRating: 3,
        companyRating: 4
      },
      {
        candidate: candidates[7]._id, // Henry Rodriguez
        job: jobs[5]._id, // Cybersecurity Specialist
        company: companies[5]._id, // SecureNet Systems
        status: 'offer',
        reviewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
        coverLetter: 'My experience with enterprise applications and security best practices makes me an ideal candidate for this cybersecurity role.',
        resume: 'henry_rodriguez_resume.pdf',
        feedback: 'offer for next round. Strong enterprise background and security knowledge.',
        candidateRating: 4,
        companyRating: 4
      },
      {
        candidate: candidates[0]._id, // Alice Johnson
        job: jobs[3]._id, // Backend Developer
        company: companies[3]._id, // CloudFirst Technologies
        status: 'reviewed',
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        coverLetter: 'I am also interested in backend development opportunities. I have experience with Node.js and databases.',
        resume: 'alice_johnson_resume.pdf',
        feedback: 'New application received. Will review alongside other candidates.',
        candidateRating: null,
        companyRating: null
      },
      {
        candidate: candidates[2]._id, // Carol Davis
        job: jobs[0]._id, // Senior Full Stack Developer
        company: companies[0]._id, // TechCorp Solutions
        status: 'reviewed',
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        coverLetter: 'I am applying for this senior position as I believe my frontend expertise combined with my willingness to learn backend technologies makes me a strong candidate.',
        resume: 'carol_davis_resume.pdf',
        feedback: 'Application under review. Good frontend skills, need to assess full-stack capabilities.',
        candidateRating: null,
        companyRating: null
      }
    ];

    const createdJobApplications = await JobApplication.insertMany(jobapplications);
    console.log(`✅ ${createdJobApplications.length} jobapplications created`);
    
    // Log summary by status
    const statusCounts = {};
    createdJobApplications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    console.log('\n📊 JobApplications by Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    return createdJobApplications;
  } catch (error) {
    console.error('❌ Error creating jobapplications:', error);
    throw error;
  }
};

// Main seeding function
const seedJobApplications = async () => {
  console.log('🌱 Starting jobapplications seeding...\n');
  console.log('=' .repeat(50));

  try {
    await connectDB();
    await clearJobApplications();
    
    console.log('\n📝 Creating jobapplications...');
    const jobapplications = await createJobApplications();
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Jobapplications seeding completed successfully!');
    console.log('=' .repeat(50));
    
    console.log('\n🔗 Test API Endpoints:');
    console.log('- GET http://localhost:3000/api/applications');
    console.log('- GET http://localhost:3000/api/applications?status=interview');
    console.log('- GET http://localhost:3000/api/applications?status=reviewed');
    console.log('- GET http://localhost:3000/api/applications?status=offer');
    console.log('- GET http://localhost:3000/api/applications?status=hired');
    console.log('- GET http://localhost:3000/api/applications?status=rejected');
    console.log('- GET http://localhost:3000/api/applications?status=rejected');
    
    console.log('\n🚀 Ready to test jobapplications API!');
    
  } catch (error) {
    console.error('❌ Error seeding jobapplications:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run the seeder
seedJobApplications(); 