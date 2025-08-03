const express = require('express');
const router = express.Router();
const {
  uploadCertificate,
  getMyCertificates,
  getPendingCertificates,
  reviewCertificate
} = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');

// Configure multer to store file temporarily
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authMiddleware, upload.single('file'), uploadCertificate);
router.get('/my-certificates', authMiddleware, getMyCertificates);

// Optional: tutor-specific routes
router.get('/tutors/certificates/pending', authMiddleware, getPendingCertificates);
router.put('/tutors/certificates/:certificateId/review', authMiddleware, reviewCertificate);

module.exports = router;
