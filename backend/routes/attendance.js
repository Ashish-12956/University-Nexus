const express = require('express');
const router = express.Router();
const AttendanceService = require('../services/AttendanceService');
const { SubjectEnrollment, Attendance } = require('../models');
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
    
    if (!user || (user.role !== 'faculty' && user.role !== 'admin')) {
      return res.status(403).json({
        status: 'error',
        message: 'Faculty or Admin access required'
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

/**
 * @route POST /api/attendance/bulk
 * @desc Mark bulk attendance for multiple students
 * @access Private (Faculty/Admin)
 */
router.post('/bulk', verifyFacultyAccess, async (req, res) => {
  try {
    const { facultyEmail, subjectId, date, studentAttendances } = req.body;

    // Input validation
    if (!facultyEmail || !subjectId || !studentAttendances) {
      return res.status(400).json({
        status: 'error',
        message: 'Faculty email, subject ID, and student attendances are required'
      });
    }

    if (!Array.isArray(studentAttendances) || studentAttendances.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Student attendances must be a non-empty array'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(facultyEmail)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid faculty email format'
      });
    }

    // Validate subjectId is a number
    if (isNaN(parseInt(subjectId))) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject ID must be a valid number'
      });
    }

    // Validate date format if provided
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    const result = await AttendanceService.markBulkAttendance(req.body);
    
    res.json({
      status: 'success',
      message: 'Bulk attendance marked successfully',
      attendance: result
    });

  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/attendance/subject/:subjectId/date/:date
 * @desc Get attendance records for a subject on a specific date
 * @access Private (Faculty/Admin)
 */
router.get('/subject/:subjectId/date/:date', verifyFacultyAccess, async (req, res) => {
  try {
    const { subjectId, date } = req.params;

    // Input validation
    if (isNaN(parseInt(subjectId))) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject ID must be a valid number'
      });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        status: 'error',
        message: 'Date must be in YYYY-MM-DD format'
      });
    }

    // Get subject with enrolled students
    const subject = await SubjectEnrollment.findOne({
      where: { id: subjectId },
      include: [
        { model: require('../models').Faculty, as: 'faculty' },
        { model: require('../models').Student, as: 'enrolledStudents' }
      ]
    });

    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }

    // Build attendance DTOs for all enrolled students
    const attendanceDTOs = [];

    for (const student of subject.enrolledStudents) {
      const existing = await AttendanceService.findAttendance(student.email, subjectId, date);
      
      const attendanceData = {
        id: existing ? existing.id : null,
        studentEmail: student.email,
        studentName: student.name,
        facultyEmail: subject.facultyEmail,
        facultyName: subject.faculty.name,
        subjectId: subject.id,
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        date: date,
        present: existing ? existing.present : false,
        remarks: existing ? existing.remarks : null
      };

      attendanceDTOs.push(attendanceData);
    }

    res.json({
      status: 'success',
      attendance: attendanceDTOs
    });

  } catch (error) {
    console.error('Get attendance by subject and date error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/attendance/faculty/:email/subjects
 * @desc Get subjects taught by a faculty member
 * @access Private (Faculty/Admin)
 */
router.get('/faculty/:email/subjects', verifyFacultyAccess, async (req, res) => {
  try {
    const { email } = req.params;

    // Input validation
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    const subjects = await AttendanceService.getSubjectsByFaculty(email);
    
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
 * @route GET /api/attendance/subject/:id/students
 * @desc Get subject with enrolled students
 * @access Private (Faculty/Admin)
 */
router.get('/subject/:id/students', verifyFacultyAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await AttendanceService.getSubjectWithStudents(id);
    
    res.json({
      status: 'success',
      subject: subject
    });

  } catch (error) {
    console.error('Get subject with students error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/attendance/stats/subject/:subjectId
 * @desc Get attendance statistics for a subject
 * @access Private (Faculty/Admin)
 */
router.get('/stats/subject/:subjectId', verifyFacultyAccess, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const stats = await AttendanceService.getSubjectAttendanceStats(subjectId);
    
    res.json({
      status: 'success',
      stats: stats
    });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/attendance/student/:email
 * @desc Get all attendance records for a student
 * @access Private (Faculty/Admin)
 */
router.get('/student/:email', verifyFacultyAccess, async (req, res) => {
  try {
    const { email } = req.params;
    const attendance = await AttendanceService.getStudentAttendanceHistory(email);
    
    res.json({
      status: 'success',
      attendance: attendance
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/attendance/student/:email/subjects
 * @desc Get subjects for a student
 * @access Private (Faculty/Admin)
 */
router.get('/student/:email/subjects', verifyFacultyAccess, async (req, res) => {
  try {
    const { email } = req.params;
    const subjects = await AttendanceService.getEnrollmentsByStudent(email);
    
    res.json({
      status: 'success',
      subjects: subjects
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
 * @route GET /api/attendance/student/:email/subject/:subjectId
 * @desc Get attendance records for a student in a specific subject
 * @access Private (Faculty/Admin)
 */
router.get('/student/:email/subject/:subjectId', verifyFacultyAccess, async (req, res) => {
  try {
    const { email, subjectId } = req.params;
    const attendance = await AttendanceService.getStudentAttendanceHistory(email, subjectId);
    
    res.json({
      status: 'success',
      attendance: attendance
    });

  } catch (error) {
    console.error('Get student subject attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
