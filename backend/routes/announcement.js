const express = require('express');
const router = express.Router();
const AnnouncementService = require('../services/AnnouncementService');
const AuthService = require('../services/AuthService');

// Middleware to verify admin access for write operations
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
 * @route POST /api/announcements
 * @desc Create a new announcement
 * @access Private (Admin)
 */
router.post('/', verifyAdminAccess, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    const announcement = await AnnouncementService.sendAnnouncement({ message });
    
    res.status(201).json({
      status: 'success',
      message: 'Announcement created successfully',
      announcement: announcement
    });

  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/announcements
 * @desc Get all announcements
 * @access Private (Any authenticated user)
 */
router.get('/', verifyAuth, async (req, res) => {
  try {
    const announcements = await AnnouncementService.getAllAnnouncements();
    
    res.json({
      status: 'success',
      announcements: announcements
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/announcements/paginated
 * @desc Get paginated announcements
 * @access Private (Any authenticated user)
 */
router.get('/paginated', verifyAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await AnnouncementService.getPaginatedAnnouncements(page, limit);
    
    res.json({
      status: 'success',
      ...result
    });

  } catch (error) {
    console.error('Get paginated announcements error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/announcements/current
 * @desc Get the most recent announcement
 * @access Private (Any authenticated user)
 */
router.get('/current', verifyAuth, async (req, res) => {
  try {
    const announcement = await AnnouncementService.getCurrentAnnouncement();
    
    if (!announcement) {
      return res.status(404).json({
        status: 'error',
        message: 'No announcements found'
      });
    }

    res.json({
      status: 'success',
      announcement: announcement
    });

  } catch (error) {
    console.error('Get current announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route GET /api/announcements/:id
 * @desc Get announcement by ID
 * @access Private (Any authenticated user)
 */
router.get('/:id', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await AnnouncementService.getAnnouncementById(id);
    
    if (!announcement) {
      return res.status(404).json({
        status: 'error',
        message: 'Announcement not found'
      });
    }

    res.json({
      status: 'success',
      announcement: announcement
    });

  } catch (error) {
    console.error('Get announcement by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route PUT /api/announcements/:id
 * @desc Update an announcement
 * @access Private (Admin)
 */
router.put('/:id', verifyAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    const announcement = await AnnouncementService.updateAnnouncement(id, { message });
    
    if (!announcement) {
      return res.status(404).json({
        status: 'error',
        message: 'Announcement not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Announcement updated successfully',
      announcement: announcement
    });

  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/announcements/:id
 * @desc Delete an announcement
 * @access Private (Admin)
 */
router.delete('/:id', verifyAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await AnnouncementService.deleteAnnouncement(id);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Announcement not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
