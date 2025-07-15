const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadPhoto } = require('../middleware/upload');

// Register with profile photo upload
router.post('/register', uploadPhoto.single('profilePhoto'), authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.profile);
router.post('/logout', authController.logout);

module.exports = router;