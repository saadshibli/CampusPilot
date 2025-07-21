import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['deadline', 'event', 'class', 'exam', 'meeting', 'personal', 'custom'],
    required: true
  },
  relatedItem: {
    type: {
      type: String,
      enum: ['deadline', 'event', 'class', 'notice'],
      required: false
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedItem.type',
      required: false
    }
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    trim: true
  },
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'none'
  },
  repeatEndDate: {
    type: Date
  },
  notifications: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms', 'in-app'],
      required: true
    },
    time: {
      type: String,
      enum: ['15min', '30min', '1hour', '1day', '1week', 'custom'],
      required: true
    },
    customMinutes: {
      type: Number,
      min: 1
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['academic', 'personal', 'social', 'health', 'other'],
    default: 'academic'
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  color: {
    type: String,
    default: '#8B5CF6'
  },
  notes: {
    type: String,
    trim: true
  },
  attachments: [{
    title: String,
    url: String,
    type: String
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
reminderSchema.index({ user: 1, date: 1 });
reminderSchema.index({ user: 1, isActive: 1 });
reminderSchema.index({ 'notifications.sent': 1, date: 1 });
reminderSchema.index({ type: 1, category: 1 });

// Virtual for checking if reminder is overdue
reminderSchema.virtual('isOverdue').get(function() {
  return new Date() > this.date && !this.isCompleted;
});

// Virtual for checking if reminder is today
reminderSchema.virtual('isToday').get(function() {
  const today = new Date();
  const reminderDate = new Date(this.date);
  return today.toDateString() === reminderDate.toDateString();
});

// Virtual for checking if reminder is within 24 hours
reminderSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  const reminderDate = new Date(this.date);
  const diffHours = (reminderDate - now) / (1000 * 60 * 60);
  return diffHours <= 24 && diffHours > 0 && !this.isCompleted;
});

// Method to mark reminder as completed
reminderSchema.methods.markCompleted = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to get next occurrence for repeating reminders
reminderSchema.methods.getNextOccurrence = function() {
  if (this.repeat === 'none' || this.isCompleted) {
    return null;
  }

  const now = new Date();
  const baseDate = new Date(this.date);
  let nextDate = new Date(baseDate);

  while (nextDate <= now) {
    switch (this.repeat) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    if (this.repeatEndDate && nextDate > this.repeatEndDate) {
      return null;
    }
  }

  return nextDate;
};

export default mongoose.model('Reminder', reminderSchema); 