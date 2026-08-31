const gemini = require('../config/gemini');
const { getContextualPrompt, detectFarmingTopics, QUICK_RESPONSES, FARMING_SYSTEM_PROMPT } = require('../config/farmingPrompts');

// AI Chat Controller
const chatWithAI = async (req, res) => {
  try {
    const { message, language = 'en', context = 'farming_assistant', conversationHistory = [] } = req.body;
    
    // Log the request for debugging
    console.log('AI Chat Request:', {
      message: message?.substring(0, 100) + '...',
      language,
      context,
      conversationLength: conversationHistory.length,
      hasUser: !!req.user,
      userId: req.user?._id || 'anonymous'
    });

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // Detect farming topics from user message
    const detectedTopics = detectFarmingTopics(message);
    console.log('Detected farming topics:', detectedTopics);
    
    // Check if we have a quick response for this query
    let quickResponse = null;
    if (detectedTopics.includes('government_schemes')) {
      quickResponse = QUICK_RESPONSES.government_schemes.general;
    } else if (detectedTopics.includes('planting') && message.toLowerCase().includes('tomato')) {
      quickResponse = QUICK_RESPONSES.planting_time.tomato;
    } else if (detectedTopics.includes('disease') && message.toLowerCase().includes('leaf spot')) {
      quickResponse = QUICK_RESPONSES.disease_treatment.leaf_spot;
    }
    
    // If we have a quick response, use it as a base and enhance with AI
    let systemPrompt;
    if (quickResponse) {
      systemPrompt = `${FARMING_SYSTEM_PROMPT}

QUICK REFERENCE: ${quickResponse}

USER'S QUESTION: ${message}

Please provide a comprehensive, detailed response based on the quick reference above, but expand it with additional helpful information, specific steps, and practical advice.`;
    } else {
      // Create contextual farming prompt
      systemPrompt = getContextualPrompt(message, language, {
        topics: detectedTopics,
        season: getCurrentSeason(),
        region: req.body.region || 'general'
      });
    }
    
    // Add conversation history context
    if (conversationHistory && conversationHistory.length > 0) {
      systemPrompt += `\n\nCONVERSATION HISTORY: ${JSON.stringify(conversationHistory)}`;
    }

    console.log('Sending request to Gemini with prompt length:', systemPrompt.length);
    
    const response = await gemini(systemPrompt);
    
    console.log('Received response from Gemini, length:', response.length);

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      language: language,
      context: context
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Provide fallback response based on error type
    let fallbackResponse = "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.";
    
    if (error.message.includes('API key')) {
      fallbackResponse = "I'm currently unavailable due to configuration issues. Please contact support.";
    } else if (error.message.includes('rate limit')) {
      fallbackResponse = "I'm receiving too many requests. Please wait a moment and try again.";
    } else if (error.message.includes('timeout')) {
      fallbackResponse = "The request is taking longer than expected. Please try again with a shorter question.";
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      fallbackResponse = "I'm having trouble connecting to my AI services. Please check your internet connection and try again.";
    }
    
    // Provide specific farming responses as fallback
    if (message && (message.toLowerCase().includes('government') || message.toLowerCase().includes('scheme'))) {
      fallbackResponse = `🌾 **Government Agricultural Schemes for Farmers:**

**1. PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)**
• Direct income support of ₹6,000 per year
• Paid in 3 installments of ₹2,000 each
• Available to all landholding farmer families
• Apply at: https://pmkisan.gov.in

**2. PMFBY (Pradhan Mantri Fasal Bima Yojana)**
• Crop insurance scheme
• Premium: 2% for Kharif crops, 1.5% for Rabi crops
• Covers yield loss due to natural calamities
• Apply at your nearest bank or insurance company

**3. Soil Health Card Scheme**
• Free soil testing for farmers
• Provides soil health status and recommendations
• Helps optimize fertilizer use
• Contact your local agriculture office

**4. Kisan Credit Card (KCC)**
• Low-interest loans up to ₹3 lakh
• Interest rate: 4% per annum
• Flexible repayment options
• Apply at your nearest bank

**5. PM-KMY (Paramparagat Krishi Vikas Yojana)**
• Promotes organic farming
• Financial assistance up to ₹50,000 per hectare
• 3-year conversion period
• Contact agriculture department

**How to Apply:**
• Visit your nearest agriculture office
• Bring land documents and Aadhaar card
• Fill application forms
• Submit required documents

**Contact Information:**
• Agriculture helpline: 1800-180-1551
• Online portal: https://pmkisan.gov.in`;
    } else if (message && message.toLowerCase().includes('plant')) {
      fallbackResponse = `🌱 **Planting Guide:**

**General Planting Tips:**
• Check soil temperature before planting
• Plant after the last frost date
• Ensure proper spacing between plants
• Water immediately after planting
• Use quality seeds from certified sources

**Seasonal Planting:**
• **Spring (March-May):** Tomatoes, peppers, cucumbers, beans
• **Monsoon (June-September):** Rice, maize, millets
• **Winter (October-February):** Wheat, barley, peas, carrots

**Soil Preparation:**
• Test soil pH (6.0-7.0 ideal for most crops)
• Add organic matter (compost, manure)
• Ensure good drainage
• Remove weeds and debris

**Planting Depth:**
• Small seeds: 1/4 inch deep
• Medium seeds: 1/2 inch deep
• Large seeds: 1 inch deep

Contact your local agriculture extension office for specific regional advice.`;
    } else if (message && message.toLowerCase().includes('disease')) {
      fallbackResponse = `🦠 **Plant Disease Management:**

**Common Plant Diseases:**
• **Leaf Spot:** Remove affected leaves, improve air circulation, apply copper fungicide
• **Powdery Mildew:** Baking soda solution (1 tsp + 1 tsp soap + 1 gallon water)
• **Blight:** Remove infected plants, apply copper fungicide, rotate crops
• **Root Rot:** Improve drainage, avoid overwatering, use well-draining soil

**Prevention Methods:**
• Plant disease-resistant varieties
• Ensure proper spacing for air circulation
• Water at soil level, not on leaves
• Rotate crops annually
• Keep garden clean and weed-free

**Organic Treatments:**
• Neem oil spray
• Baking soda solution
• Copper fungicide
• Remove and destroy infected plants

**When to Consult:**
• If disease spreads rapidly
• If multiple plants are affected
• If symptoms are severe
• Contact local plant pathologist or agriculture extension agent

**Emergency Contact:**
• Plant disease helpline: 1800-180-1551
• Local agriculture office for expert diagnosis`;
    } else if (message && message.toLowerCase().includes('soil')) {
      fallbackResponse = `🌍 **Soil Health Management:**

**Soil Testing:**
• Get free soil test from agriculture office
• Test for pH, nutrients, organic matter
• Follow recommendations for improvement

**Improving Soil Fertility:**
• Add organic matter (compost, manure)
• Use green manure crops
• Practice crop rotation
• Apply balanced fertilizers

**Soil pH Management:**
• Most crops prefer pH 6.0-7.0
• Add lime to increase pH
• Add sulfur to decrease pH
• Test soil annually

**Organic Matter:**
• Add compost regularly
• Use cover crops
• Apply farmyard manure
• Practice no-till farming

**Nutrient Management:**
• Nitrogen: For leafy growth
• Phosphorus: For root development
• Potassium: For fruit quality
• Use soil test recommendations

**Contact for Soil Testing:**
• Local agriculture office
• Soil Health Card Scheme
• Free testing available
• Get specific recommendations for your soil type`;
    } else if (message && message.toLowerCase().includes('tomato')) {
      fallbackResponse = `🍅 **Tomato Growing Guide:**

**Planting Time:**
• Start seeds indoors 6-8 weeks before last frost
• Transplant when soil temperature reaches 60°F (15°C)
• In most regions: mid-April to early May
• Avoid planting too early in cold soil

**Planting Steps:**
1. Prepare soil with compost and organic matter
2. Space plants 2-3 feet apart
3. Plant deep, burying 2/3 of the stem
4. Water immediately after planting
5. Provide support with stakes or cages

**Care Requirements:**
• Water consistently, 1-2 inches per week
• Mulch around plants to retain moisture
• Fertilize every 2-3 weeks with balanced fertilizer
• Prune suckers regularly
• Check for pests and diseases

**Harvesting:**
• Pick when fully colored and slightly soft
• Store at room temperature
• Don't refrigerate until fully ripe
• Use within a week for best flavor

**Common Problems:**
• Blossom end rot: Add calcium, consistent watering
• Cracking: Consistent watering, avoid overwatering
• Pests: Use organic methods, neem oil spray`;
    } else if (message && message.toLowerCase().includes('wheat')) {
      fallbackResponse = `🌾 **Wheat Growing Guide:**

**Planting Time:**
• **Winter Wheat:** Late September to early October
• **Spring Wheat:** Early spring when soil reaches 40°F (4°C)
• Check local recommendations for your region

**Planting Steps:**
1. Prepare seedbed with good tilth
2. Plant seeds 1-2 inches deep
3. Space rows 6-8 inches apart
4. Ensure good seed-to-soil contact
5. Water lightly after planting

**Care Requirements:**
• Monitor for diseases and pests
• Apply nitrogen fertilizer in early spring
• Water during dry periods
• Control weeds with cultivation or herbicides

**Harvesting:**
• Harvest when grain is hard and moisture content is 13-15%
• Use combine harvester for large fields
• Store in dry, cool conditions
• Test grain quality before storage

**Common Varieties:**
• HD-2967: High yield, disease resistant
• PBW-343: Good for bread making
• Lok-1: Drought tolerant
• Choose based on your region and needs`;
    } else {
      fallbackResponse = `🌾 **Welcome to AI Farming Assistant!**

I'm here to help you with all your farming needs. I can assist with:

**🌱 Crop Management:**
• Planting schedules and techniques
• Growth stages and care
• Harvesting and storage

**🦠 Disease & Pest Control:**
• Disease diagnosis and treatment
• Pest identification and management
• Organic and chemical solutions

**🌍 Soil & Fertility:**
• Soil testing and improvement
• Nutrient deficiency identification
• Fertilizer recommendations

**💰 Government Schemes:**
• PM-KISAN, PMFBY, Kisan Credit Card
• Subsidies and loans
• Application procedures

**🌦️ Weather & Climate:**
• Weather-based farming advice
• Climate adaptation strategies
• Seasonal planning

Please ask me specific questions about your farming needs, and I'll provide detailed, actionable advice!`;
    }

    res.status(500).json({
      success: false,
      response: fallbackResponse,
      error: 'AI service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
};

// Get farming tips and advice
const getFarmingTips = async (req, res) => {
  try {
    const { category, season, region } = req.query;
    
    const tipPrompt = `Provide 5 practical farming tips for:
Category: ${category || 'general farming'}
Season: ${season || 'current season'}
Region: ${region || 'general'}

Format as a numbered list with brief, actionable advice.`;

    const response = await gemini(tipPrompt);
    
    res.json({
      success: true,
      tips: response,
      category,
      season,
      region,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Farming tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch farming tips at this time',
      error: error.message
    });
  }
};

// Diagnose plant issues
const diagnosePlantIssue = async (req, res) => {
  try {
    const { symptoms, plantType, images, location } = req.body;
    
    const diagnosisPrompt = `As a plant pathologist, analyze these symptoms and provide diagnosis:

Plant Type: ${plantType || 'Unknown'}
Symptoms: ${symptoms}
Location: ${location || 'Not specified'}

Provide:
1. Likely diagnosis
2. Possible causes
3. Treatment recommendations
4. Prevention measures
5. When to consult a professional

Be specific and practical in your recommendations.`;

    const response = await gemini(diagnosisPrompt);
    
    res.json({
      success: true,
      diagnosis: response,
      plantType,
      symptoms,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Plant diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to diagnose plant issue at this time',
      error: error.message
    });
  }
};

// Get market prices and trends
const getMarketInfo = async (req, res) => {
  try {
    const { crop, region, timeframe } = req.query;
    
    const marketPrompt = `Provide current market information for:
Crop: ${crop || 'general agricultural commodities'}
Region: ${region || 'global'}
Timeframe: ${timeframe || 'current'}

Include:
1. Current price trends
2. Market factors affecting prices
3. Seasonal considerations
4. Future outlook
5. Where to find real-time prices

Note: For real-time prices, recommend checking local markets and commodity exchanges.`;

    const response = await gemini(marketPrompt);
    
    res.json({
      success: true,
      marketInfo: response,
      crop,
      region,
      timeframe,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Market info error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch market information at this time',
      error: error.message
    });
  }
};

// Helper function to get current season
function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'fall';
  return 'winter';
}

// Helper function to get language name
function getLanguageName(code) {
  const languages = {
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French',
    'pt': 'Portuguese',
    'ar': 'Arabic',
    'zh': 'Chinese',
    'ja': 'Japanese'
  };
  return languages[code] || 'English';
}

module.exports = {
  chatWithAI,
  getFarmingTips,
  diagnosePlantIssue,
  getMarketInfo
};
