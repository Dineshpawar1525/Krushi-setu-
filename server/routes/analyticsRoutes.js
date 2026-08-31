const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const CalendarEvent = require('../models/CalendarEvent');
const Team = require('../models/Team');
const Field = require('../models/Field');
const { protect: auth } = require('../middlewares/auth');

// Get all analytics for a user
router.get('/', auth, async (req, res) => {
  try {
    const { type, category, startDate, endDate, fieldId, teamId } = req.query;
    
    let query = {
      createdBy: req.user.id
    };
    
    if (type) {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (startDate && endDate) {
      query['timeRange.startDate'] = { $gte: new Date(startDate) };
      query['timeRange.endDate'] = { $lte: new Date(endDate) };
    }
    
    if (fieldId) {
      query.relatedFields = fieldId;
    }
    
    if (teamId) {
      query.relatedTeams = teamId;
    }
    
    const analytics = await Analytics.find(query)
      .populate('relatedFields', 'name location')
      .populate('relatedTeams', 'name')
      .populate('relatedEquipment', 'name type')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// Get a specific analytics report
router.get('/:id', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id)
      .populate('relatedFields', 'name location')
      .populate('relatedTeams', 'name')
      .populate('relatedEquipment', 'name type')
      .populate('createdBy', 'name email');
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics report not found'
      });
    }
    
    // Check if user has access to this analytics
    const hasAccess = analytics.createdBy.toString() === req.user.id ||
      analytics.sharing.sharedWith.some(share => 
        share.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics report',
      error: error.message
    });
  }
});

// Create a new analytics report
router.post('/', auth, async (req, res) => {
  try {
    const analyticsData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    // Validate required fields
    if (!analyticsData.name || !analyticsData.type || !analyticsData.category) {
      return res.status(400).json({
        success: false,
        message: 'Name, type, and category are required'
      });
    }
    
    // Create the analytics report
    const analytics = new Analytics(analyticsData);
    await analytics.save();
    
    // Calculate metrics
    await analytics.calculateMetrics();
    
    // Generate insights
    await analytics.generateInsights();
    
    res.status(201).json({
      success: true,
      message: 'Analytics report created successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Error creating analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating analytics report',
      error: error.message
    });
  }
});

// Update an analytics report
router.put('/:id', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics report not found'
      });
    }
    
    // Check if user has permission to edit
    const canEdit = analytics.createdBy.toString() === req.user.id;
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    // Update the analytics
    Object.assign(analytics, req.body);
    analytics.lastUpdatedBy = req.user.id;
    await analytics.save();
    
    // Recalculate metrics if needed
    if (req.body.recalculate) {
      await analytics.calculateMetrics();
      await analytics.generateInsights();
    }
    
    res.json({
      success: true,
      message: 'Analytics report updated successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Error updating analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating analytics report',
      error: error.message
    });
  }
});

// Delete an analytics report
router.delete('/:id', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics report not found'
      });
    }
    
    // Check if user has permission to delete
    const canDelete = analytics.createdBy.toString() === req.user.id;
    
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    await Analytics.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Analytics report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting analytics report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting analytics report',
      error: error.message
    });
  }
});

// Calculate analytics metrics
router.post('/:id/calculate', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics report not found'
      });
    }
    
    // Check if user has permission to calculate
    const canCalculate = analytics.createdBy.toString() === req.user.id;
    
    if (!canCalculate) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    // Calculate metrics based on type
    switch (analytics.type) {
      case 'task_completion':
        await calculateTaskCompletionMetrics(analytics);
        break;
      case 'team_performance':
        await calculateTeamPerformanceMetrics(analytics);
        break;
      case 'field_productivity':
        await calculateFieldProductivityMetrics(analytics);
        break;
      case 'equipment_usage':
        await calculateEquipmentUsageMetrics(analytics);
        break;
      case 'cost_analysis':
        await calculateCostAnalysisMetrics(analytics);
        break;
      default:
        await analytics.calculateMetrics();
    }
    
    // Generate insights
    await analytics.generateInsights();
    
    res.json({
      success: true,
      message: 'Analytics calculated successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Error calculating analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating analytics',
      error: error.message
    });
  }
});

