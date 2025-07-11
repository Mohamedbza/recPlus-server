const regionAccess = (req, res, next) => {
  // Skip region check for super_admin
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }

  // For other roles, ensure they have a region
  if (!req.user || !req.user.region) {
    return res.status(403).json({ message: 'Region access denied' });
  }

  // Add region to request for use in controllers
  req.userRegion = req.user.region;
  next();
};

module.exports = regionAccess; 