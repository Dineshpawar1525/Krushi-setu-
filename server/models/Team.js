const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  // Basic Team Information
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
  
  // Team Structure
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'supervisor', 'worker', 'observer'],
      required: true
    },
    permissions: [{
      type: String,
      enum: [
        'view_calendar',
        'create_events',
        'edit_events',
        'delete_events',
        'assign_tasks',
        'view_reports',
        'manage_team',
        'view_analytics',
        'manage_equipment',
        'manage_fields'
      ]
    }],
    joinedAt: {
      type: Date,
      default: Date.now
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'active'
    },
    lastActive: Date
  }],
  
  // Team Settings
  settings: {
    allowSelfAssignment: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      pushNotifications: {
        type: Boolean,
        default: true
      },
      smsNotifications: {
        type: Boolean,
        default: false
      }
    },
    workingHours: {
      start: String, // HH:MM format
      end: String,   // HH:MM format
      timezone: String,
      workingDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }]
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // Team Hierarchy
  hierarchy: {
    levels: [{
      level: Number,
      name: String,
      permissions: [String],
      maxMembers: Number
    }],
    reportingStructure: [{
      supervisorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      subordinateIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }]
  },
  
  // Team Performance
  performance: {
    totalTasksAssigned: {
      type: Number,
      default: 0
    },
    totalTasksCompleted: {
      type: Number,
      default: 0
    },
    averageCompletionTime: Number, // in hours
    efficiencyRating: {
      type: Number,
      min: 1,
      max: 5
    },
    lastPerformanceReview: Date
  },
  
  // Team Communication
  communication: {
    channels: [{
      name: String,
      type: {
        type: String,
        enum: ['general', 'project', 'field', 'equipment', 'safety']
      },
      members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      isPrivate: {
        type: Boolean,
        default: false
      }
    }],
    announcements: [{
      title: String,
      content: String,
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
      },
      expiresAt: Date
    }]
  },
  
  // Team Resources
  resources: {
    assignedFields: [{
      fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field'
      },
      assignedAt: Date,
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    assignedEquipment: [{
      equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment'
      },
      assignedAt: Date,
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    budget: {
      allocated: Number,
      spent: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    }
  },
  
  // Team Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  
  // Team Metadata
  tags: [String],
  category: {
    type: String,
    enum: ['field_team', 'maintenance_team', 'harvest_team', 'irrigation_team', 'general'],
    default: 'general'
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
TeamSchema.index({ owner: 1, status: 1 });
TeamSchema.index({ 'members.userId': 1 });
TeamSchema.index({ name: 1, owner: 1 });
TeamSchema.index({ tags: 1 });

// Virtual for completion rate
TeamSchema.virtual('completionRate').get(function() {
  if (this.performance.totalTasksAssigned === 0) return 0;
  return (this.performance.totalTasksCompleted / this.performance.totalTasksAssigned) * 100;
});

// Virtual for active members count
TeamSchema.virtual('activeMembersCount').get(function() {
  return this.members.filter(member => member.status === 'active').length;
});

// Methods
TeamSchema.methods.addMember = function(userId, role, permissions = [], invitedBy) {
  const existingMember = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      userId: userId,
      role: role,
      permissions: permissions,
      invitedBy: invitedBy
    });
  }
  
  return this.save();
};

TeamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.userId.toString() !== userId.toString()
  );
  return this.save();
};

TeamSchema.methods.updateMemberRole = function(userId, role, permissions = []) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (member) {
    member.role = role;
    member.permissions = permissions;
  }
  
  return this.save();
};

TeamSchema.methods.updateMemberStatus = function(userId, status) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (member) {
    member.status = status;
    if (status === 'active') {
      member.lastActive = new Date();
    }
  }
  
  return this.save();
};

TeamSchema.methods.assignField = function(fieldId, assignedBy) {
  this.resources.assignedFields.push({
    fieldId: fieldId,
    assignedAt: new Date(),
    assignedBy: assignedBy
  });
  return this.save();
};

TeamSchema.methods.assignEquipment = function(equipmentId, assignedBy) {
  this.resources.assignedEquipment.push({
    equipmentId: equipmentId,
    assignedAt: new Date(),
    assignedBy: assignedBy
  });
  return this.save();
};

TeamSchema.methods.addAnnouncement = function(title, content, author, priority = 'medium', expiresAt) {
  this.communication.announcements.push({
    title: title,
    content: content,
    author: author,
    priority: priority,
    expiresAt: expiresAt
  });
  return this.save();
};

TeamSchema.methods.updatePerformance = function(tasksAssigned, tasksCompleted, completionTime) {
  this.performance.totalTasksAssigned += tasksAssigned;
  this.performance.totalTasksCompleted += tasksCompleted;
  
  if (completionTime) {
    if (this.performance.averageCompletionTime) {
      this.performance.averageCompletionTime = 
        (this.performance.averageCompletionTime + completionTime) / 2;
    } else {
      this.performance.averageCompletionTime = completionTime;
    }
  }
  
  return this.save();
};

TeamSchema.methods.getMemberPermissions = function(userId) {
  const member = this.members.find(member => 
    member.userId.toString() === userId.toString()
  );
  
  if (!member) return [];
  
  // Owner has all permissions
  if (member.role === 'owner') {
    return [
      'view_calendar',
      'create_events',
      'edit_events',
      'delete_events',
      'assign_tasks',
      'view_reports',
      'manage_team',
      'view_analytics',
      'manage_equipment',
      'manage_fields'
    ];
  }
  
  return member.permissions;
};

TeamSchema.methods.canUserPerformAction = function(userId, action) {
  const permissions = this.getMemberPermissions(userId);
  return permissions.includes(action);
};

// Static methods
TeamSchema.statics.findByUser = function(userId) {
  return this.find({
    'members.userId': userId,
    status: 'active'
  });
};

TeamSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId, status: 'active' });
};

TeamSchema.statics.findByField = function(fieldId) {
  return this.find({
    'resources.assignedFields.fieldId': fieldId,
    status: 'active'
  });
};

// Pre-save middleware
TeamSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Team', TeamSchema);
