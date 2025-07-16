const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  registerCompany,
  updateCompany,
  deleteCompany,
  loginCompany
} = require('../controllers/companyController');

// POST company/employer login
router.post('/login', loginCompany);

// GET all companies
router.get('/', getAllCompanies);

// GET company by ID
router.get('/:id', getCompanyById);

// POST create new company (with region filtering)
router.post('/', createCompany);

// POST public registration (no region filtering)
router.post('/register', registerCompany);

// PUT update company
router.put('/:id', updateCompany);

// DELETE company
router.delete('/:id', deleteCompany);

module.exports = router; 