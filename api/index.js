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
const { Candidate, Company, Job, Skill, User, JobApplication, Project } = require('../models');

const app = express();

// Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Error logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Request Headers:', JSON.stringify(req.headers));
  console.log('Request Body:', JSON.stringify(req.body));
  next();
});

// MongoDB connection handling
let cachedDb = null;

async function connectToDatabase() {
  try {
    if (cachedDb && mongoose.connection.readyState === 1) {
      console.log('[MongoDB] Using cached connection');
      return cachedDb;
    }

    const DB = process.env.MONGODB_URI;
    if (!DB) {
      throw new Error('[MongoDB] MONGODB_URI is not defined in environment variables');
    }

    console.log('[MongoDB] Attempting to connect to database...');
    
    const connection = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('[MongoDB] Connection successful');
    cachedDb = connection;
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[MongoDB] Disconnected');
      cachedDb = null;
    });

    return cachedDb;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    console.error('[MongoDB] Stack trace:', error.stack);
    throw error;
  }
}

// Database connection middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('[Middleware] Database connection error:', error);
    console.error('[Middleware] Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Database connection failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes with error handling
const wrapAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.error(`[Route Error] ${req.method} ${req.path}:`, error);
      next(error);
    }
  };
};

// Health check route
app.get('/api/health', wrapAsync(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'CRM Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Apply routes with error handling
app.use('/api/candidates', candidatesRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/skills', skillsRouter);
app.use('/api/users', usersRouter);
app.use('/api/job-applications', jobApplicationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/projects', projectsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Handler] Uncaught error:', err);
  console.error('[Error Handler] Stack trace:', err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      type: err.name,
      path: req.path,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      timestamp: new Date().toISOString()
    }
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
}

module.exports = app;