// Share analytics with user
router.post('/:id/share', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics report not found'
      });
    }
    
    // Check if user has permission to share
    const canShare = analytics.createdBy.toString() === req.user.id;
    
    if (!canShare) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { userId, permission = 'view' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    await analytics.shareWithUser(userId, permission);
    
    res.json({
      success: true,
      message: 'Analytics shared successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Error sharing analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing analytics',
      error: error.message
    });
  }
});

// Export analytics data
router.get('/:id/export', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics report not found'
      });
    }
    
    // Check if user has access to export
    const hasAccess = analytics.createdBy.toString() === req.user.id ||
      analytics.sharing.sharedWith.some(share => 
        share.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { format = 'json' } = req.query;
    
    const exportData = await analytics.exportData(format);
    
    res.json({
      success: true,
      data: exportData,
      format: format
    });
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting analytics',
      error: error.message
    });
  }
});

// Get analytics insights
router.get('/:id/insights', auth, async (req, res) => {
  try {
    const analytics = await Analytics.findById(req.params.id);
    
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics report not found'
      });
    }
    
    // Check if user has access to insights
    const hasAccess = analytics.createdBy.toString() === req.user.id ||
      analytics.sharing.sharedWith.some(share => 
        share.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        insights: analytics.insights,
        trends: analytics.trends,
        benchmarks: analytics.benchmarks
      }
    });
  } catch (error) {
    console.error('Error fetching analytics insights:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics insights',
      error: error.message
    });
  }
});

// Get analytics statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const query = {
      createdBy: req.user.id,
      ...dateFilter
    };
    
    const [
      totalAnalytics,
      activeAnalytics,
      typeStats,
      categoryStats
    ] = await Promise.all([
      Analytics.countDocuments(query),
      Analytics.countDocuments({ ...query, status: 'active' }),
      Analytics.aggregate([
        { $match: query },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Analytics.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        totalAnalytics,
        activeAnalytics,
        typeStats,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Error fetching analytics statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics statistics',
      error: error.message
    });
  }
});

// Helper functions for calculating specific metrics
async function calculateTaskCompletionMetrics(analytics) {
  const { startDate, endDate } = analytics.timeRange;
  const query = {
    plannedDate: {
      $gte: startDate,
      $lte: endDate
    }
  };
  
  if (analytics.relatedFields.length > 0) {
    query.fieldId = { $in: analytics.relatedFields };
  }
  
  const events = await CalendarEvent.find(query);
  
  const metrics = {
    totalTasks: events.length,
    completedTasks: events.filter(event => event.status === 'completed').length,
    overdueTasks: events.filter(event => event.status === 'overdue').length,
    completionRate: events.length > 0 ? 
      (events.filter(event => event.status === 'completed').length / events.length) * 100 : 0,
    averageCompletionTime: 0
  };
  
  analytics.metrics = { ...analytics.metrics, ...metrics };
  await analytics.save();
}

async function calculateTeamPerformanceMetrics(analytics) {
  const { startDate, endDate } = analytics.timeRange;
  const teamIds = analytics.relatedTeams;
  
  const teams = await Team.find({ _id: { $in: teamIds } });
  
  const performance = {
    teamEfficiency: 0,
    individualPerformance: []
  };
  
  for (const team of teams) {
    const teamEvents = await CalendarEvent.find({
      'assignedTo.userId': { $in: team.members.map(member => member.userId) },
      plannedDate: { $gte: startDate, $lte: endDate }
    });
    
    const completedEvents = teamEvents.filter(event => event.status === 'completed');
    const efficiency = teamEvents.length > 0 ? (completedEvents.length / teamEvents.length) * 100 : 0;
    
    performance.teamEfficiency += efficiency;
    
    for (const member of team.members) {
      const memberEvents = teamEvents.filter(event => 
        event.assignedTo.some(assignment => 
          assignment.userId.toString() === member.userId.toString()
        )
      );
      
      const memberCompleted = memberEvents.filter(event => event.status === 'completed');
      
      performance.individualPerformance.push({
        userId: member.userId,
        tasksAssigned: memberEvents.length,
        tasksCompleted: memberCompleted.length,
        averageCompletionTime: 0,
        qualityRating: 0
      });
    }
  }
  
  performance.teamEfficiency = performance.teamEfficiency / teams.length;
  
  analytics.metrics = { ...analytics.metrics, ...performance };
  await analytics.save();
}

