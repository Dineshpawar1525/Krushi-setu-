const Equipment = require('../models/Equipment');
const EquipmentBooking = require('../models/EquipmentBooking');
const User = require('../models/User');

// Get all equipment with filtering and search
const getAllEquipment = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      type,
      city,
      state,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      availability = 'all'
    } = req.query;

    // Build filter object
    const filter = { status: 'Active' };

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    // Type filter
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Location filters
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }
    if (state) {
      filter['location.state'] = { $regex: state, $options: 'i' };
    }

    // Price filters
    if (minPrice || maxPrice) {
      filter['rentalRate.daily'] = {};
      if (minPrice) filter['rentalRate.daily'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['rentalRate.daily'].$lte = parseFloat(maxPrice);
    }

    // Availability filter
    if (availability === 'available') {
      filter['availability.isAvailable'] = true;
      filter['availability.availableFrom'] = { $lte: new Date() };
      filter['availability.availableTo'] = { $gte: new Date() };
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'price') {
      sortOptions['rentalRate.daily'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sortOptions['ratings.average'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const equipment = await Equipment.find(filter)
      .populate('owner', 'name email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Equipment.countDocuments(filter);

    // Add virtual fields
    const equipmentWithVirtuals = equipment.map(item => ({
      ...item,
      isCurrentlyAvailable: item.availability.isAvailable && 
        (!item.availability.availableFrom || item.availability.availableFrom <= new Date()) &&
        (!item.availability.availableTo || item.availability.availableTo >= new Date())
    }));

    res.json({
      success: true,
      data: equipmentWithVirtuals,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Get single equipment by ID
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id)
      .populate('owner', 'name email phone location')
      .populate('bookings', 'bookingDetails status')
      .lean();

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Add virtual fields
    const equipmentWithVirtuals = {
      ...equipment,
      isCurrentlyAvailable: equipment.availability.isAvailable && 
        (!equipment.availability.availableFrom || equipment.availability.availableFrom <= new Date()) &&
        (!equipment.availability.availableTo || equipment.availability.availableTo >= new Date())
    };

    res.json({
      success: true,
      data: equipmentWithVirtuals
    });

  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Create new equipment listing
const createEquipment = async (req, res) => {
  try {
    // Handle uploaded images
    const images = req.files ? req.files.map((file, index) => ({
      url: `/uploads/equipment/${file.filename}`,
      alt: `Equipment image ${index + 1}`,
      isPrimary: index === 0
    })) : [];

    const equipmentData = {
      ...req.body,
      owner: req.user.id,
      images: images
    };

    // Parse JSON fields if they exist
    if (req.body.specifications) {
      equipmentData.specifications = JSON.parse(req.body.specifications);
    }
    if (req.body.rentalRate) {
      equipmentData.rentalRate = JSON.parse(req.body.rentalRate);
    }
    if (req.body.location) {
      equipmentData.location = JSON.parse(req.body.location);
    }
    if (req.body.availability) {
      equipmentData.availability = JSON.parse(req.body.availability);
    }
    if (req.body.requirements) {
      equipmentData.requirements = JSON.parse(req.body.requirements);
    }
    if (req.body.features) {
      equipmentData.features = JSON.parse(req.body.features);
    }

    const equipment = new Equipment(equipmentData);
    await equipment.save();

    await equipment.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Equipment listed successfully',
      data: equipment
    });

  } catch (error) {
    console.error('Error creating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create equipment listing',
      error: error.message
    });
  }
};

// Update equipment listing
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the equipment
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (equipment.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this equipment'
      });
    }

    // Handle uploaded images
    let images = equipment.images || [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/equipment/${file.filename}`,
        alt: `Equipment image ${index + 1}`,
        isPrimary: index === 0
      }));
      images = [...images, ...newImages];
    }

    const updates = {
      ...req.body,
      images: images,
      updatedAt: new Date()
    };

    // Parse JSON fields if they exist
    if (req.body.specifications) {
      updates.specifications = JSON.parse(req.body.specifications);
    }
    if (req.body.rentalRate) {
      updates.rentalRate = JSON.parse(req.body.rentalRate);
    }
    if (req.body.location) {
      updates.location = JSON.parse(req.body.location);
    }
    if (req.body.availability) {
      updates.availability = JSON.parse(req.body.availability);
    }
    if (req.body.requirements) {
      updates.requirements = JSON.parse(req.body.requirements);
    }
    if (req.body.features) {
      updates.features = JSON.parse(req.body.features);
    }

    const updatedEquipment = await Equipment.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: updatedEquipment
    });

  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: error.message
    });
  }
};

// Delete equipment listing
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the equipment
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (equipment.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this equipment'
      });
    }

    // Check if there are active bookings
    const activeBookings = await EquipmentBooking.find({
      equipment: id,
      status: { $in: ['pending', 'confirmed', 'active'] }
    });

    if (activeBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete equipment with active bookings'
      });
    }

    await Equipment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: error.message
    });
  }
};

// Get user's equipment listings
const getUserEquipment = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const filter = { owner: userId };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const equipment = await Equipment.find(filter)
      .populate('bookings', 'bookingDetails status renter')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Equipment.countDocuments(filter);

    res.json({
      success: true,
      data: equipment,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user equipment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user equipment',
      error: error.message
    });
  }
};

// Get equipment availability for specific dates
const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Check if equipment is available for the requested dates
    const isAvailable = equipment.isAvailableForDates(startDate, endDate);

    // Get conflicting bookings
    const conflictingBookings = await EquipmentBooking.find({
      equipment: id,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        {
          'bookingDetails.startDate': { $lte: new Date(endDate) },
          'bookingDetails.endDate': { $gte: new Date(startDate) }
        }
      ]
    }).populate('renter', 'name email');

    res.json({
      success: true,
      data: {
        isAvailable,
        conflictingBookings,
        equipment: {
          id: equipment._id,
          name: equipment.name,
          type: equipment.type,
          rentalRate: equipment.rentalRate
        }
      }
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
};

// Get equipment types and filters
const getEquipmentFilters = async (req, res) => {
  try {
    const types = await Equipment.distinct('type');
    const cities = await Equipment.distinct('location.city');
    const states = await Equipment.distinct('location.state');
    const brands = await Equipment.distinct('brand');

    // Get price ranges
    const priceStats = await Equipment.aggregate([
      { $match: { status: 'Active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$rentalRate.daily' },
          maxPrice: { $max: '$rentalRate.daily' },
          avgPrice: { $avg: '$rentalRate.daily' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        types,
        cities,
        states,
        brands,
        priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 }
      }
    });

  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch filters',
      error: error.message
    });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getUserEquipment,
  checkAvailability,
  getEquipmentFilters
};
