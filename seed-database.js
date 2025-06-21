require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Candidate = require('./models/candidate');
const Company = require('./models/company');
const Job = require('./models/job');
const Skill = require('./models/skill');
const User = require('./models/user');
const Application = require('./models/application');

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

// Clear existing data
const clearDatabase = async () => {
  try {
    await Candidate.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Skill.deleteMany({});
    await User.deleteMany({});
    await Application.deleteMany({});
    console.log('🗑️  Existing data cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

// Seed Skills
const seedSkills = async () => {
  const skills = [
    // Frontend Skills
    { name: 'React', category: 'Frontend', description: 'JavaScript library for building user interfaces', level: 'intermediate' },
    { name: 'Vue.js', category: 'Frontend', description: 'Progressive JavaScript framework', level: 'intermediate' },
    { name: 'Angular', category: 'Frontend', description: 'TypeScript-based web application framework', level: 'advanced' },
    { name: 'HTML5', category: 'Frontend', description: 'Markup language for web development', level: 'beginner' },
    { name: 'CSS3', category: 'Frontend', description: 'Styling language for web development', level: 'beginner' },
    { name: 'JavaScript', category: 'Frontend', description: 'Programming language for web development', level: 'intermediate' },
    { name: 'TypeScript', category: 'Frontend', description: 'Typed superset of JavaScript', level: 'intermediate' },
    
    // Backend Skills
    { name: 'Node.js', category: 'Backend', description: 'JavaScript runtime for server-side development', level: 'intermediate' },
    { name: 'Python', category: 'Backend', description: 'High-level programming language', level: 'intermediate' },
    { name: 'Java', category: 'Backend', description: 'Object-oriented programming language', level: 'advanced' },
    { name: 'C#', category: 'Backend', description: 'Microsoft programming language', level: 'intermediate' },
    { name: 'PHP', category: 'Backend', description: 'Server-side scripting language', level: 'intermediate' },
    { name: 'Ruby', category: 'Backend', description: 'Dynamic programming language', level: 'intermediate' },
    
    // Database Skills
    { name: 'MongoDB', category: 'Database', description: 'NoSQL document database', level: 'intermediate' },
    { name: 'MySQL', category: 'Database', description: 'Relational database management system', level: 'intermediate' },
    { name: 'PostgreSQL', category: 'Database', description: 'Advanced relational database', level: 'advanced' },
    { name: 'Redis', category: 'Database', description: 'In-memory data structure store', level: 'intermediate' },
    
    // DevOps Skills
    { name: 'Docker', category: 'DevOps', description: 'Containerization platform', level: 'intermediate' },
    { name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration platform', level: 'advanced' },
    { name: 'AWS', category: 'DevOps', description: 'Amazon Web Services cloud platform', level: 'intermediate' },
    { name: 'Jenkins', category: 'DevOps', description: 'Continuous integration tool', level: 'intermediate' },
    
    // Design Skills
    { name: 'Figma', category: 'Design', description: 'Design and prototyping tool', level: 'beginner' },
    { name: 'Adobe XD', category: 'Design', description: 'User experience design tool', level: 'beginner' },
    { name: 'Photoshop', category: 'Design', description: 'Image editing software', level: 'intermediate' }
  ];

  const createdSkills = await Skill.insertMany(skills);
  console.log(`✅ ${createdSkills.length} skills created`);
  return createdSkills;
};

// Seed Companies
const seedCompanies = async () => {
  const companies = [
    {
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      phone: '+1-415-555-0101',
      address: '123 Tech Street, San Francisco, CA 94105',
      industry: 'Technology',
      location: 'San Francisco, CA',
      website: 'https://techcorp.com',
      description: 'Leading technology solutions provider specializing in cloud infrastructure',
      isVerified: true,
      totalEmployees: 500,
      foundedYear: 2015,
      companySize: 'large'
    },
    {
      name: 'InnovateLabs',
      email: 'hello@innovatelabs.com',
      phone: '+1-212-555-0102',
      address: '456 Innovation Ave, New York, NY 10001',
      industry: 'Software Development',
      location: 'New York, NY',
      website: 'https://innovatelabs.com',
      description: 'Innovative software development company focused on AI and machine learning',
      isVerified: true,
      totalEmployees: 250,
      foundedYear: 2018,
      companySize: 'medium'
    },
    {
      name: 'DataDrive Inc',
      email: 'info@datadrive.com',
      phone: '+1-512-555-0103',
      address: '789 Data Boulevard, Austin, TX 73301',
      industry: 'Data Analytics',
      location: 'Austin, TX',
      website: 'https://datadrive.com',
      description: 'Data analytics and business intelligence solutions',
      isVerified: false,
      totalEmployees: 150,
      foundedYear: 2020,
      companySize: 'small'
    },
    {
      name: 'CloudFirst Technologies',
      email: 'support@cloudfirst.com',
      phone: '+1-206-555-0104',
      address: '321 Cloud Way, Seattle, WA 98101',
      industry: 'Cloud Services',
      location: 'Seattle, WA',
      website: 'https://cloudfirst.com',
      description: 'Cloud-first technology solutions and consulting',
      isVerified: true,
      totalEmployees: 300,
      foundedYear: 2017,
      companySize: 'medium'
    },
    {
      name: 'MobileWave Studios',
      email: 'contact@mobilewave.com',
      phone: '+1-323-555-0105',
      address: '654 Mobile Street, Los Angeles, CA 90210',
      industry: 'Mobile Development',
      location: 'Los Angeles, CA',
      website: 'https://mobilewave.com',
      description: 'Mobile app development and design studio',
      isVerified: false,
      totalEmployees: 75,
      foundedYear: 2019,
      companySize: 'small'
    },
    {
      name: 'SecureNet Systems',
      email: 'security@securenet.com',
      phone: '+1-202-555-0106',
      address: '987 Security Plaza, Washington, DC 20001',
      industry: 'Cybersecurity',
      location: 'Washington, DC',
      website: 'https://securenet.com',
      description: 'Cybersecurity solutions for enterprise clients',
      isVerified: true,
      totalEmployees: 200,
      foundedYear: 2016,
      companySize: 'medium'
    }
  ];

  const createdCompanies = await Company.insertMany(companies);
  console.log(`✅ ${createdCompanies.length} companies created`);
  return createdCompanies;
};

// Seed Users
const seedUsers = async () => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      firstName: 'John',
      lastName: 'Manager',
      email: 'john.manager@company.com',
      password: hashedPassword,
      role: 'admin',
      department: 'HR',
      region: 'montreal',
      isActive: true
    },
    {
      firstName: 'Sarah',
      lastName: 'Recruiter',
      email: 'sarah.recruiter@company.com',
      password: hashedPassword,
      role: 'consultant',
      department: 'HR',
      region: 'dubai',
      isActive: true
    },
    {
      firstName: 'Mike',
      lastName: 'Interviewer',
      email: 'mike.interviewer@company.com',
      password: hashedPassword,
      role: 'consultant',
      department: 'Engineering',
      region: 'turkey',
      isActive: true
    },
    {
      firstName: 'Lisa',
      lastName: 'Coordinator',
      email: 'lisa.coordinator@company.com',
      password: hashedPassword,
      role: 'employer',
      department: 'HR',
      region: 'montreal',
      isActive: true
    },
    {
      firstName: 'David',
      lastName: 'Observer',
      email: 'david.observer@company.com',
      password: hashedPassword,
      role: 'employer',
      department: 'Management',
      region: 'dubai',
      isActive: false
    },
    {
      firstName: 'Ahmed',
      lastName: 'Administrator',
      email: 'ahmed.admin@company.com',
      password: hashedPassword,
      role: 'super_admin',
      department: 'IT',
      region: 'dubai',
      isActive: true
    },
    {
      firstName: 'Mehmet',
      lastName: 'Consultant',
      email: 'mehmet.consultant@company.com',
      password: hashedPassword,
      role: 'consultant',
      department: 'Operations',
      region: 'turkey',
      isActive: true
    },
    {
      firstName: 'Marie',
      lastName: 'Supervisor',
      email: 'marie.supervisor@company.com',
      password: hashedPassword,
      role: 'admin',
      department: 'Sales',
      region: 'montreal',
      isActive: true
    }
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`✅ ${createdUsers.length} users created`);
  return createdUsers;
};

// Seed Candidates
const seedCandidates = async (skills) => {
  const skillNames = skills.map(skill => skill.name);
  
  const candidates = [
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1-555-0101',
      address: '123 Main St, Boston, MA',
      dateOfBirth: new Date('1990-05-15'),
      experience: '5 years of full-stack development experience',
      skills: [skillNames[0], skillNames[5], skillNames[7]], // React, JavaScript, Node.js
      education: 'Bachelor of Computer Science',
      status: 'active'
    },
    {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@email.com',
      phone: '+1-555-0102',
      address: '456 Oak Ave, Chicago, IL',
      dateOfBirth: new Date('1988-03-22'),
      experience: '7 years of backend development with Python and Java',
      skills: [skillNames[8], skillNames[9], skillNames[14]], // Python, Java, MongoDB
      education: 'Master of Software Engineering',
      status: 'interview'
    },
    {
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol.davis@email.com',
      phone: '+1-555-0103',
      address: '789 Pine Rd, Portland, OR',
      dateOfBirth: new Date('1992-11-08'),
      experience: '3 years of frontend development with React and Vue',
      skills: [skillNames[0], skillNames[1], skillNames[6]], // React, Vue.js, TypeScript
      education: 'Bachelor of Information Technology',
      status: 'new'
    },
    {
      firstName: 'David',
      lastName: 'Wilson',
      email: 'david.wilson@email.com',
      phone: '+1-555-0104',
      address: '321 Elm St, Denver, CO',
      dateOfBirth: new Date('1985-07-12'),
      experience: '10 years of DevOps and cloud infrastructure',
      skills: [skillNames[17], skillNames[18], skillNames[19]], // Docker, Kubernetes, AWS
      education: 'Bachelor of Computer Engineering',
      status: 'offer'
    },
    {
      firstName: 'Eva',
      lastName: 'Brown',
      email: 'eva.brown@email.com',
      phone: '+1-555-0105',
      address: '654 Maple Dr, Miami, FL',
      dateOfBirth: new Date('1991-09-25'),
      experience: '4 years of full-stack development and database management',
      skills: [skillNames[0], skillNames[7], skillNames[14]], // React, Node.js, MySQL
      education: 'Bachelor of Computer Science',
      status: 'hired'
    },
    {
      firstName: 'Frank',
      lastName: 'Garcia',
      email: 'frank.garcia@email.com',
      phone: '+1-555-0106',
      address: '987 Cedar Ln, Phoenix, AZ',
      dateOfBirth: new Date('1989-12-03'),
      experience: '6 years of mobile development with React Native',
      skills: [skillNames[0], skillNames[5], skillNames[6]], // React, JavaScript, TypeScript
      education: 'Master of Computer Science',
      status: 'rejected'
    },
    {
      firstName: 'Grace',
      lastName: 'Martinez',
      email: 'grace.martinez@email.com',
      phone: '+1-555-0107',
      address: '159 Birch Ave, Nashville, TN',
      dateOfBirth: new Date('1993-04-18'),
      experience: '2 years of UI/UX design and frontend development',
      skills: [skillNames[3], skillNames[4], skillNames[21]], // HTML5, CSS3, Figma
      education: 'Bachelor of Design',
      status: 'waiting'
    },
    {
      firstName: 'Henry',
      lastName: 'Rodriguez',
      email: 'henry.rodriguez@email.com',
      phone: '+1-555-0108',
      address: '753 Spruce St, Baltimore, MD',
      dateOfBirth: new Date('1987-06-30'),
      experience: '8 years of backend development with C# and .NET',
      skills: [skillNames[10], skillNames[14], skillNames[19]], // C#, MySQL, AWS
      education: 'Master of Software Engineering',
      status: 'active'
    }
  ];

  const createdCandidates = await Candidate.insertMany(candidates);
  console.log(`✅ ${createdCandidates.length} candidates created`);
  return createdCandidates;
};

