const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const AdminService = require('../services/AdminService');
const AuthService = require('../services/AuthService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Middleware to verify admin access
const verifyAdminAccess = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authorization header with Bearer token is required'
      });
    }

    const idToken = authHeader.split(' ')[1];
    const user = await AuthService.verifyTokenAndGetUser(idToken);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
};

// Apply admin verification to all routes
router.use(verifyAdminAccess);

/**
 * @route POST /api/admin/upload-student-details
 * @desc Upload student details in bulk from CSV
 * @access Private (Admin)
 */
router.post('/upload-student-details', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'CSV file is required'
      });
    }

    const count = await AdminService.uploadDetailsOfStudentsBulk(req.file.path);
    
    res.json({
      status: 'success',
      message: `${count} students uploaded successfully`,
      count: count
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/admin/upload-student
 * @desc Upload individual student detail
 * @access Private (Admin)
 */
router.post('/upload-student', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and email are required'
      });
    }

    const student = await AdminService.uploadStudentDetail(req.body);
    
    res.json({
      status: 'success',
      message: 'Student uploaded successfully',
      student: student
    });

  } catch (error) {
    console.error('Student upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/admin/upload-faculty
 * @desc Upload faculty detail
 * @access Private (Admin)
 */
router.post('/upload-faculty', async (req, res) => {
  try {
    const faculty = await AdminService.uploadFacultyDetail(req.body);
    
    res.json({
      status: 'success',
      message: 'Faculty uploaded successfully',
      faculty: faculty
    });

  } catch (error) {
    console.error('Faculty upload error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/admin/student/:rollNo
 * @desc Get student by roll number
 * @access Private (Admin)
 */
router.get('/student/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await AdminService.getStudentByRollNo(rollNo);
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.json({
      status: 'success',
      student: student
    });

  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/admin/student/:rollNo
 * @desc Update student
 * @access Private (Admin)
 */
router.put('/student/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const student = await AdminService.updateStudent(rollNo, req.body);
    
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Student updated successfully',
      student: student
    });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/admin/student/:rollNo
 * @desc Delete student
 * @access Private (Admin)
 */
router.delete('/student/:rollNo', async (req, res) => {
  try {
    const { rollNo } = req.params;
    const success = await AdminService.deleteStudent(rollNo);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/admin/faculty/:email
 * @desc Get faculty by email
 * @access Private (Admin)
 */
router.get('/faculty/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const faculty = await AdminService.getFacultyByEmail(email);
    
    if (!faculty) {
      return res.status(404).json({
        status: 'error',
        message: 'Faculty not found'
      });
    }

    res.json({
      status: 'success',
      faculty: faculty
    });

  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/admin/faculty/:email
 * @desc Update faculty
 * @access Private (Admin)
 */
router.put('/faculty/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const faculty = await AdminService.updateFaculty(email, req.body);
    
    if (!faculty) {
      return res.status(404).json({
        status: 'error',
        message: 'Faculty not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Faculty updated successfully',
      faculty: faculty
    });

  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/admin/faculty/:email
 * @desc Delete faculty
 * @access Private (Admin)
 */
router.delete('/faculty/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const success = await AdminService.deleteFaculty(email);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Faculty not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Faculty deleted successfully'
    });

  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/admin/students
 * @desc Get all students
 * @access Private (Admin)
 */
router.get('/students', async (req, res) => {
  try {
    const students = await AdminService.getAllStudents();
    
    res.json({
      status: 'success',
      students: students
    });

  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/admin/faculty
 * @desc Get all faculty
 * @access Private (Admin)
 */
router.get('/faculty', async (req, res) => {
  try {
    const faculty = await AdminService.getAllFaculty();
    
    res.json({
      status: 'success',
      faculty: faculty
    });

  } catch (error) {
    console.error('Get all faculty error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
