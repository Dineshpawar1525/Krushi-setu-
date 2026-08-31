const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema({
  // Basic Information
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expert: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
  
  // Consultation Details
  type: { 
    type: String, 
    enum: ['Video Call', 'Phone Call', 'In-Person', 'Chat'], 
    required: true 
  },
  subject: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 1000 },
  
  // Scheduling
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, required: true, min: 15 }, // in minutes
  timezone: { type: String, default: "Asia/Kolkata" },
  
  // Status
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Pending'
  },
  
  // Payment Information
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
    default: 'Pending'
  },
  paymentId: { type: String },
  
  // Consultation Session
  sessionDetails: {
    meetingId: { type: String }, // For video calls
    meetingLink: { type: String },
    notes: { type: String, maxlength: 2000 },
    recommendations: [{ type: String }],
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date }
  },
  
  // Feedback
  userRating: { type: Number, min: 1, max: 5 },
  userFeedback: { type: String, maxlength: 500 },
  expertNotes: { type: String, maxlength: 1000 },
  
  // Rescheduling
  rescheduleHistory: [{
    originalDate: { type: Date },
    newDate: { type: Date },
    reason: { type: String },
    rescheduledBy: { type: String, enum: ['User', 'Expert', 'System'] },
    rescheduledAt: { type: Date, default: Date.now }
  }],
  
  // Cancellation
  cancellationDetails: {
    cancelledBy: { type: String, enum: ['User', 'Expert', 'System'] },
    cancelledAt: { type: Date },
    reason: { type: String },
    refundAmount: { type: Number, default: 0 }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

// Pre-save middleware to update timestamps
consultationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for consultation duration in hours
consultationSchema.virtual('durationHours').get(function() {
  return (this.duration / 60).toFixed(1);
});

// Virtual for time until consultation
consultationSchema.virtual('timeUntilConsultation').get(function() {
  const now = new Date();
  const scheduled = new Date(this.scheduledAt);
  const diffMs = scheduled - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index for efficient queries
consultationSchema.index({ user: 1, status: 1 });
consultationSchema.index({ expert: 1, status: 1 });
consultationSchema.index({ scheduledAt: 1, status: 1 });
consultationSchema.index({ status: 1, createdAt: -1 });

// Ensure virtual fields are serialized
consultationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Consultation", consultationSchema);













