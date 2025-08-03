const Certificate = require('../models/Certificate');
const Category = require('../models/Category');
const Student = require('../models/Student');
const imagekit = require('../utils/imagekit');
const fs = require('fs');

// Upload certificate
exports.uploadCertificate = async (req, res) => {
  try {
    const { categoryId, subcategoryName, level } = req.body;

    if (!req.file || !categoryId || !subcategoryName) {
      return res.status(400).json({ message: 'Missing required fields or file' });
    }

    // Upload file to ImageKit
    const fileBuffer = fs.readFileSync(req.file.path);
    const uploadedFile = await imagekit.upload({
      file: fileBuffer,
      fileName: req.file.originalname,
    });
    fs.unlinkSync(req.file.path); // remove local temp file

    const documentUrl = uploadedFile.url;

    // Find category and subcategory
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const sub = category.subcategories.find(sub => {
      if (sub.name !== subcategoryName) return false;
      if (!sub.level && !level) return true; // no level in both
      return sub.level === level; // must match
    });

    if (!sub) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // Create certificate
    const certificate = new Certificate({
      student: req.user.id,
      category: category._id,
      subcategory: {
        name: sub.name,
        points: sub.points,
        level: sub.level || ''
      },
      documentUrl,
      assignedPoints: sub.points
    });

    await certificate.save();

    res.status(201).json({ message: 'Certificate uploaded successfully', certificate });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Certificate upload failed', error });
  }
};

// Get student's own certificates
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user.id }).populate('category');
    res.status(200).json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch certificates', error });
  }
};

// Get pending certificates (for tutors)
exports.getPendingCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ status: 'Pending' })
      .populate('student', 'name registerNumber email')
      .populate('category', 'name');

    res.status(200).json(certificates);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending certificates', error: err });
  }
};

// Review (approve/reject) certificate
exports.reviewCertificate = async (req, res) => {
  const { certificateId } = req.params;
  const { status, remarks, updatedPoints } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const cert = await Certificate.findById(certificateId);
    if (!cert) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    cert.status = status;
    cert.tutorRemarks = remarks || '';

    if (typeof updatedPoints === 'number') {
      cert.assignedPoints = updatedPoints;
    }

    await cert.save();

    if (status === 'Approved') {
      const student = await Student.findById(cert.student);
      if (student) {
        student.totalPoints += cert.assignedPoints;
        await student.save();
      }
    }

    res.status(200).json({ message: `Certificate ${status.toLowerCase()} successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Review failed', error: err });
  }
};
