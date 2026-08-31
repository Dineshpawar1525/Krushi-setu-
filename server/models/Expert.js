const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  avatar: { type: String, default: null },
  
  // Professional Information
  specialization: { 
    type: String, 
    required: true,
    enum: ['Crop Science', 'Soil Science', 'Plant Pathology', 'Entomology', 'Agricultural Economics', 'Livestock Management', 'Organic Farming', 'Irrigation', 'Post-Harvest Technology', 'Agricultural Extension']
  },
  experience: { type: Number, required: true, min: 0 }, // years of experience
  qualifications: [{ 
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    year: { type: Number, required: true }
  }],
  certifications: [{ 
    name: { type: String, required: true },
    issuingBody: { type: String, required: true },
    validUntil: { type: Date }
  }],
  
  // Professional Details
  bio: { type: String, required: true, maxlength: 1000 },
  languages: [{ type: String, default: ['English'] }],
  location: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  
  // Service Information
  consultationTypes: [{ 
    type: { type: String, enum: ['Video Call', 'Phone Call', 'In-Person', 'Chat'], required: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 15 }, // in minutes
    isAvailable: { type: Boolean, default: true }
  }],
  
  // Availability
  workingHours: {
    start: { type: String, required: true }, // Format: "09:00"
    end: { type: String, required: true },   // Format: "17:00"
    timezone: { type: String, default: "Asia/Kolkata" },
    workingDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }]
  },
  
  // Ratings and Reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalConsultations: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // Status
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  
  // Social Links
  socialLinks: {
    linkedin: { type: String },
    website: { type: String },
    twitter: { type: String }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

// Pre-save middleware to update timestamps
expertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for full name
expertSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for average rating
expertSchema.virtual('averageRating').get(function() {
  return this.totalReviews > 0 ? (this.rating / this.totalReviews).toFixed(1) : 0;
});

// Index for search optimization
expertSchema.index({ specialization: 1, location: 1, isActive: 1, isAvailable: 1 });
expertSchema.index({ name: 'text', bio: 'text', specialization: 'text' });

// Ensure virtual fields are serialized
expertSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Expert", expertSchema);













