const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Candidate = require('../models/candidate');
const Company = require('../models/company');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Unified token verification middleware
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    let user = null;
    let userType = null;

    // Check if it's a User (CRM admin) token
    if (decoded.userId) {
      user = await User.findById(decoded.userId)
        .select('-password')
        .lean();
      userType = 'user';
    }
    // Check if it's a Candidate token
    else if (decoded.id && decoded.role === 'candidate') {
      user = await Candidate.findById(decoded.id)
        .select('-password')
        .lean();
      userType = 'candidate';
    }
    // Check if it's a Company/Employer token
    else if (decoded.id && decoded.role === 'employer') {
      user = await Company.findById(decoded.id)
        .select('-password')
        .lean();
      userType = 'company';
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is active
    if (userType === 'user' && !user.isActive) {
      return res.status(401).json({ message: 'User account is deactivated' });
    }
    if (userType === 'candidate' && !user.isActive) {
      return res.status(401).json({ message: 'Candidate account is deactivated' });
    }
    if (userType === 'company' && user.status !== 'active') {
      return res.status(401).json({ message: 'Company account is deactivated' });
    }

    // Set user and decoded info on request
    req.user = user;
    req.userType = userType;
    req.token = token;
    req.decoded = decoded;

    // For region-based filtering, set userRegion
    if (userType === 'user' && user.region) {
      req.userRegion = user.region.toLowerCase();
    } else if ((userType === 'candidate' || userType === 'company') && user.location) {
      req.userRegion = user.location.toLowerCase();
    }

    console.log('🔐 Token verified for user:', {
      id: user._id,
      email: user.email,
      type: userType,
      role: user.role || userType,
      region: req.userRegion
    });

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = { verifyToken }; 