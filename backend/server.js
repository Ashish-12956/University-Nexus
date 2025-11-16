const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');
const teacherRoutes = require('./routes/teacher');
const attendanceRoutes = require('./routes/attendance');
const announcementRoutes = require('./routes/announcement');
const calendarRoutes = require('./routes/calendar');
const subjectEnrollmentRoutes = require('./routes/subjectEnrollment');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Initialize Firebase
initializeFirebase();

// Test database connection
testConnection().catch(err => {
  console.error('Failed to establish database connection:', err);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1); // Exit in production if DB connection fails
  }
});

// Validate critical environment variables
const requiredEnvVars = ['DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
} else if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/subject-enrollment', subjectEnrollmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error with more context
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  if (err.name === 'UnauthorizedError' || err.status === 401) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized access'
    });
  }

  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