async function calculateFieldProductivityMetrics(analytics) {
  const { startDate, endDate } = analytics.timeRange;
  const fieldIds = analytics.relatedFields;
  
  const fields = await Field.find({ _id: { $in: fieldIds } });
  
  const productivity = [];
  
  for (const field of fields) {
    const fieldEvents = await CalendarEvent.find({
      fieldId: field._id,
      plannedDate: { $gte: startDate, $lte: endDate }
    });
    
    const completedEvents = fieldEvents.filter(event => event.status === 'completed');
    const averageDuration = completedEvents.length > 0 ? 
      completedEvents.reduce((sum, event) => sum + (event.actualDuration || 0), 0) / completedEvents.length : 0;
    
    productivity.push({
      fieldId: field._id,
      tasksCompleted: completedEvents.length,
      averageTaskDuration: averageDuration,
      productivityRating: completedEvents.length > 0 ? 4 : 2,
      yield: 0,
      yieldUnit: 'tons'
    });
  }
  
  analytics.metrics.fieldProductivity = productivity;
  await analytics.save();
}

async function calculateEquipmentUsageMetrics(analytics) {
  const { startDate, endDate } = analytics.timeRange;
  const equipmentIds = analytics.relatedEquipment;
  
  const utilization = [];
  
  for (const equipmentId of equipmentIds) {
    const equipmentEvents = await CalendarEvent.find({
      'requiredEquipment.equipmentId': equipmentId,
      plannedDate: { $gte: startDate, $lte: endDate }
    });
    
    const totalHours = equipmentEvents.reduce((sum, event) => {
      const equipment = event.requiredEquipment.find(eq => 
        eq.equipmentId.toString() === equipmentId.toString()
      );
      return sum + (equipment ? equipment.duration : 0);
    }, 0);
    
    const maintenanceHours = equipmentEvents.filter(event => 
      event.category === 'maintenance'
    ).length * 2; // Assume 2 hours per maintenance event
    
    const utilizationRate = totalHours > 0 ? ((totalHours - maintenanceHours) / totalHours) * 100 : 0;
    
    utilization.push({
      equipmentId: equipmentId,
      totalHours: totalHours,
      maintenanceHours: maintenanceHours,
      utilizationRate: utilizationRate,
      efficiencyRating: utilizationRate > 80 ? 5 : utilizationRate > 60 ? 4 : 3
    });
  }
  
  analytics.metrics.equipmentUtilization = utilization;
  await analytics.save();
}

async function calculateCostAnalysisMetrics(analytics) {
  const { startDate, endDate } = analytics.timeRange;
  
  const events = await CalendarEvent.find({
    plannedDate: { $gte: startDate, $lte: endDate }
  });
  
  const totalCost = events.reduce((sum, event) => sum + (event.actualCost || 0), 0);
  const estimatedCost = events.reduce((sum, event) => sum + (event.estimatedCost || 0), 0);
  
  const costBreakdown = {};
  events.forEach(event => {
    if (event.costBreakdown) {
      event.costBreakdown.forEach(cost => {
        if (!costBreakdown[cost.category]) {
          costBreakdown[cost.category] = 0;
        }
        costBreakdown[cost.category] += cost.amount;
      });
    }
  });
  
  const costAnalysis = {
    totalCost: totalCost,
    costPerTask: events.length > 0 ? totalCost / events.length : 0,
    costPerField: 0,
    costPerTeam: 0,
    budgetVariance: estimatedCost > 0 ? ((totalCost - estimatedCost) / estimatedCost) * 100 : 0,
    costBreakdown: Object.entries(costBreakdown).map(([category, amount]) => ({
      category: category,
      amount: amount,
      percentage: totalCost > 0 ? (amount / totalCost) * 100 : 0
    }))
  };
  
  analytics.metrics = { ...analytics.metrics, ...costAnalysis };
  await analytics.save();
}

module.exports = router;
