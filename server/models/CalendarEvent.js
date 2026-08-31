const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  // Basic Event Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: ['planting', 'watering', 'fertilizing', 'harvesting', 'maintenance', 'other'],
    default: 'other'
  },
  
  // Scheduling Information
  plannedDate: {
    type: Date,
    required: true
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 1
  },
  actualDuration: {
    type: Number // in hours
  },
  
  // Status and Priority
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'cancelled', 'overdue'],
    default: 'planned'
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  
  // Recurring Events
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
    default: null
  },
  recurrenceInterval: {
    type: Number, // every X days/weeks/months
    default: 1
  },
  recurrenceEndDate: {
    type: Date
  },
  parentEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent'
  },
  
  // Location and Field Information
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    },
    address: String,
    fieldName: String
  },
  
  // Team and Assignment
  assignedTo: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'supervisor', 'worker', 'observer']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Weather and Environmental Conditions
  weatherConditions: {
    temperature: Number,
    humidity: Number,
    precipitation: Number,
    windSpeed: Number,
    conditions: String
  },
  weatherDependent: {
    type: Boolean,
    default: false
  },
  optimalConditions: {
    temperatureRange: {
      min: Number,
      max: Number
    },
    humidityRange: {
      min: Number,
      max: Number
    },
    precipitationThreshold: Number
  },
  
  // Resources and Equipment
  requiredEquipment: [{
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment'
    },
    equipmentName: String,
    quantity: Number,
    duration: Number // hours needed
  }],
  requiredResources: [{
    resourceType: {
      type: String,
      enum: ['seeds', 'fertilizer', 'pesticide', 'fuel', 'labor', 'other']
    },
    resourceName: String,
    quantity: Number,
    unit: String,
    cost: Number
  }],
  
  // Documentation and Media
  photos: [{
    url: String,
    caption: String,
    takenAt: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    }
  }],
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: false
    }
  }],
  
  // Completion and Verification
  completionNotes: String,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  qualityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  // Notifications and Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['push', 'email', 'sms', 'in_app']
    },
    scheduledFor: Date,
    message: String,
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date
  }],
  
  // Dependencies and Successors
  dependencies: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CalendarEvent'
    },
    dependencyType: {
      type: String,
      enum: ['must_complete', 'should_complete', 'can_start_after']
    }
  }],
  successorEvents: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CalendarEvent'
    },
    delayDays: Number
  }],
  
  // Cost and Budget Tracking
  estimatedCost: Number,
  actualCost: Number,
  costBreakdown: [{
    category: String,
    amount: Number,
    description: String
  }],
  
  // Performance Metrics
  efficiencyRating: {
    type: Number,
    min: 1,
    max: 5
  },
  lessonsLearned: String,
  improvements: String,
  
  // Metadata
  tags: [String],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  cancelledAt: Date
});

// Indexes for better performance
CalendarEventSchema.index({ plannedDate: 1, status: 1 });
CalendarEventSchema.index({ fieldId: 1, plannedDate: 1 });
CalendarEventSchema.index({ assignedTo: 1, status: 1 });
CalendarEventSchema.index({ category: 1, status: 1 });
CalendarEventSchema.index({ 'location.coordinates': '2dsphere' });
CalendarEventSchema.index({ createdAt: -1 });

// Virtual for duration calculation
CalendarEventSchema.virtual('duration').get(function() {
  if (this.actualStartDate && this.actualEndDate) {
    return (this.actualEndDate - this.actualStartDate) / (1000 * 60 * 60); // hours
  }
  return this.estimatedDuration;
});

// Virtual for overdue status
CalendarEventSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.plannedDate;
});

// Pre-save middleware to update status
CalendarEventSchema.pre('save', function(next) {
  if (this.isOverdue && this.status === 'planned') {
    this.status = 'overdue';
  }
  this.updatedAt = new Date();
  next();
});

// Methods
CalendarEventSchema.methods.markAsCompleted = function(completionData) {
  this.status = 'completed';
  this.actualEndDate = new Date();
  this.completedAt = new Date();
  
  if (completionData) {
    this.completionNotes = completionData.notes;
    this.qualityRating = completionData.qualityRating;
    this.actualCost = completionData.actualCost;
    this.efficiencyRating = completionData.efficiencyRating;
    this.lessonsLearned = completionData.lessonsLearned;
  }
  
  return this.save();
};

CalendarEventSchema.methods.addNote = function(noteContent, authorId, isPrivate = false) {
  this.notes.push({
    content: noteContent,
    author: authorId,
    isPrivate: isPrivate
  });
  return this.save();
};

CalendarEventSchema.methods.addPhoto = function(photoUrl, caption, coordinates) {
  this.photos.push({
    url: photoUrl,
    caption: caption,
    location: coordinates ? {
      type: 'Point',
      coordinates: coordinates
    } : undefined
  });
  return this.save();
};

CalendarEventSchema.methods.assignToUser = function(userId, role = 'worker') {
  const existingAssignment = this.assignedTo.find(assignment => 
    assignment.userId.toString() === userId.toString()
  );
  
  if (!existingAssignment) {
    this.assignedTo.push({
      userId: userId,
      role: role
    });
  }
  
  return this.save();
};

CalendarEventSchema.methods.createReminder = function(type, scheduledFor, message) {
  this.reminders.push({
    type: type,
    scheduledFor: scheduledFor,
    message: message
  });
  return this.save();
};

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
