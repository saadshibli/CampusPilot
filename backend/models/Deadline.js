import mongoose from 'mongoose';

const deadlineSchema = new mongoose.Schema({
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
    enum: ['assignment', 'exam', 'project', 'presentation', 'quiz', 'midterm', 'final', 'other'],
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  submissionType: {
    type: String,
    enum: ['online', 'offline', 'both'],
    default: 'online'
  },
  submissionDetails: {
    platform: String,
    link: String,
    location: String,
    instructions: String
  },
  weightage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalMarks: {
    type: Number,
    min: 0,
    default: 0
  },
  attachments: [{
    title: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  isGroupProject: {
    type: Boolean,
    default: false
  },
  groupSize: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 1
    }
  },
  lateSubmission: {
    allowed: {
      type: Boolean,
      default: false
    },
    penalty: {
      type: Number,
      default: 0
    },
    deadline: Date
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'overdue', 'completed'],
    default: 'upcoming'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  color: {
    type: String,
    default: '#EF4444'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  reminders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder'
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
deadlineSchema.index({ dueDate: 1 });
deadlineSchema.index({ class: 1 });
deadlineSchema.index({ type: 1, status: 1 });
deadlineSchema.index({ isActive: 1 });

// Virtual for checking if deadline is overdue
deadlineSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

// Virtual for checking if deadline is today
deadlineSchema.virtual('isToday').get(function() {
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  return today.toDateString() === dueDate.toDateString();
});

// Virtual for checking if deadline is within 24 hours
deadlineSchema.virtual('isUrgent').get(function() {
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  const diffHours = (dueDate - now) / (1000 * 60 * 60);
  return diffHours <= 24 && diffHours > 0;
});

// Method to update status based on due date
deadlineSchema.methods.updateStatus = function() {
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  
  if (now > dueDate) {
    this.status = 'overdue';
  } else if (now.toDateString() === dueDate.toDateString()) {
    this.status = 'active';
  } else {
    this.status = 'upcoming';
  }
  
  return this.save();
};

export default mongoose.model('Deadline', deadlineSchema); 