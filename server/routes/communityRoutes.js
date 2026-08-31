const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const socketMiddleware = require("../middlewares/socketMiddleware");
const {
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
} = require("../controllers/communityController");

// Socket.io middleware - will be set by the main server
let ioInstance = null;
const setSocketIO = (io) => {
  ioInstance = io;
  // Don't apply middleware to all routes, only to specific ones that need it
};

// Export the setter function
router.setSocketIO = setSocketIO;

// ------------------- COMMUNITY ROUTES -------------------

// Get all communities (public)
router.get("/", getCommunities);

// Get user's communities (communities they created or joined)
router.get("/my-communities", protect, getUserCommunities);

// Create a new community
router.post("/", protect, createCommunity);

// Update community (creator only)
router.put("/:id", protect, updateCommunity);

// Delete community (creator only)
router.delete("/:id", protect, deleteCommunity);

// Request to join a community
router.post("/:id/join-request", protect, requestToJoin);

// Leave a community
router.post("/:id/leave", protect, leaveCommunity);

// ------------------- JOIN REQUEST ROUTES (CREATOR ONLY) -------------------

// Get join requests for a community
router.get("/:id/join-requests", protect, getJoinRequests);

// Approve or reject a join request
router.post("/:id/join-requests/:requestId", protect, handleJoinRequest);

// ------------------- MESSAGE ROUTES (MEMBERS ONLY) -------------------

// Get messages from a community
router.get("/:id/messages", protect, getMessages);

// Send a message to a community
router.post("/:id/messages", protect, (req, res) => {
  createMessage(req, res, ioInstance);
});

module.exports = router;