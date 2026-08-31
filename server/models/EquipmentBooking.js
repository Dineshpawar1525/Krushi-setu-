const mongoose = require('mongoose');

const equipmentBookingSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingDetails: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in days
      required: true
    },
    rentalType: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly'],
      required: true
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  pricing: {
    baseRate: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      default: 0
    },
    additionalCharges: [{
      type: String,
      amount: Number,
      description: String
    }],
    discount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partial'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['online', 'cash', 'bank_transfer', 'upi'],
      default: 'online'
    },
    transactionId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  delivery: {
    type: {
      type: String,
      enum: ['pickup', 'delivery', 'both'],
      default: 'pickup'
    },
    pickupAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    deliveryAddress: {
      address: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    scheduledPickup: Date,
    scheduledDelivery: Date,
    actualPickup: Date,
    actualDelivery: Date,
    deliveryCharges: {
      type: Number,
      default: 0
    }
  },
  condition: {
    pickupCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    returnCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    damageReport: {
      hasDamage: {
        type: Boolean,
        default: false
      },
      description: String,
      images: [String],
      repairCost: Number,
      chargedTo: {
        type: String,
        enum: ['renter', 'owner', 'insurance']
      }
    }
  },
  communication: {
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      isRead: {
        type: Boolean,
        default: false
      }
    }],
    lastMessage: Date
  },
  documents: {
    rentalAgreement: String,
    insuranceDocument: String,
    operatorLicense: String,
    otherDocuments: [String]
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    cancellationFee: Number
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

// Index for efficient queries
equipmentBookingSchema.index({ equipment: 1, 'bookingDetails.startDate': 1, 'bookingDetails.endDate': 1 });
equipmentBookingSchema.index({ renter: 1, status: 1 });
equipmentBookingSchema.index({ owner: 1, status: 1 });
equipmentBookingSchema.index({ status: 1, createdAt: -1 });

// Virtual for booking duration in days
equipmentBookingSchema.virtual('durationInDays').get(function() {
  const start = new Date(this.bookingDetails.startDate);
  const end = new Date(this.bookingDetails.endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
});

// Method to check if booking is active
equipmentBookingSchema.methods.isActive = function() {
  const now = new Date();
  const start = new Date(this.bookingDetails.startDate);
  const end = new Date(this.bookingDetails.endDate);
  
  return this.status === 'active' && now >= start && now <= end;
};

// Method to check if booking is upcoming
equipmentBookingSchema.methods.isUpcoming = function() {
  const now = new Date();
  const start = new Date(this.bookingDetails.startDate);
  
  return this.status === 'confirmed' && start > now;
};

// Method to calculate total cost
equipmentBookingSchema.methods.calculateTotalCost = function() {
  let total = this.pricing.totalAmount;
  
  // Add additional charges
  this.pricing.additionalCharges.forEach(charge => {
    total += charge.amount;
  });
  
  // Add delivery charges
  total += this.delivery.deliveryCharges;
  
  // Subtract discount
  total -= this.pricing.discount;
  
  return Math.max(0, total);
};

module.exports = mongoose.model('EquipmentBooking', equipmentBookingSchema);
