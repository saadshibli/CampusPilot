import express from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 20 } = req.query;
    
    let query = { isActive: true, isPublic: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query['date.start'] = {};
      if (startDate) query['date.start'].$gte = new Date(startDate);
      if (endDate) query['date.start'].$lte = new Date(endDate);
    }

    const events = await Event.find(query)
      .populate('organizer')
      .sort({ 'date.start': 1 })
      .limit(parseInt(limit));

    res.json({ events });

  } catch (error) {
    console.error('Events fetch error:', error);
    res.status(500).json({
      error: 'Events fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer')
      .populate('registeredUsers.user', 'name email studentId');

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    res.json({ event });

  } catch (error) {
    console.error('Event fetch error:', error);
    res.status(500).json({
      error: 'Event fetch failed',
      message: 'Internal server error'
    });
  }
});

// Register for an event
router.post('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    if (!event.isActive) {
      return res.status(400).json({
        error: 'Event not available',
        message: 'This event is not currently active'
      });
    }

    // Check if registration is open
    if (!event.registrationOpen) {
      return res.status(400).json({
        error: 'Registration closed',
        message: 'Registration for this event is closed'
      });
    }

    // Check if event is full
    if (event.isFull) {
      return res.status(400).json({
        error: 'Event full',
        message: 'This event is at full capacity'
      });
    }

    // Check if user is already registered
    const alreadyRegistered = event.registeredUsers.some(
      registration => registration.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        error: 'Already registered',
        message: 'You are already registered for this event'
      });
    }

    // Register user
    event.registeredUsers.push({
      user: req.user._id,
      registeredAt: new Date(),
      status: 'registered'
    });

    await event.save();

    res.json({
      message: 'Successfully registered for event',
      event
    });

  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// Unregister from an event
router.delete('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'The requested event does not exist'
      });
    }

    // Check if user is registered
    const registrationIndex = event.registeredUsers.findIndex(
      registration => registration.user.toString() === req.user._id.toString()
    );

    if (registrationIndex === -1) {
      return res.status(400).json({
        error: 'Not registered',
        message: 'You are not registered for this event'
      });
    }

    // Remove registration
    event.registeredUsers.splice(registrationIndex, 1);
    await event.save();

    res.json({
      message: 'Successfully unregistered from event'
    });

  } catch (error) {
    console.error('Event unregistration error:', error);
    res.status(500).json({
      error: 'Unregistration failed',
      message: 'Internal server error'
    });
  }
});

// Get user's registered events
router.get('/registered/me', async (req, res) => {
  try {
    const events = await Event.find({
      'registeredUsers.user': req.user._id,
      isActive: true
    })
    .populate('organizer')
    .sort({ 'date.start': 1 });

    res.json({ events });

  } catch (error) {
    console.error('Registered events fetch error:', error);
    res.status(500).json({
      error: 'Registered events fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get upcoming events
router.get('/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const events = await Event.find({
      'date.start': { $gte: new Date() },
      isActive: true,
      isPublic: true
    })
    .populate('organizer')
    .sort({ 'date.start': 1 })
    .limit(parseInt(limit));

    res.json({ events });

  } catch (error) {
    console.error('Upcoming events fetch error:', error);
    res.status(500).json({
      error: 'Upcoming events fetch failed',
      message: 'Internal server error'
    });
  }
});

export default router; 