// Seed Jobs
const seedJobs = async (companies, skills) => {
  const skillNames = skills.map(skill => skill.name);
  
  const jobs = [
    {
      title: 'Senior Full Stack Developer',
      company: 'TechCorp Solutions',
      companyId: companies[0]._id,
      location: 'San Francisco, CA',
      jobeType: 'full-time',
      description: 'We are looking for a senior full stack developer to join our team and work on cutting-edge projects.',
      requirements: `${skillNames[0]}, ${skillNames[5]}, ${skillNames[7]}`, // React, JavaScript, Node.js
      salary: '$120,000 - $150,000',
      isRemote: false,
      isFeatured: true,
      status: 'active',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    {
      title: 'Frontend Developer',
      company: 'InnovateLabs',
      companyId: companies[1]._id,
      location: 'Remote',
      jobeType: 'full-time',
      description: 'Join our frontend team to build amazing user interfaces with modern technologies.',
      requirements: `${skillNames[0]}, ${skillNames[1]}, ${skillNames[6]}`, // React, Vue.js, TypeScript
      salary: '$80,000 - $110,000',
      isRemote: true,
      isFeatured: false,
      status: 'active',
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'DevOps Engineer',
      company: 'DataDrive Inc',
      companyId: companies[2]._id,
      location: 'Austin, TX',
      jobeType: 'full-time',
      description: 'Looking for a DevOps engineer to manage our cloud infrastructure and deployment pipelines.',
      requirements: `${skillNames[17]}, ${skillNames[18]}, ${skillNames[19]}`, // Docker, Kubernetes, AWS
      salary: '$100,000 - $130,000',
      isRemote: false,
      isFeatured: true,
      status: 'active',
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Backend Developer',
      company: 'CloudFirst Technologies',
      companyId: companies[3]._id,
      location: 'Seattle, WA',
      jobeType: 'full-time',
      description: 'Backend developer position for building scalable APIs and microservices.',
      requirements: `${skillNames[8]}, ${skillNames[13]}, ${skillNames[19]}`, // Python, MongoDB, AWS
      salary: '$90,000 - $120,000',
      isRemote: true,
      isFeatured: false,
      status: 'active',
      applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Mobile Developer',
      company: 'MobileWave Studios',
      companyId: companies[4]._id,
      location: 'Los Angeles, CA',
      jobeType: 'contract',
      description: 'Contract position for developing mobile applications for iOS and Android.',
      requirements: `${skillNames[0]}, ${skillNames[5]}, ${skillNames[6]}`, // React, JavaScript, TypeScript
      salary: '$70 - $90 per hour',
      isRemote: false,
      isFeatured: false,
      status: 'closed',
      applicationDeadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      title: 'Cybersecurity Specialist',
      company: 'SecureNet Systems',
      companyId: companies[5]._id,
      location: 'Washington, DC',
      jobeType: 'full-time',
      description: 'Join our security team to protect our clients from cyber threats.',
      requirements: `${skillNames[8]}, ${skillNames[9]}, ${skillNames[14]}`, // Python, Java, MySQL
      salary: '$110,000 - $140,000',
      isRemote: false,
      isFeatured: true,
      status: 'active',
      applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
    }
  ];

  const createdJobs = await Job.insertMany(jobs);
  console.log(`✅ ${createdJobs.length} jobs created`);
  return createdJobs;
};

// Seed Applications
const seedApplications = async (candidates, jobs, companies, users) => {
  const applications = [
    {
      candidateId: candidates[0]._id, // Alice Johnson
      jobId: jobs[0]._id, // Senior Full Stack Developer
      companyId: companies[0]._id, // TechCorp Solutions
      status: 'applied',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      coverLetter: 'I am very interested in this position and believe my skills align well with your requirements.',
      resume: 'alice_johnson_resume.pdf',
      feedback: 'Strong candidate with good React experience'
    },
    {
      candidateId: candidates[1]._id, // Bob Smith
      jobId: jobs[3]._id, // Backend Developer
      companyId: companies[3]._id, // CloudFirst Technologies
      status: 'interview',
      appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      coverLetter: 'With 7 years of backend experience, I am confident I can contribute to your team.',
      resume: 'bob_smith_resume.pdf',
      feedback: 'Scheduled for technical interview'
    },
    {
      candidateId: candidates[2]._id, // Carol Davis
      jobId: jobs[1]._id, // Frontend Developer
      companyId: companies[1]._id, // InnovateLabs
      status: 'offer',
      appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      coverLetter: 'I am excited about the opportunity to work with modern frontend technologies.',
      resume: 'carol_davis_resume.pdf',
      feedback: 'Excellent technical skills, offer extended'
    },
    {
      candidateId: candidates[3]._id, // David Wilson
      jobId: jobs[2]._id, // DevOps Engineer
      companyId: companies[2]._id, // DataDrive Inc
      status: 'hired',
      appliedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      coverLetter: 'My 10 years of DevOps experience makes me a perfect fit for this role.',
      resume: 'david_wilson_resume.pdf',
      feedback: 'Hired! Start date: next Monday'
    },
    {
      candidateId: candidates[4]._id, // Eva Brown
      jobId: jobs[0]._id, // Senior Full Stack Developer
      companyId: companies[0]._id, // TechCorp Solutions
      status: 'rejected',
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      coverLetter: 'I am interested in joining your development team.',
      resume: 'eva_brown_resume.pdf',
      feedback: 'Skills did not match senior level requirements'
    },
    {
      candidateId: candidates[5]._id, // Frank Garcia
      jobId: jobs[4]._id, // Mobile Developer
      companyId: companies[4]._id, // MobileWave Studios
      status: 'withdrawn',
      appliedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      coverLetter: 'I have extensive mobile development experience.',
      resume: 'frank_garcia_resume.pdf',
      feedback: 'Candidate withdrew application'
    }
  ];

  const createdApplications = await Application.insertMany(applications);
  console.log(`✅ ${createdApplications.length} applications created`);
  return createdApplications;
};

// Main seeding function
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...\n');
  console.log('=' .repeat(50));

  try {
    await connectDB();
    await clearDatabase();
    
    console.log('\n📝 Creating seed data...');
    
    // Seed in order to maintain relationships
    const skills = await seedSkills();
    const companies = await seedCompanies();
    const users = await seedUsers();
    const candidates = await seedCandidates(skills);
    const jobs = await seedJobs(companies, skills);
    const applications = await seedApplications(candidates, jobs, companies, users);
    
    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Database seeding completed successfully!');
    console.log('=' .repeat(50));
    
    console.log('\n📊 Summary:');
    console.log(`✅ Skills: ${skills.length}`);
    console.log(`✅ Companies: ${companies.length}`);
    console.log(`✅ Users: ${users.length} (across Montreal, Dubai, Turkey)`);
    console.log(`✅ Candidates: ${candidates.length}`);
    console.log(`✅ Jobs: ${jobs.length}`);
    console.log(`✅ Applications: ${applications.length}`);
    
    console.log('\n🔗 Test API Endpoints:');
    console.log('- GET http://localhost:3000/api/candidates');
    console.log('- GET http://localhost:3000/api/companies');
    console.log('- GET http://localhost:3000/api/jobs');
    console.log('- GET http://localhost:3000/api/skills');
    console.log('- GET http://localhost:3000/api/users');
    console.log('- GET http://localhost:3000/api/applications');
    
    console.log('\n🔍 Test with filters:');
    console.log('- GET http://localhost:3000/api/candidates?status=active');
    console.log('- GET http://localhost:3000/api/jobs?remote=true');
    console.log('- GET http://localhost:3000/api/applications?status=interview');
    console.log('- GET http://localhost:3000/api/skills?category=Frontend');
    console.log('- GET http://localhost:3000/api/users?region=montreal');
    console.log('- GET http://localhost:3000/api/users/region/dubai');
    console.log('- GET http://localhost:3000/api/users/region/turkey');
    
    console.log('\n🚀 Ready to test all APIs!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run the seeder
seedDatabase(); 