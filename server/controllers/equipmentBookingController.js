const EquipmentBooking = require('../models/EquipmentBooking');
const Equipment = require('../models/Equipment');
const User = require('../models/User');

// Create new booking
const createBooking = async (req, res) => {
  try {
    console.log('Creating booking with data:', req.body);
    console.log('User ID:', req.userId);
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.get('Content-Type'));
    
    const {
      equipmentId,
      startDate,
      endDate,
      rentalType,
      quantity = 1,
      deliveryType = 'pickup',
      deliveryAddress,
      pickupAddress
    } = req.body;

    // Validate required fields
    if (!equipmentId || !startDate || !endDate || !rentalType) {
      console.log('Missing required fields:', {
        equipmentId: !!equipmentId,
        startDate: !!startDate,
        endDate: !!endDate,
        rentalType: !!rentalType
      });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        details: {
          equipmentId: !!equipmentId,
          startDate: !!startDate,
          endDate: !!endDate,
          rentalType: !!rentalType
        }
      });
    }

    // Get equipment details
    const equipment = await Equipment.findById(equipmentId).populate('owner');
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Check if user is trying to book their own equipment
    if (equipment.owner._id.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book your own equipment'
      });
    }

    // Check availability
    console.log('Checking availability for equipment:', equipment._id);
    console.log('Start date:', startDate, 'End date:', endDate);
    const isAvailable = equipment.isAvailableForDates(startDate, endDate);
    console.log('Is available:', isAvailable);
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Equipment is not available for the selected dates'
      });
    }

    // Check for conflicting bookings
    const conflictingBookings = await EquipmentBooking.find({
      equipment: equipmentId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        {
          'bookingDetails.startDate': { $lte: new Date(endDate) },
          'bookingDetails.endDate': { $gte: new Date(startDate) }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Equipment is already booked for the selected dates'
      });
    }

    // Calculate pricing
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const baseRate = equipment.rentalRate[rentalType];
    const totalAmount = baseRate * duration * quantity;
    const deposit = equipment.requirements.deposit || 0;
    const deliveryCharges = deliveryType === 'delivery' ? 500 : 0; // Fixed delivery charge
    const finalAmount = totalAmount + deposit + deliveryCharges;

    // Create booking
    const bookingData = {
      equipment: equipmentId,
      renter: req.userId,
      owner: equipment.owner._id,
      bookingDetails: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration,
        rentalType,
        quantity
      },
      pricing: {
        baseRate,
        totalAmount,
        deposit,
        finalAmount
      },
      delivery: {
        type: deliveryType,
        deliveryCharges,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : null,
        pickupAddress: deliveryType === 'pickup' ? pickupAddress : null
      },
      status: 'pending'
    };

    const booking = new EquipmentBooking(bookingData);
    await booking.save();

    // Populate the booking with equipment and user details
    await booking.populate([
      { path: 'equipment', select: 'name type brand images rentalRate' },
      { path: 'renter', select: 'name email phone' },
      { path: 'owner', select: 'name email phone' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking request created successfully',
      data: booking
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { renter: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await EquipmentBooking.find(filter)
      .populate('equipment', 'name type brand images')
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EquipmentBooking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get owner's bookings (bookings for their equipment)
const getOwnerBookings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { owner: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await EquipmentBooking.find(filter)
      .populate('equipment', 'name type brand images')
      .populate('renter', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await EquipmentBooking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owner bookings',
      error: error.message
    });
  }
};

// Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;

    const booking = await EquipmentBooking.findById(bookingId)
      .populate('equipment')
      .populate('renter')
      .populate('owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to update this booking
    if (booking.owner._id.toString() !== req.userId.toString() && booking.renter._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'rejected'],
      'confirmed': ['active', 'cancelled'],
      'active': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'rejected': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    // Update booking
    booking.status = status;
    if (reason) {
      booking.cancellation = {
        ...booking.cancellation,
        reason,
        cancelledBy: req.userId,
        cancelledAt: new Date()
      };
    }

    await booking.save();

    // Send notification (you can implement email/SMS here)
    // await sendBookingNotification(booking, status);

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      data: booking
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await EquipmentBooking.findById(bookingId)
      .populate('equipment')
      .populate('renter', 'name email phone')
      .populate('owner', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (booking.renter._id.toString() !== req.userId.toString() && booking.owner._id.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Add message to booking
const addBookingMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const booking = await EquipmentBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to add messages
    if (booking.renter.toString() !== req.userId.toString() && booking.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add messages to this booking'
      });
    }

    // Add message
    booking.communication.messages.push({
      sender: req.userId,
      message,
      timestamp: new Date(),
      isRead: false
    });
    booking.communication.lastMessage = new Date();

    await booking.save();

    res.json({
      success: true,
      message: 'Message added successfully',
      data: booking.communication.messages
    });

  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: error.message
    });
  }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await EquipmentBooking.aggregate([
      {
        $match: {
          $or: [
            { renter: userId },
            { owner: userId }
          ]
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          activeBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$pricing.finalAmount', 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0
      }
    });

  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  updateBookingStatus,
  getBookingById,
  addBookingMessage,
  getBookingStats
};
