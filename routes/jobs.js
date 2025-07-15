const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

const { uploadResume } = require('../middleware/upload');

// Protect all routes
router.post('/', authMiddleware, uploadResume.single('resume'), jobController.createJob);
router.get('/', authMiddleware, jobController.getJobs);
router.put('/:id', authMiddleware, uploadResume.single('resume'), jobController.updateJob);
router.delete('/:id', authMiddleware, jobController.deleteJob);

module.exports = router;
