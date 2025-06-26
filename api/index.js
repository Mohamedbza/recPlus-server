require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
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

// Import models
const { Candidate, Company, Job, Skill, User, JobApplication , Project } = require('../models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  console.log('📦 Request body:', req.body);
  console.log('📋 Request headers:', req.headers);
  next();
});

const DB = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(DB)
  .then(() => console.log('MongoDB connection successful'))
  .catch((e) => console.error('MongoDB connection error:', e));

// Routes 
console.log('🔗 Mounting routes...');
app.use('/api/candidates', candidatesRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/users', usersRouter);
app.use('/api/job-applications', jobApplicationsRouter);
app.use('/api/ai', aiRouter);
console.log('✅ All routes mounted successfully');
app.use('/api/projects', projectsRouter);

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
  res.json({ 
    success: true, 
    message: 'Server is responding',
    timestamp: new Date().toISOString(),
    url: req.originalUrl
  });
});

// Add 404 handler for debugging
app.use('/api/*', (req, res, next) => {
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
      'POST /api/ai/generate-email',
      'POST /api/ai/analyze-cv',
      'GET /debug/routes'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Debug routes available at: http://localhost:${PORT}/debug/routes`);
  console.log(`🧪 Test endpoint available at: http://localhost:${PORT}/api/test`);
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
