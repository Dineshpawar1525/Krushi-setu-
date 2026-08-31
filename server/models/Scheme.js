const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Crop Insurance',
      'Subsidy',
      'Loan',
      'Training',
      'Technology',
      'Infrastructure',
      'Marketing',
      'Research',
      'General'
    ]
  },
  state: {
    type: String,
    required: true,
    default: 'All India'
  },
  eligibility: {
    type: String,
    required: true,
    trim: true
  },
  benefits: [{
    type: String,
    trim: true
  }],
  applicationProcedure: {
    type: String,
    required: true,
    trim: true
  },
  applicationLink: {
    type: String,
    trim: true
  },
  lastApplyDate: {
    type: String,
    default: 'N/A'
  },
  amount: {
    type: String,
    trim: true
  },
  interestRate: {
    type: String,
    trim: true
  },
  tenure: {
    type: String,
    trim: true
  },
  documents: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
schemeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better search performance
schemeSchema.index({ name: 'text', description: 'text', category: 1, state: 1 });

module.exports = mongoose.model('Scheme', schemeSchema);
