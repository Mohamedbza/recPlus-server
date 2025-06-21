const express = require('express');
const router = express.Router();
const {
    createApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    deleteApplication,
    addMessage,
    updateStatus
} = require('../controllers/applicationController');

router.post('/', createApplication);
router.get('/', getAllApplications);
router.get('/:id', getApplicationById);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);
router.post('/:id/messages', addMessage);
router.put('/:id/status', updateStatus);

module.exports = router;
