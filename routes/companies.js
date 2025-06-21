const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompaniesByIndustry,
  getVerifiedCompanies
} = require('../controllers/companyController');

// GET all companies
router.get('/', getAllCompanies);

// GET company by ID
router.get('/:id', getCompanyById);

// POST create new company
router.post('/', createCompany);

// PUT update company
router.put('/:id', updateCompany);

// DELETE company
router.delete('/:id', deleteCompany);

// GET companies by industry
router.get('/industry/:industry', getCompaniesByIndustry);

// GET verified companies
router.get('/verified/all', getVerifiedCompanies);

module.exports = router; 