import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['academic', 'administrative', 'event', 'emergency', 'general', 'exam', 'holiday'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  issuedBy: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      trim: true
    }
  },
  targetAudience: {
    departments: [{
      type: String,
      trim: true
    }],
    years: [{
      type: Number,
      min: 1,
      max: 5
    }],
    specificUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isForAll: {
      type: Boolean,
      default: false
    }
  },
  attachments: [{
    title: String,
    url: String,
    type: String,
    size: Number
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  color: {
    type: String,
    default: '#F59E0B'
  },
  externalLink: {
    type: String,
    trim: true
  },
  requiresAcknowledgment: {
    type: Boolean,
    default: false
  },
  acknowledgedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
noticeSchema.index({ publishDate: -1 });
noticeSchema.index({ type: 1, priority: 1 });
noticeSchema.index({ isActive: 1, isPinned: 1 });
noticeSchema.index({ 'targetAudience.departments': 1 });
noticeSchema.index({ 'targetAudience.years': 1 });

// Virtual for checking if notice is expired
noticeSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Virtual for checking if notice is new (published within last 7 days)
noticeSchema.virtual('isNew').get(function() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return this.publishDate > sevenDaysAgo;
});

export default mongoose.model('Notice', noticeSchema); 