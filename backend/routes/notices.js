import express from 'express';
import { body, validationResult } from 'express-validator';
import Notice from '../models/Notice.js';

const router = express.Router();

// Get all notices for the user
router.get('/', async (req, res) => {
  try {
    const { type, priority, limit = 20, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    // Filter by user's department and year
    query.$or = [
      { 'targetAudience.isForAll': true },
      { 'targetAudience.departments': req.user.department },
      { 'targetAudience.years': req.user.year },
      { 'targetAudience.specificUsers': req.user._id }
    ];
    
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const notices = await Notice.find(query)
      .populate('issuedBy')
      .sort({ isPinned: -1, publishDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notice.countDocuments(query);

    res.json({
      notices,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + notices.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Notices fetch error:', error);
    res.status(500).json({
      error: 'Notices fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get notice by ID
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id)
      .populate('issuedBy')
      .populate('readBy.user', 'name email studentId');

    if (!notice) {
      return res.status(404).json({
        error: 'Notice not found',
        message: 'The requested notice does not exist'
      });
    }

    // Check if user has access to this notice
    const hasAccess = notice.targetAudience.isForAll ||
      notice.targetAudience.departments.includes(req.user.department) ||
      notice.targetAudience.years.includes(req.user.year) ||
      notice.targetAudience.specificUsers.includes(req.user._id);

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this notice'
      });
    }

    res.json({ notice });

  } catch (error) {
    console.error('Notice fetch error:', error);
    res.status(500).json({
      error: 'Notice fetch failed',
      message: 'Internal server error'
    });
  }
});

// Mark notice as read
router.post('/:id/read', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        error: 'Notice not found',
        message: 'The requested notice does not exist'
      });
    }

    // Check if already read
    const alreadyRead = notice.readBy.some(
      read => read.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notice.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await notice.save();
    }

    res.json({
      message: 'Notice marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Mark as read failed',
      message: 'Internal server error'
    });
  }
});

// Acknowledge notice (if required)
router.post('/:id/acknowledge', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({
        error: 'Notice not found',
        message: 'The requested notice does not exist'
      });
    }

    if (!notice.requiresAcknowledgment) {
      return res.status(400).json({
        error: 'Acknowledgment not required',
        message: 'This notice does not require acknowledgment'
      });
    }

    // Check if already acknowledged
    const alreadyAcknowledged = notice.acknowledgedBy.some(
      ack => ack.user.toString() === req.user._id.toString()
    );

    if (alreadyAcknowledged) {
      return res.status(400).json({
        error: 'Already acknowledged',
        message: 'You have already acknowledged this notice'
      });
    }

    notice.acknowledgedBy.push({
      user: req.user._id,
      acknowledgedAt: new Date()
    });
    await notice.save();

    res.json({
      message: 'Notice acknowledged successfully'
    });

  } catch (error) {
    console.error('Acknowledge notice error:', error);
    res.status(500).json({
      error: 'Acknowledgment failed',
      message: 'Internal server error'
    });
  }
});

// Get unread notices count
router.get('/unread/count', async (req, res) => {
  try {
    let query = { isActive: true };
    
    // Filter by user's department and year
    query.$or = [
      { 'targetAudience.isForAll': true },
      { 'targetAudience.departments': req.user.department },
      { 'targetAudience.years': req.user.year },
      { 'targetAudience.specificUsers': req.user._id }
    ];

    const unreadCount = await Notice.countDocuments({
      ...query,
      'readBy.user': { $ne: req.user._id }
    });

    res.json({ unreadCount });

  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({
      error: 'Unread count fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get pinned notices
router.get('/pinned', async (req, res) => {
  try {
    let query = { isActive: true, isPinned: true };
    
    // Filter by user's department and year
    query.$or = [
      { 'targetAudience.isForAll': true },
      { 'targetAudience.departments': req.user.department },
      { 'targetAudience.years': req.user.year },
      { 'targetAudience.specificUsers': req.user._id }
    ];

    const pinnedNotices = await Notice.find(query)
      .populate('issuedBy')
      .sort({ publishDate: -1 })
      .limit(5);

    res.json({ notices: pinnedNotices });

  } catch (error) {
    console.error('Pinned notices fetch error:', error);
    res.status(500).json({
      error: 'Pinned notices fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get urgent notices
router.get('/urgent', async (req, res) => {
  try {
    let query = { isActive: true, priority: 'urgent' };
    
    // Filter by user's department and year
    query.$or = [
      { 'targetAudience.isForAll': true },
      { 'targetAudience.departments': req.user.department },
      { 'targetAudience.years': req.user.year },
      { 'targetAudience.specificUsers': req.user._id }
    ];

    const urgentNotices = await Notice.find(query)
      .populate('issuedBy')
      .sort({ publishDate: -1 })
      .limit(10);

    res.json({ notices: urgentNotices });

  } catch (error) {
    console.error('Urgent notices fetch error:', error);
    res.status(500).json({
      error: 'Urgent notices fetch failed',
      message: 'Internal server error'
    });
  }
});

export default router; 