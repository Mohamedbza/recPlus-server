require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Import routes
const candidatesRouter = require('../routes/candidates');
const companiesRouter = require('../routes/companies');
const jobsRouter = require('../routes/jobs');
const skillsRouter = require('../routes/skills');
const usersRouter = require('../routes/users');
const jobApplicationsRouter = require('../routes/jobApplications');
const aiRouter = require('../routes/ai');
const projectsRouter = require('../routes/projects');
const calendarTasksRouter = require('../routes/calendarTasks');

// Import middleware
const regionAccessMiddleware = require('../middleware/regionAccess');
const { verifyToken } = require('../controllers/userController');

// Import models
const { Candidate, Company, Job, Skill, User, JobApplication , Project, CalendarTask } = require('../models');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: [
    'https://rec-website-gules.vercel.app',
    'https://recplus.vercel.app',
    'https://rec-plus-server.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Auth-Token',
    'Cache-Control',
    'Pragma',
    'Expires',
    'Content-Length',
    'Content-Disposition'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Apply CORS middleware properly
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Remove duplicate body parser
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Skip verification for multipart/form-data
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      return;
    }
    
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        message: 'Invalid JSON in request body',
        error: e.message 
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Add URL-encoded parser for form data
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Enhanced debug middleware
app.use((req, res, next) => {
  console.log(`\n🌐 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('📋 Content-Type:', req.headers['content-type']);
  console.log('📋 Content-Length:', req.headers['content-length']);
  console.log('🔑 Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
  console.log('🌍 Origin:', req.headers['origin']);
  console.log('🌍 Referer:', req.headers['referer']);
  
  // CORS is now handled by the cors middleware above
  
  // Check if body is parsed correctly (skip for multipart/form-data)
  if (req.method !== 'GET' && req.headers['content-type']?.includes('application/json')) {
    console.log('🔍 Body keys:', Object.keys(req.body));
    console.log('🔍 Has password:', 'password' in req.body);
  }
  
  // Handle multipart/form-data requests
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    console.log('📁 Multipart form data detected');
  }
  
  next();
});

const DB = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(DB)
  .then(() => console.log('MongoDB connection successful'))
  .catch((e) => console.error('MongoDB connection error:', e));

// Routes with region access middleware
console.log('🔗 Mounting routes...');

// Public registration routes (no authentication required)
app.post('/api/candidates/register', (req, res, next) => {
  // Import the registerCandidate function directly
  const { registerCandidate } = require('../controllers/candidateController');
  registerCandidate(req, res, next);
});

app.post('/api/companies/register', (req, res, next) => {
  // Import the registerCompany function directly
  const { registerCompany } = require('../controllers/companyController');
  registerCompany(req, res, next);
});

// Protected routes with authentication and region access
app.use('/api/candidates', verifyToken, regionAccessMiddleware, candidatesRouter);
app.use('/api/companies', verifyToken, regionAccessMiddleware, companiesRouter);
app.use('/api/jobs', verifyToken, regionAccessMiddleware, jobsRouter);
app.use('/api/job-applications', verifyToken, regionAccessMiddleware, jobApplicationsRouter);
app.use('/api/projects', verifyToken, regionAccessMiddleware, projectsRouter);
app.use('/api/calendar-tasks', verifyToken, regionAccessMiddleware, calendarTasksRouter);

// Routes without region access middleware
app.use('/api/skills', verifyToken, skillsRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);

// Direct CV Analysis Route (no middleware interference)
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.pdf', '.txt', '.md', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${fileExtension}. Please upload PDF, TXT, MD, or DOCX files.`));
    }
  }
});

