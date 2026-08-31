const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Analytics Type and Category
  type: {
    type: String,
    enum: [
      'task_completion',
      'team_performance',
      'field_productivity',
      'equipment_usage',
      'cost_analysis',
      'weather_impact',
      'crop_yield',
      'resource_utilization',
      'efficiency_metrics',
      'custom'
    ],
    required: true
  },
  category: {
    type: String,
    enum: ['performance', 'financial', 'operational', 'environmental', 'custom'],
    required: true
  },
  
  // Data Source and Scope
  dataSource: {
    type: String,
    enum: ['calendar_events', 'field_data', 'equipment_data', 'weather_data', 'manual', 'api'],
    required: true
  },
  scope: {
    type: String,
    enum: ['farm', 'field', 'team', 'equipment', 'crop', 'global'],
    required: true
  },
  
  // Time Range
  timeRange: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    granularity: {
      type: String,
      enum: ['hourly', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'daily'
    }
  },
  
  // Related Entities
  relatedFields: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field'
  }],
  relatedTeams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  relatedEquipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CalendarEvent'
  }],
  
  // Metrics and KPIs
  metrics: {
    // Task-related metrics
    totalTasks: Number,
    completedTasks: Number,
    overdueTasks: Number,
    cancelledTasks: Number,
    completionRate: Number,
    averageCompletionTime: Number,
    onTimeCompletionRate: Number,
    
    // Team performance metrics
    teamEfficiency: Number,
    individualPerformance: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      tasksAssigned: Number,
      tasksCompleted: Number,
      averageCompletionTime: Number,
      qualityRating: Number
    }],
    
    // Field productivity metrics
    fieldProductivity: [{
      fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Field'
      },
      tasksCompleted: Number,
      averageTaskDuration: Number,
      productivityRating: Number,
      yield: Number,
      yieldUnit: String
    }],
    
    // Equipment usage metrics
    equipmentUtilization: [{
      equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Equipment'
      },
      totalHours: Number,
      maintenanceHours: Number,
      utilizationRate: Number,
      efficiencyRating: Number
    }],
    
    // Cost analysis metrics
    totalCost: Number,
    costPerTask: Number,
    costPerField: Number,
    costPerTeam: Number,
    budgetVariance: Number,
    costBreakdown: [{
      category: String,
      amount: Number,
      percentage: Number
    }],
    
    // Weather impact metrics
    weatherImpact: {
      temperatureImpact: Number,
      precipitationImpact: Number,
      windImpact: Number,
      weatherDelayHours: Number,
      weatherCancelledTasks: Number
    },
    
    // Resource utilization metrics
    resourceUtilization: {
      laborHours: Number,
      equipmentHours: Number,
      fuelConsumption: Number,
      waterUsage: Number,
      fertilizerUsage: Number,
      pesticideUsage: Number
    }
  },
  
  // Calculated Insights
  insights: [{
    type: {
      type: String,
      enum: ['trend', 'anomaly', 'recommendation', 'warning', 'achievement']
    },
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    confidence: Number, // 0-1
    actionable: Boolean,
    recommendations: [String]
  }],
  
  // Trend Analysis
  trends: {
    performance: {
      direction: {
        type: String,
        enum: ['improving', 'declining', 'stable', 'volatile']
      },
      rate: Number,
      significance: Number
    },
    efficiency: {
      direction: {
        type: String,
        enum: ['improving', 'declining', 'stable', 'volatile']
      },
      rate: Number,
      significance: Number
    },
    costs: {
      direction: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable', 'volatile']
      },
      rate: Number,
      significance: Number
    }
  },
  
  // Benchmarking
  benchmarks: {
    industryAverage: Number,
    previousPeriod: Number,
    target: Number,
    variance: Number,
    percentile: Number
  },
  
  // Data Quality
  dataQuality: {
    completeness: Number, // 0-1
    accuracy: Number,    // 0-1
    timeliness: Number,  // 0-1
    consistency: Number, // 0-1
    overall: Number      // 0-1
  },
  
  // Visualization Settings
  visualization: {
    chartType: {
      type: String,
      enum: ['line', 'bar', 'pie', 'scatter', 'area', 'heatmap', 'gauge']
    },
    colorScheme: String,
    showTrends: Boolean,
    showBenchmarks: Boolean,
    interactive: Boolean
  },
  
  // Export and Sharing
  sharing: {
    isPublic: {
      type: Boolean,
      default: false
    },
    sharedWith: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permission: {
        type: String,
        enum: ['view', 'edit', 'share']
      }
    }],
    exportFormats: [{
      type: String,
      enum: ['pdf', 'excel', 'csv', 'json']
    }]
  },
  
  // Automation Settings
  automation: {
    isAutomated: {
      type: Boolean,
      default: false
    },
    schedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly']
      },
      time: String, // HH:MM format
      timezone: String
    },
    triggers: [{
      type: {
        type: String,
        enum: ['threshold', 'anomaly', 'schedule', 'event']
      },
      condition: String,
      action: String
    }]
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'error'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastCalculated: Date,
  nextCalculation: Date
});

