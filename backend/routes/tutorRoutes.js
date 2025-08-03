const express = require('express');
const router = express.Router();
const tutorController = require('../controllers/tutorController');
const authenticateTutor = require('../middleware/tutorMiddleware');
const {
  getPendingCertificates,
  reviewCertificate
} = require('../controllers/certificateController');

// Tutor registration and login
router.post('/register', tutorController.addTutor);
router.post('/login', tutorController.loginTutor);

// Get all students with their earned points per category
router.get('/students', authenticateTutor, tutorController.getAllStudentsWithPoints);

// Review certificate routes
router.get('/certificates/pending', authenticateTutor, getPendingCertificates);
router.post('/certificates/:certificateId/review', authenticateTutor, reviewCertificate);

module.exports = router;