// Helper function to extract text from uploaded file
const extractTextFromFile = async (file) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (fileExtension === '.txt' || fileExtension === '.md') {
      const dataBuffer = fs.readFileSync(file.path);
      return dataBuffer.toString('utf8');
    } else if (fileExtension === '.docx') {
      const dataBuffer = fs.readFileSync(file.path);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
    } else {
      throw new Error(`Unsupported file type: ${fileExtension}. Please upload PDF, DOCX, TXT, or MD files.`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
};

// Direct CV Analysis Route
app.options('/api/ai/analyze-cv-direct', (req, res) => {
  console.log('🔍 OPTIONS request received for CV analysis');
  console.log('🌍 Origin:', req.headers.origin);
  console.log('📋 Content-Type:', req.headers['content-type']);
  console.log('📋 User-Agent:', req.headers['user-agent']);
  
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  return res.status(200).end();
});
app.post('/api/ai/analyze-cv-direct', upload.single('file'), async (req, res) => {
  console.log('📤 POST request received for CV analysis');
  console.log('🌍 Origin:', req.headers.origin);
  console.log('📋 Content-Type:', req.headers['content-type']);
  console.log('📁 File uploaded:', req.file ? req.file.originalname : 'No file');
  console.log('📝 Text provided:', req.body.cvText ? 'Yes' : 'No');
  
  try {
    let cvText = req.body.cvText;
    
    // If no text in body, check for uploaded file
    if (!cvText && req.file) {
      console.log('Processing uploaded file:', req.file.originalname);
      cvText = await extractTextFromFile(req.file);
      
      // Clean up uploaded file
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    }

    if (!cvText) {
      return res.status(400).json({
        success: false,
        message: 'CV text is required. Please provide cvText in request body or upload a file.'
      });
    }

    console.log('Analyzing CV with direct route');

    // Basic CV text analysis
    const cvTextLower = cvText.toLowerCase();
    const skills = [];
    const education = [];
    const experience = [];
    
    // Skill extraction
    const skillKeywords = [
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala',
      'typescript', 'dart', 'r', 'matlab', 'perl', 'bash', 'powershell', 'html', 'css', 'react', 'angular', 
      'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'asp.net', 'laravel', 'symfony', 'jquery', 
      'bootstrap', 'tailwind', 'sass', 'less', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 
      'oracle', 'sqlite', 'dynamodb', 'cassandra', 'neo4j', 'firebase', 'aws', 'azure', 'gcp', 'docker', 
      'kubernetes', 'jenkins', 'gitlab', 'github', 'git', 'terraform', 'ansible', 'puppet', 'chef', 'nginx', 
      'apache', 'machine learning', 'ai', 'artificial intelligence', 'data science', 'analytics', 'tensorflow', 
      'pytorch', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'spark', 'hadoop', 
      'kafka', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova', 'android', 'ios', 'agile', 'scrum', 
      'kanban', 'jira', 'confluence', 'slack', 'microsoft office', 'photoshop', 'illustrator', 'figma', 
      'sketch', 'blender', 'unity', 'unreal engine', 'salesforce', 'hubspot', 'zapier', 'airtable'
    ];
    
    skillKeywords.forEach(skill => {
      const skillVariations = [
        skill, skill.replace('.', ''), skill.replace('-', ' '), skill.replace(' ', ''),
        skill.toUpperCase(), skill.charAt(0).toUpperCase() + skill.slice(1)
      ];
      
      const found = skillVariations.some(variation => 
        cvTextLower.includes(variation.toLowerCase())
      );
      
      if (found) {
        const displaySkill = skill.includes('.') ? skill.toUpperCase() : 
                           skill.charAt(0).toUpperCase() + skill.slice(1);
        if (!skills.includes(displaySkill)) {
          skills.push(displaySkill);
        }
      }
    });
    
    // Education extraction
    const educationKeywords = ['university', 'college', 'bachelor', 'master', 'phd', 'degree', 'school'];
    const lines = cvText.split('\n');
    
    lines.forEach((line, index) => {
      const lineLower = line.toLowerCase();
      if (educationKeywords.some(keyword => lineLower.includes(keyword))) {
        const degreeMatch = line.match(/(bachelor|master|phd|degree|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?)/i);
        const yearMatch = line.match(/(20\d{2})/);
        
        if (degreeMatch) {
          const degree = degreeMatch[0].toUpperCase();
          const institution = line.trim().length > 0 ? line.trim() : 'Institution';
          const year = yearMatch ? yearMatch[0] : '2024';
          
          const existing = education.find(edu => 
            edu.institution.toLowerCase().includes(institution.toLowerCase()) ||
            edu.degree.toLowerCase().includes(degree.toLowerCase())
          );
          
          if (!existing) {
            education.push({
              degree: degree,
              institution: institution,
              field: 'Field of Study',
              start_year: (parseInt(year) - 4).toString(),
              end_year: year
            });
          }
        }
      }
    });
    
    // Experience extraction
    const experienceKeywords = ['experience', 'work', 'job', 'position', 'role', 'employment'];
    const jobTitles = [
      'developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant',
      'specialist', 'coordinator', 'assistant', 'director', 'lead', 'architect',
      'programmer', 'administrator', 'supervisor', 'coordinator'
    ];
    
    lines.forEach((line, index) => {
      const lineLower = line.toLowerCase();
      const hasJobKeywords = experienceKeywords.some(keyword => lineLower.includes(keyword)) ||
                           jobTitles.some(title => lineLower.includes(title));
      
      if (hasJobKeywords) {
        const titleMatch = line.match(new RegExp(`(${jobTitles.join('|')})`, 'i'));
        const yearMatch = line.match(/(20\d{2})/);
        
        if (titleMatch || line.trim().length > 10) {
          const title = titleMatch ? titleMatch[0].charAt(0).toUpperCase() + titleMatch[0].slice(1) : 'Position';
          const company = line.trim().length > 0 ? line.trim() : 'Company';
          const year = yearMatch ? yearMatch[0] : '2024';
          
          const existing = experience.find(exp => 
            exp.company.toLowerCase().includes(company.toLowerCase()) ||
            exp.title.toLowerCase().includes(title.toLowerCase())
          );
          
          if (!existing) {
            experience.push({
              title: title,
              company: company,
              duration: '2 years',
              start_date: `${parseInt(year) - 2}-01`,
              end_date: `${year}-12`,
              current: false,
              responsibilities: ['Responsibility 1', 'Responsibility 2']
            });
          }
        }
      }
    });
    
    const experienceYears = Math.max(0, experience.length * 2);
    
    let summary = '';
    if (skills.length > 0) {
      summary += `Professional with expertise in ${skills.slice(0, 3).join(', ')}`;
      if (skills.length > 3) {
        summary += ` and ${skills.length - 3} other technologies`;
      }
    } else {
      summary += 'Professional candidate';
    }
    
    if (experience.length > 0) {
      summary += ` with ${experienceYears} years of experience`;
    }
    
    if (education.length > 0) {
      const highestDegree = education.find(edu => 
        edu.degree.toLowerCase().includes('phd') || 
        edu.degree.toLowerCase().includes('master') || 
        edu.degree.toLowerCase().includes('bachelor')
      );
      if (highestDegree) {
        summary += `, holding a ${highestDegree.degree} degree`;
      }
    }
    
    summary += '. Skilled in problem-solving and team collaboration.';
    
    const analysisData = {
      summary: summary,
      total_experience_years: experienceYears,
      skills: skills.length > 0 ? skills : ['Skills extracted from CV text would appear here'],
      education: education.length > 0 ? education : [
        {
          degree: 'Sample Degree',
          institution: 'Sample University',
          field: 'Computer Science',
          start_year: '2018',
          end_year: '2022'
        }
      ],
      experience: experience.length > 0 ? experience : [
        {
          title: 'Sample Position',
          company: 'Sample Company',
          duration: '2 years',
          start_date: '2022-01',
          end_date: '2024-01',
          current: false,
          responsibilities: ['Sample responsibility 1', 'Sample responsibility 2']
        }
      ],
      source: 'direct-route'
    };

    const fileInfo = req.file ? {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : null;

    res.status(200).json({
      success: true,
      data: {
        cv_analysis: analysisData,
        job_matches: [],
        file_info: fileInfo
      }
    });

  } catch (error) {
    console.error('Error analyzing CV:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while analyzing CV',
      error: error.message
    });
  }
});

console.log('✅ All routes mounted successfully');

// Add authentication debug route
app.get('/api/debug/auth', verifyToken, (req, res) => {
  res.json({
    message: 'Authentication debug info',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      region: req.user.region
    },
    token: req.headers.authorization?.replace('Bearer ', '')
  });
});

