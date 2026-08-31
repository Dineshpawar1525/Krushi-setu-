const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const CalendarEvent = require('../models/CalendarEvent');
const { protect: auth } = require('../middlewares/auth');

// Get all teams for a user
router.get('/', auth, async (req, res) => {
  try {
    const { status, category } = req.query;
    
    let query = {
      $or: [
        { owner: req.user.id },
        { 'members.userId': req.user.id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    const teams = await Team.find(query)
      .populate('owner', 'name email')
      .populate('members.userId', 'name email')
      .populate('resources.assignedFields', 'name location')
      .populate('resources.assignedEquipment', 'name type')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams',
      error: error.message
    });
  }
});

// Get a specific team
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.userId', 'name email')
      .populate('resources.assignedFields', 'name location')
      .populate('resources.assignedEquipment', 'name type')
      .populate('communication.announcements.author', 'name email');
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has access to this team
    const hasAccess = team.owner.toString() === req.user.id ||
      team.members.some(member => 
        member.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team',
      error: error.message
    });
  }
});

// Create a new team
router.post('/', auth, async (req, res) => {
  try {
    const teamData = {
      ...req.body,
      owner: req.user.id
    };
    
    // Validate required fields
    if (!teamData.name) {
      return res.status(400).json({
        success: false,
        message: 'Team name is required'
      });
    }
    
    // Create the team
    const team = new Team(teamData);
    await team.save();
    
    // Add owner as a member
    await team.addMember(req.user.id, 'owner');
    
    // Populate the created team
    await team.populate('owner', 'name email');
    await team.populate('members.userId', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating team',
      error: error.message
    });
  }
});

// Update a team
router.put('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to edit
    const canEdit = team.owner.toString() === req.user.id;
    
    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    // Update the team
    Object.assign(team, req.body);
    await team.save();
    
    // Populate the updated team
    await team.populate('owner', 'name email');
    await team.populate('members.userId', 'name email');
    
    res.json({
      success: true,
      message: 'Team updated successfully',
      data: team
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team',
      error: error.message
    });
  }
});

// Delete a team
router.delete('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to delete
    const canDelete = team.owner.toString() === req.user.id;
    
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    await Team.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting team',
      error: error.message
    });
  }
});

// Add member to team
router.post('/:id/members', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to add members
    const canAddMembers = team.owner.toString() === req.user.id ||
      team.members.some(member => 
        member.userId.toString() === req.user.id &&
        member.role === 'supervisor'
      );
    
    if (!canAddMembers) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { userId, role = 'worker', permissions = [] } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await team.addMember(userId, role, permissions, req.user.id);
    
    res.json({
      success: true,
      message: 'Member added successfully',
      data: team
    });
  } catch (error) {
    console.error('Error adding member to team:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member to team',
      error: error.message
    });
  }
});

// Remove member from team
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to remove members
    const canRemoveMembers = team.owner.toString() === req.user.id ||
      team.members.some(member => 
        member.userId.toString() === req.user.id &&
        member.role === 'supervisor'
      );
    
    if (!canRemoveMembers) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    // Cannot remove owner
    if (team.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove team owner'
      });
    }
    
    await team.removeMember(req.params.userId);
    
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Error removing member from team:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member from team',
      error: error.message
    });
  }
});

// Update member role and permissions
router.put('/:id/members/:userId', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to update members
    const canUpdateMembers = team.owner.toString() === req.user.id;
    
    if (!canUpdateMembers) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { role, permissions = [] } = req.body;
    
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }
    
    await team.updateMemberRole(req.params.userId, role, permissions);
    
    res.json({
      success: true,
      message: 'Member updated successfully',
      data: team
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member',
      error: error.message
    });
  }
});

// Update member status
router.put('/:id/members/:userId/status', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to update member status
    const canUpdateStatus = team.owner.toString() === req.user.id ||
      team.members.some(member => 
        member.userId.toString() === req.user.id &&
        member.role === 'supervisor'
      );
    
    if (!canUpdateStatus) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    await team.updateMemberStatus(req.params.userId, status);
    
    res.json({
      success: true,
      message: 'Member status updated successfully',
      data: team
    });
  } catch (error) {
    console.error('Error updating member status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member status',
      error: error.message
    });
  }
});

