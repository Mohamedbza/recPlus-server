const Company = require('../models/company');
const bcrypt = require('bcryptjs');

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, industry, status } = req.query;
    
    let query = {};
    
    // Region filter from user's region
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
      
      // Ensure region filter is applied to search results
      if (req.userRegion) {
        query.$and = [
          { location: req.userRegion },
          { $or: query.$or }
        ];
        delete query.$or;
      }
    }
    
    // Industry filter
    if (industry) {
      query.industry = industry;
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    const companies = await Company.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Company.countDocuments(query);
    
    res.json({
      companies,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // Add region check for non-super_admin users
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    const company = await Company.findOne(query);
    if (!company) {
      return res.status(404).json({ message: 'Company not found in your region' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new company
const createCompany = async (req, res) => {
  try {
    const { password, ...companyData } = req.body;
    
    // Force location to user's region for non-super_admin users
    if (req.userRegion) {
      companyData.location = req.userRegion;
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const company = new Company({
      ...companyData,
      password: hashedPassword
    });
    
    const newCompany = await company.save();
    
    // Remove password from response
    const companyResponse = newCompany.toObject();
    delete companyResponse.password;
    
    res.status(201).json(companyResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // For non-super_admin users, ensure company exists in their region
    if (req.userRegion) {
      const existingCompany = await Company.findOne({
        _id: req.params.id,
        location: req.userRegion
      });
      
      if (!existingCompany) {
        return res.status(404).json({ message: 'Company not found in your region' });
      }
      
      // Force location to user's region
      updateData.location = req.userRegion;
    }
    
    // If password is provided, hash it
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }
    
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    // Remove password from response
    const companyResponse = company.toObject();
    delete companyResponse.password;
    
    res.json(companyResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // Add region check for non-super_admin users
    if (req.userRegion) {
      query.location = req.userRegion;
    }
    
    const company = await Company.findOneAndDelete(query);
    if (!company) {
      return res.status(404).json({ message: 'Company not found in your region' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Public registration for companies (no region filtering)
const registerCompany = async (req, res) => {
  try {
    const { password, ...companyData } = req.body;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const company = new Company({
      ...companyData,
      password: hashedPassword
    });
    
    const newCompany = await company.save();
    
    // Remove password from response
    const companyResponse = newCompany.toObject();
    delete companyResponse.password;
    
    res.status(201).json(companyResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  registerCompany,
  updateCompany,
  deleteCompany
}; 