app.get('/', (req, res) => {
  res.send('CRM Server is running!');
});

// Debug route to list all routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push(`${Object.keys(handler.route.methods)[0].toUpperCase()} ${middleware.regexp.source}${handler.route.path}`);
        }
      });
    }
  });
  res.json({ routes });
});

// Add a test route to verify server is responding
app.get('/api/test', (req, res) => {
  console.log('✅ TEST: /api/test endpoint hit');
  console.log('🌍 Origin:', req.headers['origin']);
  res.json({ 
    success: true, 
    message: 'Server is responding',
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    origin: req.headers['origin'],
    corsEnabled: true
  });
});

// Add CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  console.log('✅ CORS TEST: /api/cors-test endpoint hit');
  console.log('🌍 Origin:', req.headers['origin']);
  console.log('🌍 Method:', req.method);
  console.log('🌍 Headers:', req.headers);
  
  res.json({ 
    success: true, 
    message: 'CORS test endpoint',
    timestamp: new Date().toISOString(),
    origin: req.headers['origin'],
    method: req.method,
    corsHeaders: {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    }
  });
});

// Add authentication test endpoint (no auth required)
app.get('/api/auth-test', (req, res) => {
  console.log('✅ Auth Test endpoint hit');
  console.log('🔑 Authorization header:', req.headers['authorization'] ? 'Present' : 'Missing');
  res.json({ 
    success: true, 
    message: 'Auth test endpoint accessible',
    hasAuthHeader: !!req.headers['authorization'],
    timestamp: new Date().toISOString()
  });
});

