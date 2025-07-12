const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { checkRegionAccess } = require('../middleware/regionAccess');

// Public registration route (no middleware)
router.post('/register', companyController.registerCompany);

// Protected routes with region access check
router.get('/', checkRegionAccess, companyController.getAllCompanies);
router.get('/:id', checkRegionAccess, companyController.getCompanyById);
router.post('/', checkRegionAccess, companyController.createCompany);
router.put('/:id', checkRegionAccess, companyController.updateCompany);
router.delete('/:id', checkRegionAccess, companyController.deleteCompany);

module.exports = router; 