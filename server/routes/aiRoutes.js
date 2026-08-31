const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  chatWithAI,
  getFarmingTips,
  diagnosePlantIssue,
  getMarketInfo
} = require("../controllers/aiController");

// AI Chat endpoint (public for landing page, protected for authenticated users)
router.post("/chat", chatWithAI);

// Get farming tips (public)
router.get("/tips", getFarmingTips);

// Diagnose plant issues (protected)
router.post("/diagnose", protect, diagnosePlantIssue);

// Get market information (public)
router.get("/market", getMarketInfo);

// Test endpoint to verify AI is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI Farming Assistant is working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      chat: "POST /api/ai/chat",
      tips: "GET /api/ai/tips",
      diagnose: "POST /api/ai/diagnose",
      market: "GET /api/ai/market"
    }
  });
});

module.exports = router;
