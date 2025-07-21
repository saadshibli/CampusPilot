import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['club', 'college', 'academic', 'cultural', 'sports', 'workshop', 'seminar', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'social', 'cultural', 'sports', 'technical', 'career', 'other'],
    required: true
  },
  organizer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['club', 'department', 'college', 'external'],
      required: true
    },
    contact: {
      name: String,
      email: String,
      phone: String
    }
  },
  date: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  location: {
    venue: {
      type: String,
      required: true,
      trim: true
    },
    room: String,
    building: String,
    address: String,
    isOnline: {
      type: Boolean,
      default: false
    },
    meetingLink: String
  },
  capacity: {
    type: Number,
    min: 1
  },
  registeredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  image: {
    type: String,
    default: ''
  },
  attachments: [{
    title: String,
    url: String,
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  registrationDeadline: {
    type: Date
  },
  maxRegistrations: {
    type: Number
  },
  color: {
    type: String,
    default: '#10B981'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
eventSchema.index({ 'date.start': 1 });
eventSchema.index({ type: 1, category: 1 });
eventSchema.index({ 'registeredUsers.user': 1 });
eventSchema.index({ isActive: 1, isPublic: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  if (!this.capacity) return false;
  return this.registeredUsers.length >= this.capacity;
});

// Virtual for checking if registration is open
eventSchema.virtual('registrationOpen').get(function() {
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

export default mongoose.model('Event', eventSchema); 