const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Student, Attendance, SubjectEnrollment } = require('../models');
const AuthService = require('../services/AuthService');

// Configure multer for image uploads
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
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to verify student access
const verifyStudentAccess = async (req, res, next) => {
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
    
    if (!user || user.role !== 'student') {
      return res.status(403).json({
        status: 'error',
        message: 'Student access required'
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

// Apply student verification to all routes
router.use(verifyStudentAccess);

/**
 * @route GET /api/student/profile/:email
 * @desc Get student profile by email
 * @access Private (Student)
 */
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Verify the student is accessing their own profile
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const student = await Student.findOne({
      where: { email }
    });

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
    console.error('Get student profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/student/subjects/:email
 * @desc Get all subjects for a student
 * @access Private (Student)
 */
router.get('/subjects/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Verify the student is accessing their own data
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const student = await Student.findOne({
      where: { email },
      include: [
        {
          model: SubjectEnrollment,
          as: 'enrolledStudents',
          include: [
            { model: require('../models').Faculty, as: 'faculty' }
          ]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.json({
      status: 'success',
      subjects: student.enrolledStudents
    });

  } catch (error) {
    console.error('Get student subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/student/attendance-summary/:email
 * @desc Get attendance summary for all subjects
 * @access Private (Student)
 */
router.get('/attendance-summary/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { startDate, endDate } = req.query;

    // Verify the student is accessing their own data
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const start = startDate || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // Get student with enrolled subjects
    const student = await Student.findOne({
      where: { email },
      include: [
        {
          model: SubjectEnrollment,
          as: 'enrolledStudents',
          include: [
            { model: require('../models').Faculty, as: 'faculty' }
          ]
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    const attendanceSummary = [];

    for (const subject of student.enrolledStudents) {
      // Get attendance records for this subject
      const records = await Attendance.findAll({
        where: {
          studentEmail: email,
          subjectId: subject.id,
          date: {
            [require('sequelize').Op.between]: [start, end]
          }
        }
      });

      const totalClasses = new Set(records.map(r => r.date)).size;
      const presentCount = records.filter(r => r.present).length;
      const percentage = totalClasses > 0 ? 
        Math.round((presentCount * 100.0 / totalClasses) * 100) / 100.0 : 0.0;

      attendanceSummary.push({
        subjectName: `${subject.subjectName} (${subject.credits})`,
        subjectCode: subject.subjectCode,
        faculty: subject.faculty.name,
        totalLectures: totalClasses,
        totalPresent: presentCount,
        percentage: percentage
      });
    }

    const overallPercentage = attendanceSummary.length > 0 ?
      Math.round(attendanceSummary.reduce((sum, s) => sum + s.percentage, 0) / attendanceSummary.length * 100) / 100.0 : 0.0;

    res.json({
      status: 'success',
      startDate: start,
      endDate: end,
      overallPercentage: overallPercentage,
      subjects: attendanceSummary
    });

  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/student/attendance/:email/:subjectId
 * @desc Get detailed attendance for a specific subject
 * @access Private (Student)
 */
router.get('/attendance/:email/:subjectId', async (req, res) => {
  try {
    const { email, subjectId } = req.params;

    // Verify the student is accessing their own data
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    // Verify the student is enrolled in this subject
    const student = await Student.findOne({
      where: { email },
      include: [
        {
          model: SubjectEnrollment,
          as: 'enrolledStudents',
          where: { id: subjectId }
        }
      ]
    });

    if (!student || student.enrolledStudents.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'Student is not enrolled in this subject'
      });
    }

    const records = await Attendance.findAll({
      where: {
        studentEmail: email,
        subjectId: subjectId
      },
      include: [
        { model: SubjectEnrollment, as: 'subject' },
        { model: require('../models').Faculty, as: 'faculty' }
      ],
      order: [['date', 'DESC']]
    });

    res.json({
      status: 'success',
      attendance: records
    });

  } catch (error) {
    console.error('Get subject attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/student/upload-image
 * @desc Upload student profile image
 * @access Private (Student)
 */
router.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const { email } = req.body;

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select an image file'
      });
    }

    // Verify the student is uploading their own image
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const student = await Student.findOne({
      where: { email }
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Update student with image data
    student.stuImage = req.file.buffer;
    await student.save();

    res.json({
      status: 'success',
      message: 'Image uploaded successfully',
      email: email,
      imageSize: req.file.size
    });

  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/student/profile-image/:email
 * @desc Get student profile image
 * @access Private (Student)
 */
router.get('/profile-image/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Verify the student is accessing their own image
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const student = await Student.findOne({
      where: { email }
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    if (!student.stuImage) {
      return res.status(404).json({
        status: 'error',
        message: 'No profile image found'
      });
    }

    res.set('Content-Type', 'image/jpeg');
    res.send(student.stuImage);

  } catch (error) {
    console.error('Get profile image error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
