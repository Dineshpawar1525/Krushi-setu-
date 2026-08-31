const Expert = require("../models/Expert");
const Consultation = require("../models/Consultation");
const User = require("../models/User");
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/experts/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDF, and document files are allowed'));
    }
  }
});

// ------------------- REGISTER EXPERT -------------------
const registerExpert = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      experience,
      bio,
      location,
      qualifications,
      certifications
    } = req.body;

    // Check if expert already exists
    const existingExpert = await Expert.findOne({ email });
    if (existingExpert) {
      return res.status(400).json({ message: "Expert with this email already exists" });
    }

    // Parse location if it's a string
    let locationData;
    if (typeof location === 'string') {
      locationData = JSON.parse(location);
    } else {
      locationData = location;
    }

    // Create expert with pending status
    const expert = new Expert({
      name,
      email,
      phone,
      specialization,
      experience: parseInt(experience),
      bio,
      location: locationData,
      qualifications: qualifications ? qualifications.split('\n').map(q => ({ degree: q.trim() })) : [],
      certifications: certifications ? certifications.split('\n').map(c => ({ name: c.trim() })) : [],
      isVerified: false,
      isActive: false, // Will be activated after admin approval
      isAvailable: false,
      proofFile: req.file ? req.file.filename : null
    });

    await expert.save();

    res.status(201).json({
      message: "Expert registration submitted successfully. We will review your application and get back to you soon.",
      expert: {
        id: expert._id,
        name: expert.name,
        email: expert.email,
        specialization: expert.specialization,
        status: "Pending Review"
      }
    });
  } catch (error) {
    console.error('Error registering expert:', error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET ALL EXPERTS -------------------
const getExperts = async (req, res) => {
  try {
    const { 
      specialization, 
      location, 
      minRating, 
      maxPrice, 
      consultationType,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = { isActive: true, isAvailable: true };
    
    if (specialization) {
      filter.specialization = specialization;
    }
    
    if (location) {
      filter['location.state'] = new RegExp(location, 'i');
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    
    if (maxPrice) {
      filter['consultationTypes.price'] = { $lte: parseFloat(maxPrice) };
    }
    
    if (consultationType) {
      filter['consultationTypes.type'] = consultationType;
    }
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { specialization: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const experts = await Expert.find(filter)
      .select('-consultationTypes.price') // Hide pricing in public listing
      .sort({ rating: -1, totalConsultations: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expert.countDocuments(filter);

    res.status(200).json({
      experts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET SINGLE EXPERT -------------------
const getExpert = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expert = await Expert.findById(id);
    
    if (!expert || !expert.isActive) {
      return res.status(404).json({ message: "Expert not found" });
    }

    res.status(200).json(expert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET EXPERT CONSULTATION TYPES -------------------
const getExpertConsultationTypes = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expert = await Expert.findById(id).select('consultationTypes name');
    
    if (!expert || !expert.isActive) {
      return res.status(404).json({ message: "Expert not found" });
    }

    res.status(200).json({
      expertName: expert.name,
      consultationTypes: expert.consultationTypes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET EXPERT AVAILABILITY -------------------
const getExpertAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    const expert = await Expert.findById(id).select('workingHours workingDays');
    
    if (!expert || !expert.isActive) {
      return res.status(404).json({ message: "Expert not found" });
    }

    // Get existing consultations for the date
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    
    const existingConsultations = await Consultation.find({
      expert: id,
      scheduledAt: { $gte: startDate, $lt: endDate },
      status: { $in: ['Confirmed', 'In Progress'] }
    }).select('scheduledAt duration');

    // Calculate available time slots
    const availableSlots = calculateAvailableSlots(
      expert.workingHours,
      expert.workingDays,
      existingConsultations,
      startDate
    );

    res.status(200).json({
      date: startDate.toISOString().split('T')[0],
      availableSlots,
      workingHours: expert.workingHours
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- BOOK CONSULTATION -------------------
const bookConsultation = async (req, res) => {
  try {
    const { expertId, type, subject, description, scheduledAt, duration } = req.body;
    const userId = req.user._id;

    // Verify expert exists and is available
    const expert = await Expert.findById(expertId);
    if (!expert || !expert.isActive || !expert.isAvailable) {
      return res.status(404).json({ message: "Expert not available" });
    }

    // Check if consultation type is available
    const consultationType = expert.consultationTypes.find(ct => 
      ct.type === type && ct.isAvailable
    );
    
    if (!consultationType) {
      return res.status(400).json({ message: "Consultation type not available" });
    }

    // Check for time conflicts
    const scheduledDate = new Date(scheduledAt);
    const endTime = new Date(scheduledDate.getTime() + duration * 60000);
    
    const conflict = await Consultation.findOne({
      expert: expertId,
      scheduledAt: { $lt: endTime },
      status: { $in: ['Confirmed', 'In Progress'] }
    });

    if (conflict) {
      return res.status(400).json({ message: "Time slot not available" });
    }

    // Create consultation
    const consultation = new Consultation({
      user: userId,
      expert: expertId,
      type,
      subject,
      description,
      scheduledAt: scheduledDate,
      duration,
      amount: consultationType.price
    });

    await consultation.save();
    await consultation.populate('expert', 'name specialization');
    await consultation.populate('user', 'name email');

    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET USER CONSULTATIONS -------------------
const getUserConsultations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: userId };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const consultations = await Consultation.find(filter)
      .populate('expert', 'name specialization avatar')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Consultation.countDocuments(filter);

    res.status(200).json({
      consultations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- UPDATE CONSULTATION STATUS -------------------
const updateConsultationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, rating, feedback } = req.body;
    const userId = req.user._id;

    const consultation = await Consultation.findById(id)
      .populate('expert', 'name');
    
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    // Check if user owns this consultation
    if (consultation.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update status
    consultation.status = status;
    
    if (notes) {
      consultation.sessionDetails.notes = notes;
    }
    
    if (rating && feedback) {
      consultation.userRating = rating;
      consultation.userFeedback = feedback;
      
      // Update expert rating
      await updateExpertRating(consultation.expert._id, rating);
    }
    
    if (status === 'Completed') {
      consultation.completedAt = new Date();
    }

    await consultation.save();

    res.status(200).json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- CANCEL CONSULTATION -------------------
const cancelConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const consultation = await Consultation.findById(id);
    
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (consultation.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (consultation.status === 'Cancelled') {
      return res.status(400).json({ message: "Consultation already cancelled" });
    }

    consultation.status = 'Cancelled';
    consultation.cancellationDetails = {
      cancelledBy: 'User',
      cancelledAt: new Date(),
      reason: reason || 'User cancelled'
    };

    await consultation.save();

    res.status(200).json({ message: "Consultation cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- HELPER FUNCTIONS -------------------

// Calculate available time slots
const calculateAvailableSlots = (workingHours, workingDays, existingConsultations, date) => {
  const slots = [];
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  if (!workingDays.includes(dayName)) {
    return slots;
  }

  const startHour = parseInt(workingHours.start.split(':')[0]);
  const endHour = parseInt(workingHours.end.split(':')[0]);
  
  for (let hour = startHour; hour < endHour; hour++) {
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(hour + 1, 0, 0, 0);
    
    // Check if slot conflicts with existing consultations
    const hasConflict = existingConsultations.some(consultation => {
      const consultationStart = new Date(consultation.scheduledAt);
      const consultationEnd = new Date(consultationStart.getTime() + consultation.duration * 60000);
      
      return (slotStart < consultationEnd && slotEnd > consultationStart);
    });
    
    if (!hasConflict) {
      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        available: true
      });
    }
  }
  
  return slots;
};

// Update expert rating
const updateExpertRating = async (expertId, newRating) => {
  try {
    const expert = await Expert.findById(expertId);
    if (expert) {
      expert.totalReviews += 1;
      expert.rating = ((expert.rating * (expert.totalReviews - 1)) + newRating) / expert.totalReviews;
      expert.totalConsultations += 1;
      await expert.save();
    }
  } catch (error) {
    console.error('Error updating expert rating:', error);
  }
};

module.exports = {
  registerExpert,
  getExperts,
  getExpert,
  getExpertConsultationTypes,
  getExpertAvailability,
  bookConsultation,
  getUserConsultations,
  updateConsultationStatus,
  cancelConsultation
};
