// index.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const certificateRoutes = require('./routes/fix');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes); // ✅ keep only this one
app.use('/api/categories', categoryRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/fix', require('./routes/fix')); // adjust path if needed


// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
