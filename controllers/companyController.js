const Company = require('../models/company');
const bcrypt = require('bcryptjs');

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, industry, status } = req.query;
    
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
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
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
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
    
    // Validate password
    if (!password) {
      console.error('Password is missing in request body');
      return res.status(400).json({ 
        message: 'Password is required',
        code: 'MISSING_PASSWORD'
      });
    }

    if (typeof password !== 'string') {
      console.error('Password must be a string, received:', typeof password);
      return res.status(400).json({ 
        message: 'Password must be a string',
        code: 'INVALID_PASSWORD_TYPE'
      });
    }

    if (password.length < 6) {
      console.error('Password is too short:', password.length);
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    console.log('Attempting to hash password...');
    
    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      console.log('Password hashed successfully');

      const company = new Company({
        ...companyData,
        password: hashedPassword
      });
      
      console.log('Attempting to save company...');
      const newCompany = await company.save();
      console.log('Company saved successfully with ID:', newCompany._id);
      
      // Remove password from response
      const companyResponse = newCompany.toObject();
      delete companyResponse.password;
      
      res.status(201).json(companyResponse);
    } catch (hashError) {
      console.error('Error during password hashing:', hashError);
      return res.status(500).json({ 
        message: 'Error processing password',
        code: 'PASSWORD_PROCESSING_ERROR',
        details: hashError.message
      });
    }
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(400).json({ 
      message: error.message,
      code: 'COMPANY_CREATION_ERROR',
      details: error.message
    });
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
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
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get companies by industry
const getCompaniesByIndustry = async (req, res) => {
  try {
    const { industry } = req.params;
    const companies = await Company.find({
      industry: { $regex: industry, $options: 'i' }
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get verified companies
const getVerifiedCompanies = async (req, res) => {
  try {
    const companies = await Company.find({ isVerified: true });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompaniesByIndustry,
  getVerifiedCompanies
}; 