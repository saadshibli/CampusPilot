import express from 'express';
import { body, validationResult } from 'express-validator';
import Deadline from '../models/Deadline.js';

const router = express.Router();

// Get all deadlines for the user
router.get('/', async (req, res) => {
  try {
    const { status, type, classId, limit = 20, page = 1 } = req.query;
    
    let query = { isActive: true };
    
    // Filter by user's classes
    if (req.user.classes && req.user.classes.length > 0) {
      query.class = { $in: req.user.classes };
    }
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (classId) query.class = classId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const deadlines = await Deadline.find(query)
      .populate('class', 'name code instructor')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Deadline.countDocuments(query);

    res.json({
      deadlines,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + deadlines.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Deadlines fetch error:', error);
    res.status(500).json({
      error: 'Deadlines fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get deadline by ID
router.get('/:id', async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id)
      .populate('class', 'name code instructor schedule')
      .populate('reminders');

    if (!deadline) {
      return res.status(404).json({
        error: 'Deadline not found',
        message: 'The requested deadline does not exist'
      });
    }

    // Check if user has access to this deadline
    const hasAccess = req.user.classes && req.user.classes.includes(deadline.class._id);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this deadline'
      });
    }

    res.json({ deadline });

  } catch (error) {
    console.error('Deadline fetch error:', error);
    res.status(500).json({
      error: 'Deadline fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get upcoming deadlines
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    let query = { 
      isActive: true,
      dueDate: { $gte: new Date() }
    };
    
    // Filter by user's classes
    if (req.user.classes && req.user.classes.length > 0) {
      query.class = { $in: req.user.classes };
    }

    const deadlines = await Deadline.find(query)
      .populate('class', 'name code instructor')
      .sort({ dueDate: 1 })
      .limit(parseInt(limit));

    res.json({ deadlines });

  } catch (error) {
    console.error('Upcoming deadlines fetch error:', error);
    res.status(500).json({
      error: 'Upcoming deadlines fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get overdue deadlines
router.get('/overdue', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    let query = { 
      isActive: true,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    };
    
    // Filter by user's classes
    if (req.user.classes && req.user.classes.length > 0) {
      query.class = { $in: req.user.classes };
    }

    const deadlines = await Deadline.find(query)
      .populate('class', 'name code instructor')
      .sort({ dueDate: 1 })
      .limit(parseInt(limit));

    res.json({ deadlines });

  } catch (error) {
    console.error('Overdue deadlines fetch error:', error);
    res.status(500).json({
      error: 'Overdue deadlines fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get today's deadlines
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    let query = { 
      isActive: true,
      dueDate: { $gte: startOfDay, $lt: endOfDay }
    };
    
    // Filter by user's classes
    if (req.user.classes && req.user.classes.length > 0) {
      query.class = { $in: req.user.classes };
    }

    const deadlines = await Deadline.find(query)
      .populate('class', 'name code instructor')
      .sort({ dueDate: 1 });

    res.json({ deadlines });

  } catch (error) {
    console.error('Today deadlines fetch error:', error);
    res.status(500).json({
      error: 'Today deadlines fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get urgent deadlines (within 24 hours)
router.get('/urgent', async (req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    let query = { 
      isActive: true,
      dueDate: { $gte: now, $lte: tomorrow },
      status: { $ne: 'completed' }
    };
    
    // Filter by user's classes
    if (req.user.classes && req.user.classes.length > 0) {
      query.class = { $in: req.user.classes };
    }

    const deadlines = await Deadline.find(query)
      .populate('class', 'name code instructor')
      .sort({ dueDate: 1 });

    res.json({ deadlines });

  } catch (error) {
    console.error('Urgent deadlines fetch error:', error);
    res.status(500).json({
      error: 'Urgent deadlines fetch failed',
      message: 'Internal server error'
    });
  }
});

// Mark deadline as completed
router.post('/:id/complete', async (req, res) => {
  try {
    const deadline = await Deadline.findById(req.params.id);
    
    if (!deadline) {
      return res.status(404).json({
        error: 'Deadline not found',
        message: 'The requested deadline does not exist'
      });
    }

    // Check if user has access to this deadline
    const hasAccess = req.user.classes && req.user.classes.includes(deadline.class);
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this deadline'
      });
    }

    deadline.status = 'completed';
    await deadline.save();

    res.json({
      message: 'Deadline marked as completed',
      deadline
    });

  } catch (error) {
    console.error('Mark deadline complete error:', error);
    res.status(500).json({
      error: 'Mark complete failed',
      message: 'Internal server error'
    });
  }
});

// Get deadline statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    
    let baseQuery = { isActive: true };
    
    // Filter by user's classes
    if (req.user.classes && req.user.classes.length > 0) {
      baseQuery.class = { $in: req.user.classes };
    }

    const stats = {
      total: await Deadline.countDocuments(baseQuery),
      upcoming: await Deadline.countDocuments({
        ...baseQuery,
        dueDate: { $gte: now }
      }),
      overdue: await Deadline.countDocuments({
        ...baseQuery,
        dueDate: { $lt: now },
        status: { $ne: 'completed' }
      }),
      completed: await Deadline.countDocuments({
        ...baseQuery,
        status: 'completed'
      }),
      today: await Deadline.countDocuments({
        ...baseQuery,
        dueDate: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        }
      })
    };

    res.json({ stats });

  } catch (error) {
    console.error('Deadline stats error:', error);
    res.status(500).json({
      error: 'Stats fetch failed',
      message: 'Internal server error'
    });
  }
});

export default router; 