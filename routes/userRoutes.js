const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getUserProfile,
    updateUser,
    deleteUser
} = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.get('/:id', getUserProfile);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
