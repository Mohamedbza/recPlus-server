// routes/ai.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { generateEmail, analyzeCv, generateJobDescription, matchCandidatesToJob, matchJobsToCandidate } = require('../controllers/aiController');

// CORS configuration for AI routes
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
    'Content-Length',
    'Content-Disposition'
  ]
};

// Apply CORS to all AI routes
router.use(cors(corsOptions));

// Handle preflight requests for file uploads
router.options('*', cors(corsOptions));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!require('fs').existsSync(tempDir)) {
      require('fs').mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    const allowedTypes = ['.pdf', '.txt', '.md', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${fileExtension}. Please upload PDF, TXT, MD, or DOCX files.`));
    }
  }
});

// Debug middleware to log all requests to AI routes
router.use((req, res, next) => {
  console.log('🛣️  AI Route accessed:', req.method, req.path);
  console.log('🔑 Authorization header:', req.headers['authorization'] ? 'Present' : 'Missing');
  next();
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
});

// @route   POST /api/ai/generate-email
// @desc    Generate email using AI
// @access  Private
router.post('/generate-email', generateEmail);

// @route   POST /api/ai/analyze-cv
// @desc    Analyze CV using AI (supports both text and file uploads)
// @access  Private
router.post('/analyze-cv', cors(corsOptions), upload.single('file'), analyzeCv);

// @route   POST /api/ai/generate-job-description
// @desc    Generate job description using AI
// @access  Private
router.post('/generate-job-description', generateJobDescription);

// @route   GET /api/ai/match-candidates/:jobId
// @desc    Match candidates to a specific job based on skills
// @access  Private
router.get('/match-candidates/:jobId', matchCandidatesToJob);

// @route   GET /api/ai/match-jobs/:candidateId
// @desc    Match jobs to a specific candidate based on skills
// @access  Private
router.get('/match-jobs/:candidateId', matchJobsToCandidate);

module.exports = router;
