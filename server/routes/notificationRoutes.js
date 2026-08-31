const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const NotificationTemplate = require('../models/NotificationTemplate');
const CalendarEvent = require('../models/CalendarEvent');
const { protect: auth } = require('../middlewares/auth');

// Get all notifications for a user
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, priority, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;
    
    let query = {
      'recipients.userId': userId
    };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    const notifications = await Notification.find(query)
      .populate('relatedEvent', 'title plannedDate')
      .populate('relatedField', 'name')
      .populate('relatedEquipment', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      success: true,
      data: notifications,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// Get a specific notification
router.get('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('relatedEvent', 'title plannedDate')
      .populate('relatedField', 'name')
      .populate('relatedEquipment', 'name')
      .populate('createdBy', 'name email')
      .populate('recipients.userId', 'name email');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is a recipient
    const isRecipient = notification.recipients.some(recipient => 
      recipient.userId.toString() === req.user.id
    );
    
    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification',
      error: error.message
    });
  }
});

// Create a new notification
router.post('/', auth, async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Validate required fields
    if (!notificationData.title || !notificationData.message || !notificationData.recipients) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, and recipients are required'
      });
    }
    
    // Create the notification
    const notification = new Notification(notificationData);
    await notification.save();
    
    // Populate the created notification
    await notification.populate('relatedEvent', 'title plannedDate');
    await notification.populate('relatedField', 'name');
    await notification.populate('relatedEquipment', 'name');
    await notification.populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
});

// Mark notification as read
router.post('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is a recipient
    const isRecipient = notification.recipients.some(recipient => 
      recipient.userId.toString() === req.user.id
    );
    
    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await notification.markAsRead(req.user.id);
    
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// Mark notification as delivered
router.post('/:id/delivered', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is a recipient
    const isRecipient = notification.recipients.some(recipient => 
      recipient.userId.toString() === req.user.id
    );
    
    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await notification.markAsDelivered(req.user.id);
    
    res.json({
      success: true,
      message: 'Notification marked as delivered'
    });
  } catch (error) {
    console.error('Error marking notification as delivered:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as delivered',
      error: error.message
    });
  }
});

// Add response to notification
router.post('/:id/response', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user is a recipient
    const isRecipient = notification.recipients.some(recipient => 
      recipient.userId.toString() === req.user.id
    );
    
    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { response } = req.body;
    
    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response is required'
      });
    }
    
    await notification.addResponse(req.user.id, response);
    
    res.json({
      success: true,
      message: 'Response added successfully'
    });
  } catch (error) {
    console.error('Error adding response to notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response to notification',
      error: error.message
    });
  }
});

// Get notification templates
router.get('/templates', auth, async (req, res) => {
  try {
    const { category, isPublic } = req.query;
    
    let query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (isPublic === 'true') {
      query.isPublic = true;
    } else {
      query.$or = [
        { isPublic: true },
        { createdBy: req.user.id }
      ];
    }
    
    const templates = await NotificationTemplate.find(query)
      .populate('createdBy', 'name email')
      .sort({ 'usageStats.timesUsed': -1 });
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification templates',
      error: error.message
    });
  }
});

// Create notification from template
router.post('/templates/:templateId/create', auth, async (req, res) => {
  try {
    const template = await NotificationTemplate.findById(req.params.templateId);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }
    
    // Check if user has access to template
    const hasAccess = template.isPublic || template.createdBy.toString() === req.user.id;
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { recipients, variables, scheduledFor } = req.body;
    
    if (!recipients || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients are required'
      });
    }
    
    // Validate variables if template has them
    if (template.variables && template.variables.length > 0) {
      const validationErrors = template.validateVariables(variables);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Variable validation failed',
          errors: validationErrors
        });
      }
    }
    
    // Create notification from template
    const notification = await template.createNotification({
      recipients,
      variables,
      scheduledFor: scheduledFor || new Date(),
      createdBy: req.user.id
    });
    
    // Increment template usage
    await template.incrementUsage();
    
    res.status(201).json({
      success: true,
      message: 'Notification created from template',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification from template:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification from template',
      error: error.message
    });
  }
});

// Create notification template
router.post('/templates', auth, async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Validate required fields
    if (!templateData.name || !templateData.title || !templateData.message) {
      return res.status(400).json({
        success: false,
        message: 'Name, title, and message are required'
      });
    }
    
    const template = new NotificationTemplate(templateData);
    await template.save();
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating notification template:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification template',
      error: error.message
    });
  }
});

// Get notification statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const query = {
      'recipients.userId': userId,
      ...dateFilter
    };
    
    const [
      totalNotifications,
      readNotifications,
      unreadNotifications,
      typeStats,
      priorityStats
    ] = await Promise.all([
      Notification.countDocuments(query),
      Notification.countDocuments({
        ...query,
        'recipients.userId': userId,
        'recipients.read': true
      }),
      Notification.countDocuments({
        ...query,
        'recipients.userId': userId,
        'recipients.read': false
      }),
      Notification.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Notification.aggregate([
        { $match: query },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);
    
    const readRate = totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        totalNotifications,
        readNotifications,
        unreadNotifications,
        readRate: Math.round(readRate * 100) / 100,
        typeStats,
        priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics',
      error: error.message
    });
  }
});

// Get overdue notifications
router.get('/overdue', auth, async (req, res) => {
  try {
    const overdueNotifications = await Notification.findOverdue();
    
    res.json({
      success: true,
      data: overdueNotifications,
      count: overdueNotifications.length
    });
  } catch (error) {
    console.error('Error fetching overdue notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue notifications',
      error: error.message
    });
  }
});

// Create weather-dependent notification
router.post('/weather', auth, async (req, res) => {
  try {
    const { title, message, recipients, weatherConditions, scheduledFor } = req.body;
    
    if (!title || !message || !recipients || !weatherConditions) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, recipients, and weather conditions are required'
      });
    }
    
    const notification = new Notification({
      title,
      message,
      recipients,
      type: 'weather_alert',
      priority: 'high',
      scheduledFor: scheduledFor || new Date(),
      weatherTrigger: {
        enabled: true,
        conditions: weatherConditions
      },
      createdBy: req.user.id
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Weather-dependent notification created',
      data: notification
    });
  } catch (error) {
    console.error('Error creating weather-dependent notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating weather-dependent notification',
      error: error.message
    });
  }
});

// Create location-based notification
router.post('/location', auth, async (req, res) => {
  try {
    const { title, message, recipients, geofence, scheduledFor } = req.body;
    
    if (!title || !message || !recipients || !geofence) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, recipients, and geofence are required'
      });
    }
    
    const notification = new Notification({
      title,
      message,
      recipients,
      type: 'location_alert',
      priority: 'medium',
      scheduledFor: scheduledFor || new Date(),
      locationTrigger: {
        enabled: true,
        geofence: geofence
      },
      createdBy: req.user.id
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Location-based notification created',
      data: notification
    });
  } catch (error) {
    console.error('Error creating location-based notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating location-based notification',
      error: error.message
    });
  }
});

module.exports = router;
