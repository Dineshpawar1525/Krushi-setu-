// Farming-specific prompt templates and configurations

const FARMING_SYSTEM_PROMPT = `You are an expert AI Farming Assistant with comprehensive knowledge in:

🌱 CORE EXPERTISE:
- Crop cultivation and management (all major crops)
- Soil science, fertility, and health management
- Plant pathology and disease diagnosis
- Pest and weed management strategies
- Irrigation and water management systems
- Weather patterns and climate adaptation
- Sustainable and organic farming practices
- Post-harvest handling and storage
- Agricultural economics and market trends
- Farm business planning and management
- Government agricultural schemes and subsidies

🎯 RESPONSE GUIDELINES:
1. Provide accurate, science-based farming advice
2. Consider regional, seasonal, and climatic factors
3. Prioritize sustainable and eco-friendly solutions
4. Include practical, actionable steps with timelines
5. Mention safety precautions and protective measures
6. Reference current best practices and modern techniques
7. Be encouraging, supportive, and educational
8. Ask clarifying questions when more information is needed
9. Suggest organic alternatives before chemical treatments
10. Include cost-effective solutions for small farmers
11. Provide specific, detailed answers with examples
12. Include relevant government schemes when applicable

🌍 REGIONAL AWARENESS:
- Understand different farming systems (subsistence, commercial, organic)
- Consider local soil types, weather patterns, and growing seasons
- Be aware of regional pest and disease challenges
- Understand local market conditions and pricing
- Know about local government agricultural schemes

💡 COMMUNICATION STYLE:
- Use clear, simple language accessible to all farmers
- Include specific measurements, timing, and quantities
- Provide step-by-step instructions when appropriate
- Use encouraging and positive language
- Be patient and thorough in explanations
- Give specific examples and case studies
- Provide actionable advice that farmers can implement immediately

IMPORTANT: Always prioritize sustainable, environmentally-friendly farming practices. When discussing chemicals or treatments, mention organic alternatives first and emphasize safety precautions. Provide specific, detailed answers rather than generic responses.`;

const QUICK_RESPONSES = {
  'planting_time': {
    'tomato': 'For tomatoes, plant after the last frost when soil temperature reaches 60°F (15°C). In most regions, this is typically mid-April to early May. Start seeds indoors 6-8 weeks before transplanting.',
    'wheat': 'Winter wheat should be planted in late September to early October, while spring wheat is planted in early spring when soil temperature reaches 40°F (4°C).',
    'rice': 'Rice is typically planted in late spring to early summer when temperatures are consistently above 70°F (21°C). Timing varies by region and variety.',
    'corn': 'Plant corn when soil temperature reaches 50°F (10°C) and all danger of frost has passed. This is usually mid-April to early May in most regions.'
  },
  'government_schemes': {
    'general': 'Here are some key government agricultural schemes: 1) PM-KISAN - Direct income support of ₹6,000/year to farmers, 2) PMFBY - Crop insurance scheme, 3) Soil Health Card Scheme - Free soil testing, 4) Kisan Credit Card - Low-interest loans, 5) PM-KMY - Organic farming promotion, 6) Fasal Bima Yojana - Crop insurance. Contact your local agriculture office for application details.',
    'subsidy': 'Government provides various subsidies: 1) Fertilizer subsidy - 50-75% off on fertilizers, 2) Seed subsidy - Quality seeds at reduced rates, 3) Irrigation subsidy - Drip/sprinkler systems, 4) Equipment subsidy - Tractors, implements, 5) Organic farming subsidy - Up to ₹50,000 per hectare. Visit your nearest agriculture office for application.',
    'loan': 'Agricultural loans available: 1) Kisan Credit Card - Up to ₹3 lakh at 4% interest, 2) PM-KMY loan - For organic farming, 3) Dairy farming loan - Up to ₹10 lakh, 4) Poultry farming loan - Up to ₹5 lakh, 5) Fisheries loan - Up to ₹8 lakh. Contact your nearest bank or agriculture office.'
  },
  'disease_treatment': {
    'leaf_spot': 'For leaf spot diseases: 1) Remove affected leaves immediately, 2) Improve air circulation, 3) Apply copper fungicide or neem oil, 4) Water at soil level to avoid wetting leaves, 5) Ensure proper spacing between plants.',
    'powdery_mildew': 'Treat powdery mildew with: 1) Baking soda solution (1 tsp baking soda + 1 tsp liquid soap + 1 gallon water), 2) Neem oil spray, 3) Improve air circulation, 4) Avoid overhead watering.',
    'blight': 'For blight: 1) Remove infected plants immediately, 2) Apply copper fungicide, 3) Rotate crops, 4) Ensure good drainage, 5) Use disease-resistant varieties next season.'
  },
  'watering_advice': {
    'general': 'Most crops need 1-2 inches of water per week. Water deeply and less frequently to encourage deep root growth. Check soil moisture 2-3 inches deep before watering.',
    'vegetables': 'Vegetables typically need consistent moisture. Water 2-3 times per week, providing 1 inch of water each time. Mulch to retain moisture.',
    'trees': 'Newly planted trees need 10-15 gallons of water weekly. Established trees need deep watering every 2-3 weeks during dry periods.'
  }
};

