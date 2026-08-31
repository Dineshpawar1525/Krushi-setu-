const Community = require("../models/Community");
const Message = require("../models/Message");
const User = require("../models/User");

// ------------------- GET ALL COMMUNITIES -------------------
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET USER'S COMMUNITIES -------------------
const getUserCommunities = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const communities = await Community.find({
      $or: [
        { creator: userId },
        { members: userId }
      ]
    })
    .populate('creator', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort({ createdAt: -1 });
    
    res.status(200).json(communities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- CREATE COMMUNITY -------------------
const createCommunity = async (req, res, io) => {
  try {
    const { name, description, category, isPrivate, maxMembers } = req.body;
    const creatorId = req.user._id;

    // Check if community already exists
    const exists = await Community.findOne({ name });
    if (exists) return res.status(400).json({ message: "Community already exists" });

    const community = new Community({
      name,
      description: description || "A new farming community",
      category: category || "General",
      creator: creatorId,
      members: [creatorId], // Creator is automatically a member
      isPrivate: isPrivate || false,
      maxMembers: maxMembers || 100
    });

    await community.save();
    
    // Populate the community data for response
    await community.populate('creator', 'name email avatar');
    await community.populate('members', 'name email avatar');

    // Emit to all connected clients to update their community list
    if (io) io.emit("updateCommunities", await Community.find());

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- UPDATE COMMUNITY (CREATOR ONLY) -------------------
const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { name, description, category, isPrivate, maxMembers } = req.body;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is the creator
    if (community.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the creator can update this community" });
    }

    // Check if new name already exists (if name is being changed)
    if (name && name !== community.name) {
      const exists = await Community.findOne({ name });
      if (exists) return res.status(400).json({ message: "Community name already exists" });
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      { name, description, category, isPrivate, maxMembers },
      { new: true, runValidators: true }
    ).populate('creator', 'name email avatar').populate('members', 'name email avatar');

    res.status(200).json(updatedCommunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- DELETE COMMUNITY (CREATOR ONLY) -------------------
const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is the creator
    if (community.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the creator can delete this community" });
    }

    // Delete all messages in this community
    await Message.deleteMany({ community: id });

    // Delete the community
    await Community.findByIdAndDelete(id);

    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- REQUEST TO JOIN COMMUNITY -------------------
const requestToJoin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is already a member
    if (community.members.includes(userId)) {
      return res.status(400).json({ message: "You are already a member of this community" });
    }

    // Check if user has already requested to join
    const existingRequest = community.joinRequests.find(
      request => request.user.toString() === userId.toString()
    );
    if (existingRequest) {
      return res.status(400).json({ message: "You have already requested to join this community" });
    }

    // Add join request
    community.joinRequests.push({
      user: userId,
      status: 'pending'
    });

    await community.save();

    res.status(200).json({ message: "Join request sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- APPROVE/REJECT JOIN REQUEST (CREATOR ONLY) -------------------
const handleJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is the creator
    if (community.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the creator can handle join requests" });
    }

    const request = community.joinRequests.id(requestId);
    if (!request) return res.status(404).json({ message: "Join request not found" });

    if (action === 'approve') {
      // Add user to members
      if (!community.members.includes(request.user)) {
        community.members.push(request.user);
      }
      request.status = 'approved';
      request.reviewedAt = new Date();
      request.reviewedBy = userId;
    } else if (action === 'reject') {
      request.status = 'rejected';
      request.reviewedAt = new Date();
      request.reviewedBy = userId;
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'" });
    }

    await community.save();

    res.status(200).json({ message: `Join request ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET JOIN REQUESTS (CREATOR ONLY) -------------------
const getJoinRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id)
      .populate('joinRequests.user', 'name email avatar')
      .populate('joinRequests.reviewedBy', 'name email');
    
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is the creator
    if (community.creator.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the creator can view join requests" });
    }

    res.status(200).json(community.joinRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET MESSAGES OF A COMMUNITY (MEMBERS ONLY) -------------------
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(403).json({ message: "You must be a member to view messages" });
    }

    const messages = await Message.find({ community: id })
      .populate('sender', 'name email avatar')
      .populate('replyTo')
      .sort({ timestamp: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- CREATE MESSAGE (MEMBERS ONLY) -------------------
const createMessage = async (req, res, io = null) => {
  try {
    const { id: communityId } = req.params; // Get community ID from URL params
    const { message, replyTo } = req.body;
    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(403).json({ message: "You must be a member to send messages" });
    }

    const newMessage = new Message({
      community: communityId,
      sender: userId,
      message,
      replyTo: replyTo || null
    });

    await newMessage.save();
    await newMessage.populate('sender', 'name email avatar');

    // Emit real-time message to all community members
    if (io) {
      io.to(`community_${communityId}`).emit('newMessage', {
        _id: newMessage._id,
        community: newMessage.community,
        sender: newMessage.sender,
        message: newMessage.message,
        timestamp: newMessage.timestamp,
        isPinned: newMessage.isPinned,
        editedAt: newMessage.editedAt,
        isEdited: newMessage.isEdited,
        replyTo: newMessage.replyTo
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- LEAVE COMMUNITY -------------------
const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    // Check if user is a member
    if (!community.members.includes(userId)) {
      return res.status(400).json({ message: "You are not a member of this community" });
    }

    // Creator cannot leave their own community
    if (community.creator.toString() === userId.toString()) {
      return res.status(400).json({ message: "Creator cannot leave their own community" });
    }

    // Remove user from members
    community.members = community.members.filter(memberId => memberId.toString() !== userId.toString());
    await community.save();

    res.status(200).json({ message: "Left community successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCommunities,
  getUserCommunities,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  requestToJoin,
  handleJoinRequest,
  getJoinRequests,
  getMessages,
  createMessage,
  leaveCommunity,
};