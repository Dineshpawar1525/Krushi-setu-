const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/CalendarEvent');
const Field = require('../models/Field');
const Team = require('../models/Team');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');
const { protect: auth } = require('../middlewares/auth');

// Get all calendar events for a user
router.get('/events', auth, async (req, res) => {
  try {
    const { startDate, endDate, fieldId, status, category } = req.query;
    const userId = req.user.id;
    
    let query = {
      $or: [
        { createdBy: userId },
        { 'assignedTo.userId': userId }
      ]
    };
    
    // Date range filter
    if (startDate && endDate) {
      query.plannedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Field filter
    if (fieldId) {
      query.fieldId = fieldId;
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    const events = await CalendarEvent.find(query)
      .populate('fieldId', 'name location')
      .populate('assignedTo.userId', 'name email')
      .populate('createdBy', 'name email')
      .sort({ plannedDate: 1 });
    
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar events',
      error: error.message
    });
  }
});

// Get a specific calendar event
router.get('/events/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('fieldId', 'name location')
      .populate('assignedTo.userId', 'name email')
      .populate('createdBy', 'name email')
      .populate('notes.author', 'name email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user has access to this event
    const hasAccess = event.createdBy.toString() === req.user.id ||
      event.assignedTo.some(assignment => 
        assignment.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar event',
      error: error.message
    });
  }
});

// Create a new calendar event
router.post('/events', auth, async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Validate required fields
    if (!eventData.title || !eventData.plannedDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and planned date are required'
      });
    }
    
    // Create the event
    const event = new CalendarEvent(eventData);
    await event.save();
    
    // Populate the created event
    await event.populate('fieldId', 'name location');
    await event.populate('assignedTo.userId', 'name email');
    await event.populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating calendar event',
      error: error.message
    });
  }
});

// Update a calendar event
router.put('/events/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user has permission to edit
    const canEdit = event.createdBy.toString() === req.user.id ||
      event.assignedTo.some(assignment => 
        assignment.userId.toString() === req.user.id &&
        assignment.role === 'supervisor'
      );
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    // Update the event
    Object.assign(event, req.body);
    await event.save();
    
    // Populate the updated event
    await event.populate('fieldId', 'name location');
    await event.populate('assignedTo.userId', 'name email');
    await event.populate('createdBy', 'name email');
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating calendar event',
      error: error.message
    });
  }
});

// Delete a calendar event
router.delete('/events/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user has permission to delete
    const canDelete = event.createdBy.toString() === req.user.id;
    
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    await CalendarEvent.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting calendar event',
      error: error.message
    });
  }
});

// Mark event as completed
router.post('/events/:id/complete', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user has permission to complete
    const canComplete = event.createdBy.toString() === req.user.id ||
      event.assignedTo.some(assignment => 
        assignment.userId.toString() === req.user.id
      );
    
    if (!canComplete) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    // Mark as completed
    await event.markAsCompleted(req.body);
    
    res.json({
      success: true,
      message: 'Event marked as completed',
      data: event
    });
  } catch (error) {
    console.error('Error completing calendar event:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing calendar event',
      error: error.message
    });
  }
});

// Add note to event
router.post('/events/:id/notes', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user has access
    const hasAccess = event.createdBy.toString() === req.user.id ||
      event.assignedTo.some(assignment => 
        assignment.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { content, isPrivate = false } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }
    
    await event.addNote(content, req.user.id, isPrivate);
    
    res.json({
      success: true,
      message: 'Note added successfully',
      data: event
    });
  } catch (error) {
    console.error('Error adding note to event:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding note to event',
      error: error.message
    });
  }
});

// Add photo to event
router.post('/events/:id/photos', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user has access
    const hasAccess = event.createdBy.toString() === req.user.id ||
      event.assignedTo.some(assignment => 
        assignment.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { url, caption, coordinates } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Photo URL is required'
      });
    }
    
    await event.addPhoto(url, caption, coordinates);
    
    res.json({
      success: true,
      message: 'Photo added successfully',
      data: event
    });
  } catch (error) {
    console.error('Error adding photo to event:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding photo to event',
      error: error.message
    });
  }
});

// Assign event to user
router.post('/events/:id/assign', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user has permission to assign
    const canAssign = event.createdBy.toString() === req.user.id;
    
    if (!canAssign) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { userId, role = 'worker' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    await event.assignToUser(userId, role);
    
    res.json({
      success: true,
      message: 'Event assigned successfully',
      data: event
    });
  } catch (error) {
    console.error('Error assigning event:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning event',
      error: error.message
    });
  }
});

// Get overdue events
router.get('/events/overdue', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    
    const overdueEvents = await CalendarEvent.find({
      $or: [
        { createdBy: userId },
        { 'assignedTo.userId': userId }
      ],
      status: { $in: ['planned', 'in_progress'] },
      plannedDate: { $lt: today }
    })
    .populate('fieldId', 'name location')
    .populate('assignedTo.userId', 'name email')
    .sort({ plannedDate: 1 });
    
    res.json({
      success: true,
      data: overdueEvents,
      count: overdueEvents.length
    });
  } catch (error) {
    console.error('Error fetching overdue events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue events',
      error: error.message
    });
  }
});

// Get today's events
router.get('/events/today', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const todayEvents = await CalendarEvent.find({
      $or: [
        { createdBy: userId },
        { 'assignedTo.userId': userId }
      ],
      plannedDate: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    })
    .populate('fieldId', 'name location')
    .populate('assignedTo.userId', 'name email')
    .sort({ plannedDate: 1 });
    
    res.json({
      success: true,
      data: todayEvents,
      count: todayEvents.length
    });
  } catch (error) {
    console.error('Error fetching today\'s events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s events',
      error: error.message
    });
  }
});

// Get calendar statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.plannedDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const query = {
      $or: [
        { createdBy: userId },
        { 'assignedTo.userId': userId }
      ],
      ...dateFilter
    };
    
    const [
      totalEvents,
      completedEvents,
      overdueEvents,
      inProgressEvents,
      plannedEvents,
      categoryStats
    ] = await Promise.all([
      CalendarEvent.countDocuments(query),
      CalendarEvent.countDocuments({ ...query, status: 'completed' }),
      CalendarEvent.countDocuments({ ...query, status: 'overdue' }),
      CalendarEvent.countDocuments({ ...query, status: 'in_progress' }),
      CalendarEvent.countDocuments({ ...query, status: 'planned' }),
      CalendarEvent.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);
    
    const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        totalEvents,
        completedEvents,
        overdueEvents,
        inProgressEvents,
        plannedEvents,
        completionRate: Math.round(completionRate * 100) / 100,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching calendar statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar statistics',
      error: error.message
    });
  }
});

// Get calendar analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, fieldId } = req.query;
    
    let query = {
      createdBy: userId
    };
    
    if (startDate && endDate) {
      query['timeRange.startDate'] = { $gte: new Date(startDate) };
      query['timeRange.endDate'] = { $lte: new Date(endDate) };
    }
    
    if (fieldId) {
      query.relatedFields = fieldId;
    }
    
    const analytics = await Analytics.find(query)
      .populate('relatedFields', 'name')
      .populate('relatedTeams', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching calendar analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching calendar analytics',
      error: error.message
    });
  }
});

module.exports = router;
