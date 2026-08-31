const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  // Basic Field Information
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
  
  // Location Information
  location: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: {
      type: [[[Number]]], // Array of coordinate arrays for polygon
      index: '2dsphere'
    },
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  
  // Field Properties
  area: {
    value: Number, // in acres or hectares
    unit: {
      type: String,
      enum: ['acres', 'hectares', 'square_meters'],
      default: 'acres'
    }
  },
  soilType: {
    type: String,
    enum: ['clay', 'sandy', 'loamy', 'silty', 'peaty', 'chalky', 'mixed']
  },
  soilPh: {
    type: Number,
    min: 0,
    max: 14
  },
  drainage: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  
  // Current Crop Information
  currentCrop: {
    cropType: String,
    variety: String,
    plantingDate: Date,
    expectedHarvestDate: Date,
    plantingDensity: Number,
    irrigationType: {
      type: String,
      enum: ['drip', 'sprinkler', 'flood', 'manual', 'none']
    }
  },
  
  // Historical Data
  cropHistory: [{
    cropType: String,
    variety: String,
    plantingDate: Date,
    harvestDate: Date,
    yield: Number,
    yieldUnit: {
      type: String,
      enum: ['tons', 'bushels', 'kg', 'lbs']
    },
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String
  }],
  
  // Field Management
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  managers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['supervisor', 'worker', 'observer']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Environmental Conditions
  climateZone: String,
  averageTemperature: Number,
  averageRainfall: Number,
  frostDates: {
    firstFrost: Date,
    lastFrost: Date
  },
  growingSeason: {
    start: Date,
    end: Date
  },
  
  // Infrastructure
  infrastructure: {
    irrigation: {
      available: Boolean,
      type: String,
      capacity: Number
    },
    drainage: {
      available: Boolean,
      type: String
    },
    fencing: {
      available: Boolean,
      type: String,
      condition: String
    },
    accessRoads: {
      available: Boolean,
      condition: String
    },
    storage: {
      available: Boolean,
      capacity: Number,
      type: String
    }
  },
  
  // Equipment and Resources
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
  
  // Field Status
  status: {
    type: String,
    enum: ['active', 'fallow', 'under_construction', 'retired'],
    default: 'active'
  },
  lastActivity: Date,
  nextScheduledActivity: Date,
  
  // Quality and Performance Metrics
  productivityRating: {
    type: Number,
    min: 1,
    max: 5
  },
  maintenanceLevel: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  
  // Tags and Categories
  tags: [String],
  category: {
    type: String,
    enum: ['field', 'greenhouse', 'orchard', 'pasture', 'garden', 'other']
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
FieldSchema.index({ owner: 1, status: 1 });
FieldSchema.index({ 'location.coordinates': '2dsphere' });
FieldSchema.index({ name: 1, owner: 1 });
FieldSchema.index({ tags: 1 });

// Virtual for field area in different units
FieldSchema.virtual('areaInAcres').get(function() {
  if (this.area.unit === 'acres') return this.area.value;
  if (this.area.unit === 'hectares') return this.area.value * 2.471;
  if (this.area.unit === 'square_meters') return this.area.value * 0.0002471;
  return this.area.value;
});

FieldSchema.virtual('areaInHectares').get(function() {
  if (this.area.unit === 'hectares') return this.area.value;
  if (this.area.unit === 'acres') return this.area.value * 0.4047;
  if (this.area.unit === 'square_meters') return this.area.value * 0.0001;
  return this.area.value;
});

// Methods
FieldSchema.methods.addCropHistory = function(cropData) {
  this.cropHistory.push(cropData);
  return this.save();
};

FieldSchema.methods.assignManager = function(userId, role = 'worker') {
  const existingManager = this.managers.find(manager => 
    manager.userId.toString() === userId.toString()
  );
  
  if (!existingManager) {
    this.managers.push({
      userId: userId,
      role: role
    });
  }
  
  return this.save();
};

FieldSchema.methods.assignEquipment = function(equipmentId, assignedBy) {
  this.assignedEquipment.push({
    equipmentId: equipmentId,
    assignedAt: new Date(),
    assignedBy: assignedBy
  });
  return this.save();
};

FieldSchema.methods.updateCurrentCrop = function(cropData) {
  this.currentCrop = { ...this.currentCrop, ...cropData };
  this.lastActivity = new Date();
  return this.save();
};

FieldSchema.methods.getActiveEvents = function() {
  return mongoose.model('CalendarEvent').find({
    fieldId: this._id,
    status: { $in: ['planned', 'in_progress'] }
  });
};

FieldSchema.methods.getCompletedEvents = function(startDate, endDate) {
  const query = {
    fieldId: this._id,
    status: 'completed'
  };
  
  if (startDate && endDate) {
    query.completedAt = {
      $gte: startDate,
      $lte: endDate
    };
  }
  
  return mongoose.model('CalendarEvent').find(query);
};

// Pre-save middleware
FieldSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Field', FieldSchema);
