const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Basic Notification Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  
  // Recipients
  recipients: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    deliveryMethod: {
      type: String,
      enum: ['push', 'email', 'sms', 'in_app'],
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    delivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: Date,
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    failed: {
      type: Boolean,
      default: false
    },
    failureReason: String
  }],
  
  // Notification Type and Priority
  type: {
    type: String,
    enum: [
      'task_reminder',
      'task_overdue',
      'task_completed',
      'weather_alert',
      'equipment_maintenance',
      'harvest_ready',
      'pest_alert',
      'irrigation_reminder',
      'team_assignment',
      'system_alert',
      'weather_dependent',
      'equipment_failure',
      'inventory_low',
      'field_condition',
      'custom'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  
  // Related Entities
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent'
  },
  relatedField: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  },
  relatedEquipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  },
  
  // Scheduling
  scheduledFor: {
    type: Date,
    required: true
  },
  expiresAt: Date,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
  },
  recurrenceInterval: {
    type: Number,
    default: 1
  },
  recurrenceEndDate: Date,
  
  // Weather and Environmental Triggers
  weatherTrigger: {
    enabled: {
      type: Boolean,
      default: false
    },
    conditions: {
      temperature: {
        min: Number,
        max: Number
      },
      humidity: {
        min: Number,
        max: Number
      },
      precipitation: {
        min: Number,
        max: Number
      },
      windSpeed: {
        min: Number,
        max: Number
      }
    }
  },
  
  // Location-based Triggers
  locationTrigger: {
    enabled: {
      type: Boolean,
      default: false
    },
    geofence: {
      center: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number]
      },
      radius: Number, // in meters
      fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field'
      }
    }
  },
  
  // Content and Media
  content: {
    richText: String,
    images: [{
      url: String,
      caption: String
    }],
    attachments: [{
      url: String,
      filename: String,
      mimeType: String
    }]
  },
  
  // Actions and Responses
  actions: [{
    label: String,
    action: String, // URL or action identifier
    style: {
      type: String,
      enum: ['primary', 'secondary', 'success', 'warning', 'danger']
    }
  }],
  requiresResponse: {
    type: Boolean,
    default: false
  },
  responseDeadline: Date,
  responses: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    response: String,
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Template and Automation
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationTemplate'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: String,
  templateCategory: String,
  
  // Delivery Settings
  deliverySettings: {
    retryAttempts: {
      type: Number,
      default: 3
    },
    retryInterval: {
      type: Number,
      default: 300 // seconds
    },
    maxRetries: {
      type: Number,
      default: 3
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  
  // Analytics and Tracking
  analytics: {
    totalSent: {
      type: Number,
      default: 0
    },
    totalDelivered: {
      type: Number,
      default: 0
    },
    totalRead: {
      type: Number,
      default: 0
    },
    totalClicked: {
      type: Number,
      default: 0
    },
    deliveryRate: Number,
    readRate: Number,
    clickRate: Number
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['scheduled', 'sending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  sentAt: Date,
  deliveredAt: Date
});

// Indexes
NotificationSchema.index({ scheduledFor: 1, status: 1 });
NotificationSchema.index({ 'recipients.userId': 1, status: 1 });
NotificationSchema.index({ type: 1, priority: 1 });
NotificationSchema.index({ relatedEvent: 1 });
NotificationSchema.index({ relatedField: 1 });
NotificationSchema.index({ createdAt: -1 });

// Virtual for delivery rate
NotificationSchema.virtual('deliveryRate').get(function() {
  if (this.analytics.totalSent === 0) return 0;
  return (this.analytics.totalDelivered / this.analytics.totalSent) * 100;
});

// Virtual for read rate
NotificationSchema.virtual('readRate').get(function() {
  if (this.analytics.totalDelivered === 0) return 0;
  return (this.analytics.totalRead / this.analytics.totalDelivered) * 100;
});

// Methods
NotificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  this.analytics.totalSent = this.recipients.length;
  return this.save();
};

NotificationSchema.methods.markAsDelivered = function(userId) {
  const recipient = this.recipients.find(r => r.userId.toString() === userId.toString());
  if (recipient) {
    recipient.delivered = true;
    recipient.deliveredAt = new Date();
    this.analytics.totalDelivered++;
  }
  return this.save();
};

NotificationSchema.methods.markAsRead = function(userId) {
  const recipient = this.recipients.find(r => r.userId.toString() === userId.toString());
  if (recipient) {
    recipient.read = true;
    recipient.readAt = new Date();
    this.analytics.totalRead++;
  }
  return this.save();
};

NotificationSchema.methods.addRecipient = function(userId, deliveryMethod) {
  this.recipients.push({
    userId: userId,
    deliveryMethod: deliveryMethod
  });
  return this.save();
};

NotificationSchema.methods.addResponse = function(userId, response) {
  this.responses.push({
    userId: userId,
    response: response
  });
  return this.save();
};

NotificationSchema.methods.updateAnalytics = function() {
  this.analytics.deliveryRate = this.deliveryRate;
  this.analytics.readRate = this.readRate;
  return this.save();
};

// Static methods
NotificationSchema.statics.findByUser = function(userId, options = {}) {
  const query = {
    'recipients.userId': userId,
    ...options
  };
  return this.find(query).sort({ createdAt: -1 });
};

NotificationSchema.statics.findOverdue = function() {
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lt: new Date() }
  });
};

NotificationSchema.statics.findByType = function(type, options = {}) {
  return this.find({ type, ...options });
};

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Notification', NotificationSchema);
