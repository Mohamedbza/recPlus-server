const express = require('express');
const router = express.Router();
const {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const regionAccess = require('../middleware/regionAccess');

// Apply region access middleware to all routes
router.use(regionAccess);

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

module.exports = router; 