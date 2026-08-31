const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  chatWithFinancialAdvisor,
  getFinancialTips,
  getGovernmentSchemes
} = require("../controllers/financialController");

// Financial Advisor Chat endpoint (public for landing page)
router.post("/chat", chatWithFinancialAdvisor);

// Get financial tips (public)
router.get("/tips", getFinancialTips);

// Get government schemes (public)
router.get("/schemes", getGovernmentSchemes);

// Test endpoint to verify financial advisor is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Financial Advisor (Dhan Sarthi) is working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      chat: "POST /api/financial-advice/chat",
      tips: "GET /api/financial-advice/tips",
      schemes: "GET /api/financial-advice/schemes"
    }
  });
});

module.exports = router;