const SEASONAL_ADVICE = {
  'spring': 'Spring is the perfect time for soil preparation, planting, and starting new crops. Focus on soil testing, bed preparation, and early planting of cool-season crops.',
  'summer': 'Summer requires attention to irrigation, pest management, and heat stress prevention. Monitor water needs closely and provide shade for sensitive plants.',
  'fall': 'Fall is ideal for harvesting, soil improvement, and planting cover crops. Prepare for winter and plan next season\'s crops.',
  'winter': 'Winter is perfect for planning, soil preparation, and maintenance. Focus on equipment repair, seed selection, and planning for the next growing season.'
};

const CROP_SPECIFIC_ADVICE = {
  'tomato': {
    'planting': 'Plant tomatoes 2-3 feet apart in well-drained soil with full sun. Support with stakes or cages.',
    'care': 'Water consistently, mulch around plants, and fertilize with balanced fertilizer every 2-3 weeks.',
    'harvest': 'Harvest when fruits are fully colored and slightly soft. Store at room temperature.'
  },
  'wheat': {
    'planting': 'Plant wheat in rows 6-8 inches apart, 1-2 inches deep. Ensure good seed-to-soil contact.',
    'care': 'Monitor for diseases and pests. Apply nitrogen fertilizer in early spring.',
    'harvest': 'Harvest when grain is hard and moisture content is 13-15%.'
  }
};

const MARKET_TRENDS = {
  'current': 'Current market trends show increasing demand for organic produce, sustainable farming practices, and locally-sourced foods. Prices vary by region and season.',
  'organic': 'Organic produce typically commands 20-30% higher prices than conventional crops, but requires certification and specific growing practices.',
  'export': 'Export opportunities exist for high-quality produce, spices, and specialty crops. Research international market requirements and certifications.'
};

// Function to get contextual prompt based on user input
function getContextualPrompt(userMessage, language = 'en', context = {}) {
  const basePrompt = FARMING_SYSTEM_PROMPT;
  
  // Add language instruction
  const languageInstruction = `\n\nLANGUAGE: Respond in ${getLanguageName(language)}.`;
  
  // Add contextual information
  let contextualInfo = '';
  if (context.season) {
    contextualInfo += `\n\nSEASONAL CONTEXT: It's currently ${context.season} season. ${SEASONAL_ADVICE[context.season]}`;
  }
  if (context.region) {
    contextualInfo += `\n\nREGIONAL CONTEXT: User is in ${context.region} region. Consider local climate, soil types, and growing conditions.`;
  }
  if (context.crop) {
    contextualInfo += `\n\nCROP CONTEXT: User is asking about ${context.crop}. ${CROP_SPECIFIC_ADVICE[context.crop] || 'Provide specific advice for this crop.'}`;
  }
  
  return basePrompt + languageInstruction + contextualInfo + `\n\nUSER'S QUESTION: ${userMessage}`;
}

// Function to get language name
function getLanguageName(code) {
  const languages = {
    'en': 'English',
    'hi': 'Hindi (हिंदी)',
    'es': 'Spanish (Español)',
    'fr': 'French (Français)',
    'pt': 'Portuguese (Português)',
    'ar': 'Arabic (العربية)',
    'zh': 'Chinese (中文)',
    'ja': 'Japanese (日本語)'
  };
  return languages[code] || 'English';
}

// Function to detect farming topics from user input
function detectFarmingTopics(message) {
  const topics = {
    'planting': /plant|seed|sow|grow|cultivate|transplant/i,
    'disease': /disease|sick|infected|spot|mold|fungus|blight|rot|wilt/i,
    'pest': /pest|bug|insect|worm|beetle|aphid|mite|thrip/i,
    'watering': /water|irrigation|drought|moisture|hydrate|drip|sprinkler/i,
    'soil': /soil|dirt|earth|fertility|nutrient|ph|compost|manure/i,
    'harvest': /harvest|pick|collect|yield|production|storage/i,
    'market': /price|market|sell|profit|cost|economic|revenue/i,
    'weather': /weather|climate|rain|sun|temperature|frost|storm/i,
    'government_schemes': /government|scheme|subsidy|loan|credit|kisan|pm-kisan|pmfby|kcc/i,
    'organic': /organic|natural|bio|eco|sustainable|green/i,
    'equipment': /tractor|equipment|machine|tool|implement|harvester/i,
    'livestock': /cattle|cow|buffalo|goat|sheep|poultry|chicken|fish/i
  };
  
  const detectedTopics = [];
  for (const [topic, regex] of Object.entries(topics)) {
    if (regex.test(message)) {
      detectedTopics.push(topic);
    }
  }
  
  return detectedTopics;
}

module.exports = {
  FARMING_SYSTEM_PROMPT,
  QUICK_RESPONSES,
  SEASONAL_ADVICE,
  CROP_SPECIFIC_ADVICE,
  MARKET_TRENDS,
  getContextualPrompt,
  detectFarmingTopics,
  getLanguageName
};
