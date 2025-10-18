const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Calendar } = require('../models');
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
    fileSize: 10 * 1024 * 1024 // 10MB limit
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
 * @route POST /api/calendar/upload
 * @desc Upload calendar file
 * @access Private (Admin)
 */
router.post('/upload', verifyAdminAccess, upload.single('file'), async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'File is required'
      });
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }

    const calendar = await Calendar.create({
      title: title,
      fileName: req.file.originalname,
      fileData: req.file.buffer,
      lastUpdated: new Date()
    });

    res.status(201).json({
      status: 'success',
      message: 'Calendar uploaded successfully',
      calendar: {
        id: calendar.id,
        title: calendar.title,
        fileName: calendar.fileName,
        lastUpdated: calendar.lastUpdated
      }
    });

  } catch (error) {
    console.error('Upload calendar error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/calendar
 * @desc Get all calendar entries
 * @access Private (Any authenticated user)
 */
router.get('/', verifyAuth, async (req, res) => {
  try {
    const calendars = await Calendar.findAll({
      order: [['lastUpdated', 'DESC']],
      attributes: ['id', 'title', 'fileName', 'lastUpdated']
    });
    
    res.json({
      status: 'success',
      calendars: calendars
    });

  } catch (error) {
    console.error('Get calendars error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/calendar/latest
 * @desc Get the latest calendar
 * @access Private (Any authenticated user)
 */
router.get('/latest', verifyAuth, async (req, res) => {
  try {
    const calendar = await Calendar.findOne({
      order: [['lastUpdated', 'DESC']],
      attributes: ['id', 'title', 'fileName', 'lastUpdated']
    });

    if (!calendar) {
      return res.status(404).json({
        status: 'error',
        message: 'No calendar found'
      });
    }

    res.json({
      status: 'success',
      calendar: calendar
    });

  } catch (error) {
    console.error('Get latest calendar error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/calendar/:id
 * @desc Get calendar by ID
 * @access Private (Any authenticated user)
 */
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const calendar = await Calendar.findByPk(id, {
      attributes: ['id', 'title', 'fileName', 'lastUpdated']
    });

    if (!calendar) {
      return res.status(404).json({
        status: 'error',
        message: 'Calendar not found'
      });
    }

    res.json({
      status: 'success',
      calendar: calendar
    });

  } catch (error) {
    console.error('Get calendar by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/calendar/:id/download
 * @desc Download calendar file
 * @access Private (Any authenticated user)
 */
router.get('/:id/download', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const calendar = await Calendar.findByPk(id);

    if (!calendar) {
      return res.status(404).json({
        status: 'error',
        message: 'Calendar not found'
      });
    }

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${calendar.fileName}"`,
      'Content-Length': calendar.fileData.length
    });

    res.send(calendar.fileData);

  } catch (error) {
    console.error('Download calendar error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/calendar/:id
 * @desc Update calendar
 * @access Private (Admin)
 */
router.put('/:id', verifyAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Title is required'
      });
    }

    const [updatedRowsCount] = await Calendar.update(
      { 
        title: title,
        lastUpdated: new Date()
      },
      { where: { id } }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Calendar not found'
      });
    }

    const updatedCalendar = await Calendar.findByPk(id, {
      attributes: ['id', 'title', 'fileName', 'lastUpdated']
    });

    res.json({
      status: 'success',
      message: 'Calendar updated successfully',
      calendar: updatedCalendar
    });

  } catch (error) {
    console.error('Update calendar error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/calendar/:id
 * @desc Delete calendar
 * @access Private (Admin)
 */
router.delete('/:id', verifyAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await Calendar.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Calendar not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Calendar deleted successfully'
    });

  } catch (error) {
    console.error('Delete calendar error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