// Add specific test for /api/users/me endpoint
app.get('/api/users/me-test', (req, res) => {
  console.log('✅ Users/me Test endpoint hit');
  console.log('🔑 Authorization header:', req.headers['authorization'] ? 'Present' : 'Missing');
  console.log('🌍 Origin:', req.headers['origin']);
  
  res.json({ 
    success: true, 
    message: 'Users/me test endpoint accessible',
    hasAuthHeader: !!req.headers['authorization'],
    origin: req.headers['origin'],
    timestamp: new Date().toISOString()
  });
});

// Add 404 handler for debugging
app.use('/api/*', (req, res) => {
  console.log('🔍 DEBUG: Unmatched API route accessed:');
  console.log('   📍 Method:', req.method);
  console.log('   📍 Original URL:', req.originalUrl);
  console.log('   📍 Path:', req.path);
  console.log('   📍 Available routes should include: /api/ai/generate-email');
  console.log('   📍 Timestamp:', new Date().toISOString());
  
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      'GET /api/test',
      'POST /api/candidates/register',
      'POST /api/companies/register',
      'POST /api/ai/generate-email',
      'POST /api/ai/analyze-cv',
      'GET /debug/routes'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 CORS enabled for origins: https://rec-website-gules.vercel.app, https://recplus.vercel.app, localhost:3000, localhost:3001, localhost:5173, localhost:4173`);
  console.log(`📊 Debug routes available at: http://localhost:${PORT}/debug/routes`);
  console.log(`🧪 Test endpoint available at: http://localhost:${PORT}/api/test`);
  console.log(`🌍 CORS test endpoint available at: http://localhost:${PORT}/api/cors-test`);
  console.log(`📧 Email generation endpoint should be at: http://localhost:${PORT}/api/ai/generate-email`);
  console.log(`📄 CV Analysis direct endpoint: http://localhost:${PORT}/api/ai/analyze-cv-direct`);
});

// Export models
module.exports = app;
module.exports.Candidate = Candidate;
module.exports.Company = Company;
module.exports.Job = Job;
module.exports.Skill = Skill;
module.exports.User = User;
module.exports.JobApplication = JobApplication;
module.exports.Project = Project;