// Assign field to team
router.post('/:id/fields', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to assign fields
    const canAssignFields = team.owner.toString() === req.user.id;
    
    if (!canAssignFields) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { fieldId } = req.body;
    
    if (!fieldId) {
      return res.status(400).json({
        success: false,
        message: 'Field ID is required'
      });
    }
    
    await team.assignField(fieldId, req.user.id);
    
    res.json({
      success: true,
      message: 'Field assigned successfully',
      data: team
    });
  } catch (error) {
    console.error('Error assigning field to team:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning field to team',
      error: error.message
    });
  }
});

// Assign equipment to team
router.post('/:id/equipment', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to assign equipment
    const canAssignEquipment = team.owner.toString() === req.user.id;
    
    if (!canAssignEquipment) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { equipmentId } = req.body;
    
    if (!equipmentId) {
      return res.status(400).json({
        success: false,
        message: 'Equipment ID is required'
      });
    }
    
    await team.assignEquipment(equipmentId, req.user.id);
    
    res.json({
      success: true,
      message: 'Equipment assigned successfully',
      data: team
    });
  } catch (error) {
    console.error('Error assigning equipment to team:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning equipment to team',
      error: error.message
    });
  }
});

// Add announcement to team
router.post('/:id/announcements', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to add announcements
    const canAddAnnouncements = team.owner.toString() === req.user.id ||
      team.members.some(member => 
        member.userId.toString() === req.user.id &&
        ['supervisor', 'owner'].includes(member.role)
      );
    
    if (!canAddAnnouncements) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { title, content, priority = 'medium', expiresAt } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }
    
    await team.addAnnouncement(title, content, req.user.id, priority, expiresAt);
    
    res.json({
      success: true,
      message: 'Announcement added successfully',
      data: team
    });
  } catch (error) {
    console.error('Error adding announcement to team:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding announcement to team',
      error: error.message
    });
  }
});

// Get team performance
router.get('/:id/performance', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has access to team performance
    const hasAccess = team.owner.toString() === req.user.id ||
      team.members.some(member => 
        member.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Get team events for performance calculation
    const teamEvents = await CalendarEvent.find({
      'assignedTo.userId': { $in: team.members.map(member => member.userId) }
    });
    
    const performance = {
      totalTasks: teamEvents.length,
      completedTasks: teamEvents.filter(event => event.status === 'completed').length,
      overdueTasks: teamEvents.filter(event => event.status === 'overdue').length,
      completionRate: team.performance.totalTasks > 0 ? 
        (team.performance.totalTasksCompleted / team.performance.totalTasks) * 100 : 0,
      averageCompletionTime: team.performance.averageCompletionTime,
      efficiencyRating: team.performance.efficiencyRating,
      activeMembers: team.activeMembersCount,
      totalMembers: team.members.length
    };
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching team performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team performance',
      error: error.message
    });
  }
});

// Update team performance
router.put('/:id/performance', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has permission to update performance
    const canUpdatePerformance = team.owner.toString() === req.user.id;
    
    if (!canUpdatePerformance) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }
    
    const { tasksAssigned, tasksCompleted, completionTime } = req.body;
    
    await team.updatePerformance(tasksAssigned, tasksCompleted, completionTime);
    
    res.json({
      success: true,
      message: 'Team performance updated successfully',
      data: team
    });
  } catch (error) {
    console.error('Error updating team performance:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team performance',
      error: error.message
    });
  }
});

// Get team statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }
    
    // Check if user has access to team stats
    const hasAccess = team.owner.toString() === req.user.id ||
      team.members.some(member => 
        member.userId.toString() === req.user.id
      );
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const stats = {
      totalMembers: team.members.length,
      activeMembers: team.activeMembersCount,
      totalFields: team.resources.assignedFields.length,
      totalEquipment: team.resources.assignedEquipment.length,
      totalAnnouncements: team.communication.announcements.length,
      budget: team.resources.budget,
      performance: team.performance
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching team statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team statistics',
      error: error.message
    });
  }
});

module.exports = router;
