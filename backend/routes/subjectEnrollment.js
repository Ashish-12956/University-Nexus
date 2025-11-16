const express = require('express');
const router = express.Router();
const SubjectEnrollmentService = require('../services/SubjectEnrollmentService');
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

// Middleware to verify any authenticated user for read operations
const verifyAuth = async (req, res, next) => {
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
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
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
 * @route POST /api/subject-enrollment/create-all
 * @desc Create enrollment for all students
 * @access Private (Faculty/Admin)
 */
router.post('/create-all', verifyFacultyAccess, async (req, res) => {
  try {
    const { emailId, subjectName, subjectCode, credits } = req.body;

    // Enhanced input validation
    if (!emailId || !subjectName || !subjectCode || credits === undefined || credits === null) {
      return res.status(400).json({
        status: 'error',
        message: 'Email ID, subject name, subject code, and credits are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
    }

    // String validations
    if (typeof subjectName !== 'string' || subjectName.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject name must be a non-empty string'
      });
    }

    if (typeof subjectCode !== 'string' || subjectCode.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject code must be a non-empty string'
      });
    }

    // Credits validation
    const creditsNum = parseFloat(credits);
    if (isNaN(creditsNum) || creditsNum < 0 || creditsNum > 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Credits must be a number between 0 and 10'
      });
    }

    const enrollment = await SubjectEnrollmentService.createEnrollmentForAllStudents({
      emailId,
      subjectName,
      subjectCode,
      credits
    });

    res.status(201).json({
      status: 'success',
      message: 'Enrollment created for all students successfully',
      enrollment: enrollment
    });

  } catch (error) {
    console.error('Create enrollment for all students error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/subject-enrollment/create-specific
 * @desc Create enrollment for specific students
 * @access Private (Faculty/Admin)
 */
router.post('/create-specific', verifyFacultyAccess, async (req, res) => {
  try {
    const { emailId, subjectName, subjectCode, credits, studentEmails } = req.body;

    // Enhanced input validation
    if (!emailId || !subjectName || !subjectCode || credits === undefined || credits === null || !studentEmails || !Array.isArray(studentEmails)) {
      return res.status(400).json({
        status: 'error',
        message: 'Email ID, subject name, subject code, credits, and student emails array are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid faculty email format'
      });
    }

    // Validate all student emails
    if (studentEmails.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one student email is required'
      });
    }

    for (const email of studentEmails) {
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid student email format: ${email}`
        });
      }
    }

    // String validations
    if (typeof subjectName !== 'string' || subjectName.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject name must be a non-empty string'
      });
    }

    if (typeof subjectCode !== 'string' || subjectCode.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject code must be a non-empty string'
      });
    }

    // Credits validation
    const creditsNum = parseFloat(credits);
    if (isNaN(creditsNum) || creditsNum < 0 || creditsNum > 10) {
      return res.status(400).json({
        status: 'error',
        message: 'Credits must be a number between 0 and 10'
      });
    }

    const enrollment = await SubjectEnrollmentService.createEnrollmentForSpecificStudents({
      emailId,
      subjectName,
      subjectCode,
      credits,
      studentEmails
    });

    res.status(201).json({
      status: 'success',
      message: 'Enrollment created for specific students successfully',
      enrollment: enrollment
    });

  } catch (error) {
    console.error('Create enrollment for specific students error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/subject-enrollment
 * @desc Get all enrollments
 * @access Private (Any authenticated user)
 */
router.get('/', verifyAuth, async (req, res) => {
  try {
    const enrollments = await SubjectEnrollmentService.getAllEnrollments();
    
    res.json({
      status: 'success',
      enrollments: enrollments
    });

  } catch (error) {
    console.error('Get all enrollments error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/subject-enrollment/:id
 * @desc Get enrollment by ID
 * @access Private (Any authenticated user)
 */
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await SubjectEnrollmentService.getEnrollmentById(id);
    
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment not found'
      });
    }

    res.json({
      status: 'success',
      enrollment: enrollment
    });

  } catch (error) {
    console.error('Get enrollment by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/subject-enrollment/faculty/:email
 * @desc Get enrollments by faculty
 * @access Private (Any authenticated user)
 */
router.get('/faculty/:email', verifyAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const enrollments = await SubjectEnrollmentService.getEnrollmentsByFaculty(email);
    
    res.json({
      status: 'success',
      enrollments: enrollments
    });

  } catch (error) {
    console.error('Get enrollments by faculty error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/subject-enrollment/student/:email
 * @desc Get enrollments by student
 * @access Private (Any authenticated user)
 */
router.get('/student/:email', verifyAuth, async (req, res) => {
  try {
    const { email } = req.params;
    const enrollments = await SubjectEnrollmentService.getEnrollmentsByStudent(email);
    
    res.json({
      status: 'success',
      enrollments: enrollments
    });

  } catch (error) {
    console.error('Get enrollments by student error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/subject-enrollment/:enrollmentId/add-student
 * @desc Add student to enrollment
 * @access Private (Faculty/Admin)
 */
router.post('/:enrollmentId/add-student', verifyFacultyAccess, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { studentEmail } = req.body;

    // Input validation
    if (!enrollmentId || isNaN(parseInt(enrollmentId))) {
      return res.status(400).json({
        status: 'error',
        message: 'Valid enrollment ID is required'
      });
    }

    if (!studentEmail || typeof studentEmail !== 'string' || studentEmail.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Student email is required and must be a non-empty string'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid student email format'
      });
    }

    const success = await SubjectEnrollmentService.addStudentToEnrollment(enrollmentId, studentEmail);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment or student not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Student added to enrollment successfully'
    });

  } catch (error) {
    console.error('Add student to enrollment error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/subject-enrollment/:enrollmentId/remove-student
 * @desc Remove student from enrollment
 * @access Private (Faculty/Admin)
 */
router.delete('/:enrollmentId/remove-student', verifyFacultyAccess, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { studentEmail } = req.body;

    if (!studentEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Student email is required'
      });
    }

    const success = await SubjectEnrollmentService.removeStudentFromEnrollment(enrollmentId, studentEmail);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment or student not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Student removed from enrollment successfully'
    });

  } catch (error) {
    console.error('Remove student from enrollment error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/subject-enrollment/:id
 * @desc Update enrollment
 * @access Private (Faculty/Admin)
 */
router.put('/:id', verifyFacultyAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await SubjectEnrollmentService.updateEnrollment(id, req.body);
    
    if (!enrollment) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Enrollment updated successfully',
      enrollment: enrollment
    });

  } catch (error) {
    console.error('Update enrollment error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/subject-enrollment/:id
 * @desc Delete enrollment
 * @access Private (Faculty/Admin)
 */
router.delete('/:id', verifyFacultyAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await SubjectEnrollmentService.deleteEnrollment(id);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Enrollment not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Enrollment deleted successfully'
    });

  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