// Indexes
AnalyticsSchema.index({ type: 1, category: 1 });
AnalyticsSchema.index({ 'timeRange.startDate': 1, 'timeRange.endDate': 1 });
AnalyticsSchema.index({ createdBy: 1, status: 1 });
AnalyticsSchema.index({ 'relatedFields': 1 });
AnalyticsSchema.index({ 'relatedTeams': 1 });
AnalyticsSchema.index({ createdAt: -1 });

// Virtual for data freshness
AnalyticsSchema.virtual('dataFreshness').get(function() {
  if (!this.lastCalculated) return 0;
  const now = new Date();
  const diffHours = (now - this.lastCalculated) / (1000 * 60 * 60);
  return Math.max(0, 1 - (diffHours / 24)); // Freshness decreases over 24 hours
});

// Methods
AnalyticsSchema.methods.calculateMetrics = function() {
  // This would contain the actual calculation logic
  // For now, we'll just update the lastCalculated timestamp
  this.lastCalculated = new Date();
  return this.save();
};

AnalyticsSchema.methods.generateInsights = function() {
  // This would contain the insight generation logic
  // For now, we'll just add a placeholder insight
  this.insights.push({
    type: 'recommendation',
    title: 'Performance Optimization',
    description: 'Consider optimizing task scheduling based on weather patterns',
    severity: 'medium',
    confidence: 0.8,
    actionable: true,
    recommendations: ['Schedule outdoor tasks during optimal weather windows']
  });
  return this.save();
};

AnalyticsSchema.methods.exportData = function(format) {
  // This would contain the export logic
  // For now, we'll just return the metrics
  return {
    metrics: this.metrics,
    insights: this.insights,
    trends: this.trends,
    benchmarks: this.benchmarks
  };
};

AnalyticsSchema.methods.shareWithUser = function(userId, permission = 'view') {
  const existingShare = this.sharing.sharedWith.find(share => 
    share.userId.toString() === userId.toString()
  );
  
  if (!existingShare) {
    this.sharing.sharedWith.push({
      userId: userId,
      permission: permission
    });
  }
  
  return this.save();
};

AnalyticsSchema.methods.updateDataQuality = function(completeness, accuracy, timeliness, consistency) {
  this.dataQuality = {
    completeness: completeness,
    accuracy: accuracy,
    timeliness: timeliness,
    consistency: consistency,
    overall: (completeness + accuracy + timeliness + consistency) / 4
  };
  return this.save();
};

// Static methods
AnalyticsSchema.statics.findByUser = function(userId) {
  return this.find({ createdBy: userId });
};

AnalyticsSchema.statics.findByType = function(type) {
  return this.find({ type: type, status: 'active' });
};

AnalyticsSchema.statics.findByTimeRange = function(startDate, endDate) {
  return this.find({
    'timeRange.startDate': { $lte: endDate },
    'timeRange.endDate': { $gte: startDate }
  });
};

AnalyticsSchema.statics.findStale = function() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.find({
    lastCalculated: { $lt: oneDayAgo },
    status: 'active'
  });
};

// Pre-save middleware
AnalyticsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);
