import express from 'express';
import { body, validationResult } from 'express-validator';
import Reminder from '../models/Reminder.js';

const router = express.Router();

// Get all reminders for the user
router.get('/', async (req, res) => {
  try {
    const { type, category, status, limit = 20, page = 1 } = req.query;
    
    let query = { user: req.user._id };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'active') {
      query.isCompleted = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reminders = await Reminder.find(query)
      .populate('relatedItem.id')
      .sort({ date: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reminder.countDocuments(query);

    res.json({
      reminders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + reminders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Reminders fetch error:', error);
    res.status(500).json({
      error: 'Reminders fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get reminder by ID
router.get('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('relatedItem.id');

    if (!reminder) {
      return res.status(404).json({
        error: 'Reminder not found',
        message: 'The requested reminder does not exist'
      });
    }

    // Check if user owns this reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this reminder'
      });
    }

    res.json({ reminder });

  } catch (error) {
    console.error('Reminder fetch error:', error);
    res.status(500).json({
      error: 'Reminder fetch failed',
      message: 'Internal server error'
    });
  }
});

// Create new reminder
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('type').isIn(['deadline', 'event', 'class', 'exam', 'meeting', 'personal', 'custom']).withMessage('Valid type is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority is required'),
  body('category').optional().isIn(['academic', 'personal', 'social', 'health', 'other']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      title,
      description,
      type,
      relatedItem,
      date,
      time,
      repeat,
      repeatEndDate,
      notifications,
      priority,
      category,
      tags,
      location,
      color,
      notes
    } = req.body;

    const reminder = new Reminder({
      user: req.user._id,
      title,
      description,
      type,
      relatedItem,
      date,
      time,
      repeat,
      repeatEndDate,
      notifications: notifications || [
        { type: 'in-app', time: '1hour', sent: false },
        { type: 'email', time: '1day', sent: false }
      ],
      priority: priority || 'medium',
      category: category || 'academic',
      tags,
      location,
      color,
      notes
    });

    await reminder.save();

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder
    });

  } catch (error) {
    console.error('Reminder creation error:', error);
    res.status(500).json({
      error: 'Reminder creation failed',
      message: 'Internal server error'
    });
  }
});

// Update reminder
router.put('/:id', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Valid priority is required'),
  body('category').optional().isIn(['academic', 'personal', 'social', 'health', 'other']).withMessage('Valid category is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({
        error: 'Reminder not found',
        message: 'The requested reminder does not exist'
      });
    }

    // Check if user owns this reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this reminder'
      });
    }

    const updateData = req.body;
    delete updateData.user; // Prevent changing user

    const updatedReminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('relatedItem.id');

    res.json({
      message: 'Reminder updated successfully',
      reminder: updatedReminder
    });

  } catch (error) {
    console.error('Reminder update error:', error);
    res.status(500).json({
      error: 'Reminder update failed',
      message: 'Internal server error'
    });
  }
});

// Mark reminder as completed
router.post('/:id/complete', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({
        error: 'Reminder not found',
        message: 'The requested reminder does not exist'
      });
    }

    // Check if user owns this reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this reminder'
      });
    }

    await reminder.markCompleted();

    res.json({
      message: 'Reminder marked as completed',
      reminder
    });

  } catch (error) {
    console.error('Mark reminder complete error:', error);
    res.status(500).json({
      error: 'Mark complete failed',
      message: 'Internal server error'
    });
  }
});

// Delete reminder
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    
    if (!reminder) {
      return res.status(404).json({
        error: 'Reminder not found',
        message: 'The requested reminder does not exist'
      });
    }

    // Check if user owns this reminder
    if (reminder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have access to this reminder'
      });
    }

    await Reminder.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Reminder deleted successfully'
    });

  } catch (error) {
    console.error('Reminder deletion error:', error);
    res.status(500).json({
      error: 'Reminder deletion failed',
      message: 'Internal server error'
    });
  }
});

// Get upcoming reminders
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const reminders = await Reminder.find({
      user: req.user._id,
      date: { $gte: new Date() },
      isCompleted: false,
      isActive: true
    })
    .populate('relatedItem.id')
    .sort({ date: 1 })
    .limit(parseInt(limit));

    res.json({ reminders });

  } catch (error) {
    console.error('Upcoming reminders fetch error:', error);
    res.status(500).json({
      error: 'Upcoming reminders fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get overdue reminders
router.get('/overdue', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const reminders = await Reminder.find({
      user: req.user._id,
      date: { $lt: new Date() },
      isCompleted: false,
      isActive: true
    })
    .populate('relatedItem.id')
    .sort({ date: 1 })
    .limit(parseInt(limit));

    res.json({ reminders });

  } catch (error) {
    console.error('Overdue reminders fetch error:', error);
    res.status(500).json({
      error: 'Overdue reminders fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get reminder statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    
    const stats = {
      total: await Reminder.countDocuments({ user: req.user._id }),
      active: await Reminder.countDocuments({
        user: req.user._id,
        isCompleted: false,
        isActive: true
      }),
      completed: await Reminder.countDocuments({
        user: req.user._id,
        isCompleted: true
      }),
      overdue: await Reminder.countDocuments({
        user: req.user._id,
        date: { $lt: now },
        isCompleted: false,
        isActive: true
      }),
      today: await Reminder.countDocuments({
        user: req.user._id,
        date: {
          $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        },
        isCompleted: false,
        isActive: true
      })
    };

    res.json({ stats });

  } catch (error) {
    console.error('Reminder stats error:', error);
    res.status(500).json({
      error: 'Stats fetch failed',
      message: 'Internal server error'
    });
  }
});

export default router; 