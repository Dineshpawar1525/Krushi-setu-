const mongoose = require('mongoose');

const NotificationTemplateSchema = new mongoose.Schema({
  // Template Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    enum: [
      'task_reminder',
      'weather_alert',
      'equipment_maintenance',
      'harvest_ready',
      'pest_alert',
      'irrigation_reminder',
      'team_assignment',
      'system_alert',
      'custom'
    ],
    required: true
  },
  
  // Template Content
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
  
  // Variables and Placeholders
  variables: [{
    name: String,
    type: {
      type: String,
      enum: ['string', 'number', 'date', 'boolean', 'object']
    },
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: String,
    description: String
  }],
  
  // Default Settings
  defaultPriority: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  defaultDeliveryMethods: [{
    type: String,
    enum: ['push', 'email', 'sms', 'in_app']
  }],
  
  // Scheduling Options
  schedulingOptions: {
    canSchedule: {
      type: Boolean,
      default: true
    },
    defaultAdvanceTime: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours', 'days', 'weeks']
      }
    },
    canRecur: {
      type: Boolean,
      default: false
    },
    defaultRecurrence: {
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
      },
      interval: Number
    }
  },
  
  // Weather and Environmental Triggers
  weatherTriggers: {
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
    },
    weatherSources: [String]
  },
  
  // Location Triggers
  locationTriggers: {
    enabled: {
      type: Boolean,
      default: false
    },
    geofenceRadius: Number,
    fieldSpecific: {
      type: Boolean,
      default: false
    }
  },
  
  // Content Customization
  contentOptions: {
    allowRichText: {
      type: Boolean,
      default: false
    },
    allowImages: {
      type: Boolean,
      default: false
    },
    allowAttachments: {
      type: Boolean,
      default: false
    },
    maxImageCount: {
      type: Number,
      default: 3
    },
    maxAttachmentSize: Number // in bytes
  },
  
  // Actions and Responses
  actionOptions: {
    allowActions: {
      type: Boolean,
      default: false
    },
    defaultActions: [{
      label: String,
      action: String,
      style: {
        type: String,
        enum: ['primary', 'secondary', 'success', 'warning', 'danger']
      }
    }],
    requireResponse: {
      type: Boolean,
      default: false
    },
    responseOptions: [String]
  },
  
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
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: String, // HH:MM format
      end: String,   // HH:MM format
      timezone: String
    }
  },
  
  // Template Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  
  // Usage Statistics
  usageStats: {
    timesUsed: {
      type: Number,
      default: 0
    },
    lastUsed: Date,
    successRate: Number,
    averageDeliveryTime: Number // in seconds
  },
  
  // Template Metadata
  tags: [String],
  version: {
    type: String,
    default: '1.0.0'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
NotificationTemplateSchema.index({ category: 1, isActive: 1 });
NotificationTemplateSchema.index({ name: 1, createdBy: 1 });
NotificationTemplateSchema.index({ isPublic: 1, isActive: 1 });
NotificationTemplateSchema.index({ tags: 1 });

// Methods
NotificationTemplateSchema.methods.incrementUsage = function() {
  this.usageStats.timesUsed++;
  this.usageStats.lastUsed = new Date();
  return this.save();
};

NotificationTemplateSchema.methods.updateSuccessRate = function(successRate) {
  this.usageStats.successRate = successRate;
  return this.save();
};

NotificationTemplateSchema.methods.updateDeliveryTime = function(deliveryTime) {
  if (this.usageStats.averageDeliveryTime) {
    this.usageStats.averageDeliveryTime = 
      (this.usageStats.averageDeliveryTime + deliveryTime) / 2;
  } else {
    this.usageStats.averageDeliveryTime = deliveryTime;
  }
  return this.save();
};

NotificationTemplateSchema.methods.createNotification = function(data) {
  const notificationData = {
    title: this.title,
    message: this.message,
    type: this.category,
    priority: data.priority || this.defaultPriority,
    scheduledFor: data.scheduledFor,
    recipients: data.recipients || [],
    relatedEvent: data.relatedEvent,
    relatedField: data.relatedField,
    templateId: this._id,
    createdBy: data.createdBy
  };
  
  // Apply variables
  if (data.variables) {
    let processedTitle = this.title;
    let processedMessage = this.message;
    
    Object.keys(data.variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedTitle = processedTitle.replace(regex, data.variables[key]);
      processedMessage = processedMessage.replace(regex, data.variables[key]);
    });
    
    notificationData.title = processedTitle;
    notificationData.message = processedMessage;
  }
  
  return mongoose.model('Notification').create(notificationData);
};

NotificationTemplateSchema.methods.validateVariables = function(variables) {
  const errors = [];
  
  this.variables.forEach(variable => {
    if (variable.required && (!variables || !variables[variable.name])) {
      errors.push(`Required variable '${variable.name}' is missing`);
    }
    
    if (variables && variables[variable.name]) {
      const value = variables[variable.name];
      switch (variable.type) {
        case 'number':
          if (isNaN(value)) {
            errors.push(`Variable '${variable.name}' must be a number`);
          }
          break;
        case 'date':
          if (isNaN(Date.parse(value))) {
            errors.push(`Variable '${variable.name}' must be a valid date`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Variable '${variable.name}' must be a boolean`);
          }
          break;
      }
    }
  });
  
  return errors;
};

// Static methods
NotificationTemplateSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

NotificationTemplateSchema.statics.findPublic = function() {
  return this.find({ isPublic: true, isActive: true });
};

NotificationTemplateSchema.statics.findByUser = function(userId) {
  return this.find({ createdBy: userId });
};

NotificationTemplateSchema.statics.findMostUsed = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'usageStats.timesUsed': -1 })
    .limit(limit);
};

// Pre-save middleware
NotificationTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('NotificationTemplate', NotificationTemplateSchema);
