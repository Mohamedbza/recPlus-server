// routes/ai.js
const express = require('express');
const router = express.Router();
const { generateEmail, analyzeCv } = require('../controllers/aiController');

// Debug middleware to log all requests to AI routes
router.use((req, res, next) => {
  console.log('🛣️  AI Route accessed:');
  console.log('   📍 Method:', req.method);
  console.log('   📍 Path:', req.path);
  console.log('   📍 Original URL:', req.originalUrl);
  console.log('   📍 Base URL:', req.baseUrl);
  console.log('   📍 Full URL:', `${req.baseUrl}${req.path}`);
  console.log('   📍 Timestamp:', new Date().toISOString());
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

// @route   POST /api/ai/chat-completion
// @desc    General chat completion using AI (defaults to chat mode)
// @access  Private
router.post('/chat-completion', generateEmail);

module.exports = router;
