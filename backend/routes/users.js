import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Internal server error'
    });
  }
});

// Update user profile
router.put('/profile', [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('phone').optional().trim(),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('year').optional().isInt({ min: 1, max: 5 }).withMessage('Year must be between 1 and 5'),
  body('semester').optional().isInt({ min: 1, max: 8 }).withMessage('Semester must be between 1 and 8')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, phone, department, year, semester, preferences } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (department) updateData.department = department;
    if (year) updateData.year = year;
    if (semester) updateData.semester = semester;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Internal server error'
    });
  }
});

// Get user dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('clubs')
      .select('-password');

    // Get upcoming deadlines, events, and notices for the user
    const Deadline = (await import('../models/Deadline.js')).default;
    const Event = (await import('../models/Event.js')).default;
    const Notice = (await import('../models/Notice.js')).default;

    const upcomingDeadlines = await Deadline.find({
      class: { $in: user.classes || [] },
      dueDate: { $gte: new Date() },
      isActive: true
    }).populate('class').limit(5);

    const upcomingEvents = await Event.find({
      'date.start': { $gte: new Date() },
      isActive: true,
      isPublic: true
    }).limit(5);

    const recentNotices = await Notice.find({
      isActive: true,
      $or: [
        { 'targetAudience.isForAll': true },
        { 'targetAudience.departments': user.department },
        { 'targetAudience.years': user.year }
      ]
    }).sort({ publishDate: -1 }).limit(5);

    res.json({
      user,
      dashboard: {
        upcomingDeadlines,
        upcomingEvents,
        recentNotices
      }
    });

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({
      error: 'Dashboard fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats', async (req, res) => {
  try {
    const Deadline = (await import('../models/Deadline.js')).default;
    const Event = (await import('../models/Event.js')).default;
    const Reminder = (await import('../models/Reminder.js')).default;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const stats = {
      totalDeadlines: await Deadline.countDocuments({
        class: { $in: req.user.classes || [] },
        isActive: true
      }),
      upcomingDeadlines: await Deadline.countDocuments({
        class: { $in: req.user.classes || [] },
        dueDate: { $gte: now },
        isActive: true
      }),
      overdueDeadlines: await Deadline.countDocuments({
        class: { $in: req.user.classes || [] },
        dueDate: { $lt: now },
        status: { $ne: 'completed' },
        isActive: true
      }),
      totalEvents: await Event.countDocuments({
        'date.start': { $gte: startOfWeek },
        isActive: true
      }),
      activeReminders: await Reminder.countDocuments({
        user: req.user._id,
        isActive: true,
        isCompleted: false
      })
    };

    res.json({ stats });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      error: 'Stats fetch failed',
      message: 'Internal server error'
    });
  }
});

export default router; 