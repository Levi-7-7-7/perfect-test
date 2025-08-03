const Tutor = require('../models/Tutor');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const Category = require('../models/Category');


exports.addTutor = async (req, res) => {
  const { name, email, password, adminKey } = req.body;

  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ message: 'Unauthorized: Invalid admin key' });
  }

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existing = await Tutor.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Tutor already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tutor = new Tutor({
      name,
      email,
      password: hashedPassword
    });

    await tutor.save();
    res.status(201).json({ message: 'Tutor added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding tutor', error: err });
  }
};


exports.loginTutor = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  const tutor = await Tutor.findOne({ email });
  if (!tutor)
    return res.status(401).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, tutor.password);
  if (!isMatch)
    return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: tutor._id, role: 'tutor' }, process.env.JWT_SECRET);

  res.status(200).json({
    message: 'Tutor login successful',
    token,
    tutor: {
      id: tutor._id,
      name: tutor.name,
      email: tutor.email,
    },
  });
};



exports.getAllStudentsWithPoints = async (req, res) => {
  try {
    // Fetch all students
    const students = await Student.find({}, 'name registerNumber email');

    // Process each student
    const result = await Promise.all(students.map(async (student) => {
      // Get approved certificates with populated category
      const certificates = await Certificate.find({ student: student._id, status: 'Approved' })
        .populate('category', 'name');  // populate just the 'name' field from Category

      const categoryPoints = {};

      certificates.forEach(cert => {
        const categoryName = cert.category?.name || 'Uncategorized';
        const points = cert.assignedPoints || 0;

        if (categoryPoints[categoryName]) {
          categoryPoints[categoryName] += points;
        } else {
          categoryPoints[categoryName] = points;
        }
      });

      return {
        studentId: student._id,
        name: student.name,
        registerNumber: student.registerNumber,
        email: student.email,
        totalPointsByCategory: categoryPoints
      };
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAllStudentsWithPoints:', error);
    res.status(500).json({ message: 'Server error while fetching student points' });
  }
};
