require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const candidatesRouter = require('../routes/candidates');
const companiesRouter = require('../routes/companies');
const jobsRouter = require('../routes/jobs');
const skillsRouter = require('../routes/skills');
const usersRouter = require('../routes/users');
const jobApplicationsRouter = require('../routes/jobApplications');
const aiRouter = require('../routes/ai');
const projectsRouter = require('../routes/projects');

// Import middleware
const regionAccessMiddleware = require('../middleware/regionAccess');
const { verifyToken } = require('../controllers/userController');

// Import models
const { Candidate, Company, Job, Skill, User, JobApplication , Project } = require('../models');

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
    'Cache-Control'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Remove duplicate body parser
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
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

// Enhanced debug middleware
app.use((req, res, next) => {
  console.log(`\n🌐 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  console.log('📋 Content-Type:', req.headers['content-type']);
  console.log('📋 Content-Length:', req.headers['content-length']);
  console.log('🔑 Authorization:', req.headers['authorization'] ? 'Present' : 'Missing');
  console.log('🌍 Origin:', req.headers['origin']);
  console.log('🌍 Referer:', req.headers['referer']);
  
  // Add CORS headers for debugging
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token, Cache-Control');
  
  // Check if body is parsed correctly
  if (req.method !== 'GET' && req.headers['content-type']?.includes('application/json')) {
    console.log('🔍 Body keys:', Object.keys(req.body));
    console.log('🔍 Has password:', 'password' in req.body);
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

// Routes without region access middleware
app.use('/api/skills', verifyToken, skillsRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', verifyToken, aiRouter);
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
