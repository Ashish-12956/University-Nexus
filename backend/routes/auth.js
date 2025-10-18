const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');

/**
 * @route POST /api/auth/login
 * @desc Login user with Firebase token
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        status: 'error',
        message: 'ID token is required'
      });
    }

    const user = await AuthService.verifyTokenAndGetUser(idToken);
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found in database'
      });
    }

    const redirectUrl = (() => {
      switch (user.role.toLowerCase()) {
        case 'admin':
          return '/admin/dashboard';
        case 'student':
          return '/student/dashboard';
        case 'faculty':
          return '/teacher/dashboard';
        default:
          throw new Error('Unknown user role');
      }
    })();

    res.json({
      status: 'success',
      name: user.name,
      email: user.email,
      firebaseUid: user.firebaseUid,
      role: user.role,
      userUnivId: user.univId,
      idToken: idToken,
      redirectUrl: redirectUrl
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/auth/verify
 * @desc Verify Firebase token
 * @access Private
 */
router.get('/verify', async (req, res) => {
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
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        firebaseUid: user.firebaseUid,
        univId: user.univId
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route POST /api/auth/check-access
 * @desc Check if user has access to specific resource
 * @access Private
 */
router.post('/check-access', async (req, res) => {
  try {
    const { idToken, requestedFirebaseUid } = req.body;

    if (!idToken || !requestedFirebaseUid) {
      return res.status(400).json({
        status: 'error',
        message: 'ID token and requested Firebase UID are required'
      });
    }

    await AuthService.verifyTokenAndCheckAccess(idToken, requestedFirebaseUid);

    res.json({
      status: 'success',
      message: 'Access granted'
    });

  } catch (error) {
    console.error('Access check error:', error);
    res.status(403).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
