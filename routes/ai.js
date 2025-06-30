// routes/ai.js
const express = require('express');
const router = express.Router();
const { generateEmail, analyzeCv,generateJobDescription } = require('../controllers/aiController');

// Debug middleware to log all requests to AI routes
router.use((req, res, next) => {
  console.log('🛣️  AI Route accessed:');
  next();
});

// @route   POST /api/ai/generate-email
// @desc    Generate email using AI
// @access  Private
router.post('/generate-email', generateEmail);

// @route   POST /api/ai/analyze-cv
// @desc    Analyze CV using AI
// @access  Private
router.post('/analyze-cv', analyzeCv);
router.post('/generate-job-description', generateJobDescription);

module.exports = router;
