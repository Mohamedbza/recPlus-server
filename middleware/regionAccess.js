const regionAccessMiddleware = (req, res, next) => {
  console.log('\n🔒 Region Access Check:');
  console.log('- User:', req.user ? {
    id: req.user._id,
    role: req.user.role,
    region: req.user.region
  } : 'No user found');

  // Skip region check for super_admin users
  if (req.user && req.user.role === 'super_admin') {
    console.log('✅ Super admin access granted - bypassing region check');
    return next();
  }

  // Check if user exists
  if (!req.user) {
    console.log('❌ Access denied - No authenticated user found');
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'No user found in request'
    });
  }

  // Check if user has region
  if (!req.user.region) {
    console.log('❌ Access denied - User has no assigned region');
    return res.status(403).json({ 
      message: 'Region access denied',
      error: 'User has no assigned region'
    });
  }

  // Set user region
  req.userRegion = req.user.region.toLowerCase();
  console.log(`✅ Region access granted for: ${req.userRegion}`);
  
  next();
};

module.exports = regionAccessMiddleware; 