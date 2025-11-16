const express = require('express');
const router = express.Router();
const { Faculty, SubjectEnrollment, Attendance } = require('../models');
const AuthService = require('../services/AuthService');

// Middleware to verify faculty access
const verifyFacultyAccess = async (req, res, next) => {
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
    
    if (!user || user.role !== 'faculty') {
      return res.status(403).json({
        status: 'error',
        message: 'Faculty access required'
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

// Apply faculty verification to all routes
router.use(verifyFacultyAccess);

/**
 * @route GET /api/teacher/profile/:email
 * @desc Get teacher profile by email
 * @access Private (Faculty)
 */
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Input validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid email is required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Verify the teacher is accessing their own profile
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const faculty = await Faculty.findOne({
      where: { email }
    });

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
    console.error('Get faculty profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/teacher/subjects/:email
 * @desc Get subjects taught by a faculty member
 * @access Private (Faculty)
 */
router.get('/subjects/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Verify the teacher is accessing their own data
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const subjects = await SubjectEnrollment.findAll({
      where: { facultyEmail: email },
      include: [
        { model: require('../models').Student, as: 'enrolledStudents' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      subjects: subjects
    });

  } catch (error) {
    console.error('Get faculty subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/teacher/students/:email
 * @desc Get all students taught by a faculty member
 * @access Private (Faculty)
 */
router.get('/students/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Verify the teacher is accessing their own data
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const subjects = await SubjectEnrollment.findAll({
      where: { facultyEmail: email },
      include: [
        { model: require('../models').Student, as: 'enrolledStudents' }
      ]
    });

    // Flatten all students from all subjects
    const allStudents = [];
    subjects.forEach(subject => {
      subject.enrolledStudents.forEach(student => {
        if (!allStudents.find(s => s.id === student.id)) {
          allStudents.push(student);
        }
      });
    });

    res.json({
      status: 'success',
      students: allStudents
    });

  } catch (error) {
    console.error('Get faculty students error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/teacher/attendance/:email
 * @desc Get attendance records marked by a faculty member
 * @access Private (Faculty)
 */
router.get('/attendance/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Verify the teacher is accessing their own data
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const attendance = await Attendance.findAll({
      where: { facultyEmail: email },
      include: [
        { model: require('../models').Student, as: 'student' },
        { model: SubjectEnrollment, as: 'subject' }
      ],
      order: [['date', 'DESC']]
    });

    res.json({
      status: 'success',
      attendance: attendance
    });

  } catch (error) {
    console.error('Get faculty attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/teacher/attendance-stats/:email
 * @desc Get attendance statistics for a faculty member's subjects
 * @access Private (Faculty)
 */
router.get('/attendance-stats/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Verify the teacher is accessing their own data
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const subjects = await SubjectEnrollment.findAll({
      where: { facultyEmail: email },
      include: [
        { model: require('../models').Student, as: 'enrolledStudents' }
      ]
    });

    const stats = [];

    for (const subject of subjects) {
      const attendance = await Attendance.findAll({
        where: { subjectId: subject.id }
      });

      const totalClasses = new Set(attendance.map(a => a.date)).size;
      const totalPresent = attendance.filter(a => a.present).length;
      const totalPossible = totalClasses * subject.enrolledStudents.length;
      const percentage = totalPossible > 0 ? 
        Math.round((totalPresent * 100.0 / totalPossible) * 100) / 100.0 : 0.0;

      stats.push({
        subjectId: subject.id,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        totalStudents: subject.enrolledStudents.length,
        totalClasses: totalClasses,
        totalPresent: totalPresent,
        totalPossible: totalPossible,
        percentage: percentage
      });
    }

    res.json({
      status: 'success',
      stats: stats
    });

  } catch (error) {
    console.error('Get faculty attendance stats error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/teacher/profile/:email
 * @desc Update faculty profile
 * @access Private (Faculty)
 */
router.put('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Input validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid email is required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // Verify the teacher is updating their own profile
    if (req.user.email !== email) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    const faculty = await Faculty.findOne({
      where: { email }
    });

    if (!faculty) {
      return res.status(404).json({
        status: 'error',
        message: 'Faculty not found'
      });
    }

    const updatedFaculty = await faculty.update(req.body);

    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      faculty: updatedFaculty
    });

  } catch (error) {
    console.error('Update faculty profile error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
