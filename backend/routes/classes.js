import express from 'express';
import { body, validationResult } from 'express-validator';
import Class from '../models/Class.js';

const router = express.Router();

// Get all classes for the user
router.get('/', async (req, res) => {
  try {
    const { semester, year, department } = req.query;
    
    let query = { isActive: true };
    
    if (semester) query.semester = parseInt(semester);
    if (year) query.year = parseInt(year);
    if (department) query.department = department;

    const classes = await Class.find(query)
      .populate('instructor')
      .sort({ name: 1 });

    res.json({ classes });

  } catch (error) {
    console.error('Classes fetch error:', error);
    res.status(500).json({
      error: 'Classes fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get class by ID
router.get('/:id', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('instructor')
      .populate('students', 'name email studentId');

    if (!classData) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The requested class does not exist'
      });
    }

    res.json({ class: classData });

  } catch (error) {
    console.error('Class fetch error:', error);
    res.status(500).json({
      error: 'Class fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get user's enrolled classes
router.get('/enrolled/me', async (req, res) => {
  try {
    const classes = await Class.find({
      students: req.user._id,
      isActive: true
    })
    .populate('instructor')
    .sort({ name: 1 });

    res.json({ classes });

  } catch (error) {
    console.error('Enrolled classes fetch error:', error);
    res.status(500).json({
      error: 'Enrolled classes fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get class schedule for a specific day
router.get('/schedule/:day', async (req, res) => {
  try {
    const { day } = req.params;
    const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    if (!validDays.includes(day.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid day',
        message: 'Please provide a valid day of the week'
      });
    }

    const classes = await Class.find({
      students: req.user._id,
      'schedule.day': day.toLowerCase(),
      isActive: true
    })
    .populate('instructor')
    .sort({ 'schedule.startTime': 1 });

    // Filter and format schedule for the specific day
    const schedule = classes.map(cls => {
      const daySchedule = cls.schedule.filter(s => s.day === day.toLowerCase());
      return {
        class: {
          _id: cls._id,
          name: cls.name,
          code: cls.code,
          instructor: cls.instructor,
          color: cls.color
        },
        schedule: daySchedule
      };
    });

    res.json({ schedule });

  } catch (error) {
    console.error('Schedule fetch error:', error);
    res.status(500).json({
      error: 'Schedule fetch failed',
      message: 'Internal server error'
    });
  }
});

// Get weekly schedule
router.get('/schedule/weekly', async (req, res) => {
  try {
    const classes = await Class.find({
      students: req.user._id,
      isActive: true
    })
    .populate('instructor')
    .sort({ 'schedule.startTime': 1 });

    // Organize by days
    const weeklySchedule = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    classes.forEach(cls => {
      cls.schedule.forEach(scheduleItem => {
        weeklySchedule[scheduleItem.day].push({
          class: {
            _id: cls._id,
            name: cls.name,
            code: cls.code,
            instructor: cls.instructor,
            color: cls.color
          },
          schedule: scheduleItem
        });
      });
    });

    // Sort each day by start time
    Object.keys(weeklySchedule).forEach(day => {
      weeklySchedule[day].sort((a, b) => 
        a.schedule.startTime.localeCompare(b.schedule.startTime)
      );
    });

    res.json({ weeklySchedule });

  } catch (error) {
    console.error('Weekly schedule fetch error:', error);
    res.status(500).json({
      error: 'Weekly schedule fetch failed',
      message: 'Internal server error'
    });
  }
});

// Enroll in a class
router.post('/:id/enroll', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The requested class does not exist'
      });
    }

    if (!classData.isActive) {
      return res.status(400).json({
        error: 'Class not available',
        message: 'This class is not currently active'
      });
    }

    // Check if user is already enrolled
    if (classData.students.includes(req.user._id)) {
      return res.status(400).json({
        error: 'Already enrolled',
        message: 'You are already enrolled in this class'
      });
    }

    // Add user to class
    classData.students.push(req.user._id);
    await classData.save();

    // Add class to user's classes
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { classes: classData._id }
    });

    res.json({
      message: 'Successfully enrolled in class',
      class: classData
    });

  } catch (error) {
    console.error('Class enrollment error:', error);
    res.status(500).json({
      error: 'Enrollment failed',
      message: 'Internal server error'
    });
  }
});

// Unenroll from a class
router.delete('/:id/enroll', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The requested class does not exist'
      });
    }

    // Check if user is enrolled
    if (!classData.students.includes(req.user._id)) {
      return res.status(400).json({
        error: 'Not enrolled',
        message: 'You are not enrolled in this class'
      });
    }

    // Remove user from class
    classData.students = classData.students.filter(
      studentId => studentId.toString() !== req.user._id.toString()
    );
    await classData.save();

    // Remove class from user's classes
    const User = (await import('../models/User.js')).default;
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { classes: classData._id }
    });

    res.json({
      message: 'Successfully unenrolled from class'
    });

  } catch (error) {
    console.error('Class unenrollment error:', error);
    res.status(500).json({
      error: 'Unenrollment failed',
      message: 'Internal server error'
    });
  }
});

// Get class materials
router.get('/:id/materials', async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .select('materials name code');

    if (!classData) {
      return res.status(404).json({
        error: 'Class not found',
        message: 'The requested class does not exist'
      });
    }

    res.json({
      class: {
        _id: classData._id,
        name: classData.name,
        code: classData.code
      },
      materials: classData.materials
    });

  } catch (error) {
    console.error('Materials fetch error:', error);
    res.status(500).json({
      error: 'Materials fetch failed',
      message: 'Internal server error'
    });
  }
});

export default router; 