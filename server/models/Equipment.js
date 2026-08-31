const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Tractor', 'Harvester', 'Plow', 'Seeder', 'Sprayer', 'Cultivator', 'Mower', 'Other'],
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  specifications: {
    power: String,
    capacity: String,
    fuelType: {
      type: String,
      enum: ['Diesel', 'Petrol', 'Electric', 'Hybrid']
    },
    weight: String,
    dimensions: String
  },
  rentalRate: {
    hourly: {
      type: Number,
      required: true,
      min: 0
    },
    daily: {
      type: Number,
      required: true,
      min: 0
    },
    weekly: {
      type: Number,
      required: true,
      min: 0
    },
    monthly: {
      type: Number,
      required: true,
      min: 0
    }
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    availableFrom: Date,
    availableTo: Date,
    maintenanceSchedule: [{
      startDate: Date,
      endDate: Date,
      reason: String
    }]
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  yearOfManufacture: {
    type: Number,
    required: true,
    min: 1990,
    max: new Date().getFullYear() + 1
  },
  features: [String],
  requirements: {
    operatorLicense: {
      type: Boolean,
      default: false
    },
    experience: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Expert']
    },
    deposit: {
      type: Number,
      default: 0
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  bookings: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EquipmentBooking'
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Under Maintenance', 'Out of Service'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
equipmentSchema.index({
  name: 'text',
  type: 'text',
  brand: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text'
});

// Index for filtering
equipmentSchema.index({ type: 1, 'rentalRate.daily': 1, 'location.city': 1 });

// Virtual for availability status
equipmentSchema.virtual('isCurrentlyAvailable').get(function() {
  const now = new Date();
  return this.availability.isAvailable && 
         (!this.availability.availableFrom || this.availability.availableFrom <= now) &&
         (!this.availability.availableTo || this.availability.availableTo >= now);
});

// Method to check if equipment is available for specific dates
equipmentSchema.methods.isAvailableForDates = function(startDate, endDate) {
  if (!this.availability.isAvailable) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if dates are within availability window
  if (this.availability.availableFrom && start < this.availability.availableFrom) return false;
  if (this.availability.availableTo && end > this.availability.availableTo) return false;
  
  // Check maintenance schedule
  for (const maintenance of this.availability.maintenanceSchedule) {
    const maintStart = new Date(maintenance.startDate);
    const maintEnd = new Date(maintenance.endDate);
    
    if ((start >= maintStart && start <= maintEnd) || 
        (end >= maintStart && end <= maintEnd) ||
        (start <= maintStart && end >= maintEnd)) {
      return false;
    }
  }
  
  return true;
};

module.exports = mongoose.model('Equipment', equipmentSchema);
