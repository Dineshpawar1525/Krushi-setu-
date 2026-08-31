const Scheme = require('../models/Scheme');
const gemini = require('../config/gemini');

// Get all schemes with optional filtering
const getSchemes = async (req, res) => {
  try {
    const { category, state, search, sortBy = 'priority' } = req.query;
    
    // Build filter object
    const filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (state && state !== 'All') {
      filter.state = { $in: [state, 'All India'] };
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'name':
        sort = { name: 1 };
        break;
      case 'date':
        sort = { createdAt: -1 };
        break;
      case 'priority':
      default:
        sort = { priority: -1, createdAt: -1 };
        break;
    }
    
    const schemes = await Scheme.find(filter).sort(sort);
    
    res.json({
      success: true,
      data: schemes,
      count: schemes.length
    });
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get scheme by ID
const getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scheme = await Scheme.findById(id);
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }
    
    res.json({
      success: true,
      data: scheme
    });
  } catch (error) {
    console.error('Error fetching scheme:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get scheme categories
const getCategories = async (req, res) => {
  try {
    const categories = await Scheme.distinct('category', { isActive: true });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get scheme states
const getStates = async (req, res) => {
  try {
    const states = await Scheme.distinct('state', { isActive: true });
    
    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new scheme (Admin only)
const createScheme = async (req, res) => {
  try {
    const schemeData = req.body;
    
    const scheme = new Scheme(schemeData);
    await scheme.save();
    
    res.status(201).json({
      success: true,
      message: 'Scheme created successfully',
      data: scheme
    });
  } catch (error) {
    console.error('Error creating scheme:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update scheme (Admin only)
const updateScheme = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const scheme = await Scheme.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Scheme updated successfully',
      data: scheme
    });
  } catch (error) {
    console.error('Error updating scheme:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete scheme (Admin only)
const deleteScheme = async (req, res) => {
  try {
    const { id } = req.params;
    
    const scheme = await Scheme.findByIdAndDelete(id);
    
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Scheme deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting scheme:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get schemes using Gemini AI based on user profile
const getSchemesByProfile = async (req, res) => {
  try {
    const { category, state, income, age, occupation, farmSize, crops } = req.body;

    // If all filters are 'All', return some general agricultural schemes
    if (
      (!category || category === "All") &&
      (!state || state === "All") &&
      (!income || income === "All") &&
      (!age || age === "All") &&
      (!occupation || occupation === "All")
    ) {
      // Return general agricultural schemes from database
      const generalSchemes = await Scheme.find({ isActive: true })
        .sort({ priority: -1 })
        .limit(10);
      
      return res.json(generalSchemes);
    }

    const prompt = `
You are an expert in Indian agricultural government welfare schemes and farmer support programs.

Given the following farmer profile:
- Category: ${category}
- State: ${state}
- Income Level: ${income}
- Age: ${age}
- Occupation: ${occupation}
- Farm Size: ${farmSize || 'Not specified'}
- Crops: ${crops || 'Not specified'}

List the most relevant and up-to-date Indian government agricultural schemes that match this farmer's profile.

Output:
Return an array of JSON objects, each representing one agricultural scheme, with the following fields:
[
  {
    "name": "Official name of the agricultural scheme",
    "description": "Brief summary (1-2 sentences) based on official sources",
    "eligibility": "Key official eligibility criteria tailored to farmer's profile",
    "category": "Agricultural category (e.g. Crop Insurance, Subsidy, Loan, Training, Technology, Infrastructure, Marketing, Research, General)",
    "state": "State(s) to which the scheme applies",
    "lastApplyDate": "YYYY-MM-DD or 'N/A' if not available",
    "applicationProcedure": "Concise step-by-step procedure as per government sources",
    "applicationLink": "Official government URL for application (leave null if none exists)",
    "amount": "Financial benefit amount or subsidy percentage",
    "benefits": ["List of key benefits"],
    "documents": ["Required documents list"],
    "contactInfo": {
      "phone": "Contact phone number if available",
      "website": "Official website if available"
    }
  },
  ...
]

Instructions:
- Focus ONLY on agricultural, farming, and rural development schemes
- Only include real, current government schemes, not discontinued programs
- Prefer central schemes and state schemes specific to the farmer's state
- Double-check eligibility and details with official sources
- Leave 'applicationLink' blank or null if no official online link is available
- Output only the JSON array, with no extra text or commentary before or after
- If a field is unknown, use 'N/A' (except for applicationLink)
- Show the maximum number of matching agricultural schemes that are relevant and available for this farmer profile
- Do not invent or fabricate scheme names, descriptions, or application links
- Include schemes like PM-KISAN, PMFBY, KCC, Soil Health Card, SAMPADA, NMSA, etc.
`;

    const schemes = await gemini(prompt);
    const jsonStart = schemes.indexOf("[");
    const jsonEnd = schemes.lastIndexOf("]") + 1;
    const jsonString = schemes.substring(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);
    res.json(parsed);
  } catch (error) {
    console.error("Error fetching schemes with Gemini:", error.message);
    
    // Fallback to database schemes if Gemini fails
    try {
      const fallbackSchemes = await Scheme.find({ isActive: true })
        .sort({ priority: -1 })
        .limit(10);
      
      res.json(fallbackSchemes);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError.message);
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch schemes" 
      });
    }
  }
};

// Get AI-powered schemes using Gemini
const getAISchemes = async (req, res) => {
  try {
    const { category, state, income, age, occupation, farmSize, crops, experience } = req.body;

    // If all filters are 'All' or empty, return database schemes
    if (
      (!category || category === "All") &&
      (!state || state === "All") &&
      (!income || income === "All") &&
      (!age || age === "All") &&
      (!occupation || occupation === "All") &&
      (!farmSize || farmSize === "All") &&
      (!crops || crops === "All") &&
      (!experience || experience === "All")
    ) {
      // Return database schemes as fallback
      const schemes = await Scheme.find({ isActive: true }).sort({ priority: -1, createdAt: -1 });
      return res.json({
        success: true,
        data: schemes,
        count: schemes.length,
        source: 'database'
      });
    }

    const prompt = `
You are an expert in Indian agricultural government schemes and farmer welfare programs.

Given the following farmer profile:
- Category: ${category || 'Agriculture'}
- State: ${state || 'All India'}
- Income: ${income || 'Not specified'}
- Age: ${age || 'Not specified'}
- Occupation: ${occupation || 'Farmer'}
- Farm Size: ${farmSize || 'Not specified'}
- Crops: ${crops || 'Not specified'}
- Experience: ${experience || 'Not specified'}

List the most relevant and up-to-date Indian government agricultural schemes that match this farmer's profile.

Output:
Return an array of JSON objects, each representing one scheme, with the following fields:
[
  {
    "name": "Official name of the agricultural scheme",
    "description": "Brief summary (1-2 sentences) based on official sources",
    "eligibility": "Key official eligibility criteria tailored to farmer's profile",
    "category": "Agricultural category (e.g. Crop Insurance, Subsidy, Loan, Training, Technology, Infrastructure, Marketing, Research, General)",
    "state": "State(s) to which the scheme applies",
    "lastApplyDate": "YYYY-MM-DD or 'N/A' if not available",
    "applicationProcedure": "Concise step-by-step procedure as per government sources",
    "applicationLink": "Official government URL for application (leave null if none exists)",
    "amount": "Financial benefit amount or subsidy percentage",
    "interestRate": "Interest rate if applicable (leave null if not applicable)",
    "tenure": "Loan tenure or scheme duration if applicable",
    "benefits": ["List of key benefits"],
    "documents": ["List of required documents"],
    "contactInfo": {
      "phone": "Contact phone number if available",
      "email": "Contact email if available",
      "website": "Official website URL"
    },
    "tags": ["Relevant tags for the scheme"]
  },
  ...
]

Instructions:
- Focus ONLY on agricultural schemes, farmer welfare programs, and rural development schemes
- Only include real, current government schemes, not discontinued programs
- Prefer central schemes and state schemes specific to the farmer's state
- Double-check eligibility and details with official sources
- Leave 'applicationLink' blank or null if no official online link is available
- Output only the JSON array, with no extra text or commentary before or after
- If a field is unknown, use 'N/A' (except for applicationLink)
- Show the maximum number of matching schemes that are relevant and available for this farmer profile
- Do not invent or fabricate scheme names, descriptions, or application links
- Include schemes like PM-KISAN, PMFBY, KCC, Soil Health Card, SAMPADA, NMSA, etc.
`;

    const schemes = await gemini(prompt);
    const jsonStart = schemes.indexOf("[");
    const jsonEnd = schemes.lastIndexOf("]") + 1;
    const jsonString = schemes.substring(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonString);
    
    res.json({
      success: true,
      data: parsed,
      count: parsed.length,
      source: 'ai'
    });
  } catch (error) {
    console.error("Error fetching AI schemes:", error.message);
    
    // Fallback to database schemes
    try {
      const schemes = await Scheme.find({ isActive: true }).sort({ priority: -1, createdAt: -1 });
      res.json({
        success: true,
        data: schemes,
        count: schemes.length,
        source: 'database_fallback',
        message: 'AI service unavailable, showing database schemes'
      });
    } catch (dbError) {
      console.error("Database fallback error:", dbError);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch schemes'
      });
    }
  }
};

// Seed initial schemes data
const seedSchemes = async (req, res) => {
  try {
    const schemes = [
      {
        name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        description: "Direct income support scheme providing ₹6,000 per year to small and marginal farmers in three equal installments.",
        category: "Subsidy",
        state: "All India",
        eligibility: "Small and marginal farmers with landholding up to 2 hectares",
        benefits: [
          "₹6,000 per year in three installments",
          "Direct bank transfer",
          "No middlemen involved",
          "Covers all small and marginal farmers"
        ],
        applicationProcedure: "Register through Common Service Centres (CSC) or online portal with land records and bank details",
        applicationLink: "https://pmkisan.gov.in/",
        lastApplyDate: "Ongoing",
        amount: "₹6,000 per year",
        documents: ["Land records", "Bank account details", "Aadhaar card", "Mobile number"],
        contactInfo: {
          phone: "1800-180-1551",
          website: "https://pmkisan.gov.in/"
        },
        priority: 10,
        tags: ["PM-KISAN", "Direct Benefit Transfer", "Small Farmers", "Income Support"]
      },
      {
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "Crop insurance scheme providing financial support to farmers in case of crop failure due to natural calamities.",
        category: "Crop Insurance",
        state: "All India",
        eligibility: "All farmers growing notified crops in notified areas",
        benefits: [
          "Comprehensive risk coverage",
          "Low premium rates",
          "Quick claim settlement",
          "Coverage for prevented sowing and post-harvest losses"
        ],
        applicationProcedure: "Apply through insurance companies, banks, or online portal before sowing",
        applicationLink: "https://pmfby.gov.in/",
        lastApplyDate: "Before sowing season",
        amount: "Premium varies by crop and area",
        documents: ["Land records", "Bank account details", "Crop details", "Previous year's yield records"],
        contactInfo: {
          phone: "1800-180-1551",
          website: "https://pmfby.gov.in/"
        },
        priority: 9,
        tags: ["Crop Insurance", "Natural Calamities", "Risk Coverage", "PMFBY"]
      },
      {
        name: "Kisan Credit Card (KCC)",
        description: "Flexible credit facility for farmers to meet their agricultural and allied needs.",
        category: "Loan",
        state: "All India",
        eligibility: "Farmers, tenant farmers, oral lessees, and sharecroppers",
        benefits: [
          "Flexible credit limit",
          "Low interest rates",
          "Simplified documentation",
          "Coverage for production and investment credit"
        ],
        applicationProcedure: "Apply at any bank branch with land records and identity proof",
        applicationLink: "https://www.nabard.org/",
        lastApplyDate: "Ongoing",
        amount: "Up to ₹3 lakhs",
        interestRate: "4% per annum",
        tenure: "Flexible repayment",
        documents: ["Land records", "Identity proof", "Bank account details", "Income certificate"],
        contactInfo: {
          phone: "1800-425-1556",
          website: "https://www.nabard.org/"
        },
        priority: 8,
        tags: ["Credit Card", "Flexible Credit", "Low Interest", "KCC"]
      },
      {
        name: "Soil Health Card Scheme",
        description: "Scheme to provide soil health cards to farmers with recommendations for appropriate use of fertilizers.",
        category: "Technology",
        state: "All India",
        eligibility: "All farmers with agricultural land",
        benefits: [
          "Free soil testing",
          "Personalized fertilizer recommendations",
          "Improved soil health",
          "Reduced input costs"
        ],
        applicationProcedure: "Apply at nearest soil testing laboratory or through online portal",
        applicationLink: "https://soilhealth.dac.gov.in/",
        lastApplyDate: "Ongoing",
        amount: "Free",
        documents: ["Land records", "Aadhaar card", "Contact details"],
        contactInfo: {
          phone: "1800-180-1551",
          website: "https://soilhealth.dac.gov.in/"
        },
        priority: 7,
        tags: ["Soil Testing", "Fertilizer Recommendation", "Soil Health", "Free Service"]
      },
      {
        name: "Pradhan Mantri Kisan Sampada Yojana",
        description: "Scheme for creation of modern infrastructure for food processing sector.",
        category: "Infrastructure",
        state: "All India",
        eligibility: "Food processing units, entrepreneurs, and farmer producer organizations",
        benefits: [
          "Financial assistance for infrastructure",
          "Technology upgradation support",
          "Market linkage",
          "Employment generation"
        ],
        applicationProcedure: "Apply online through the official portal with project proposal",
        applicationLink: "https://sampada.gov.in/",
        lastApplyDate: "As per notification",
        amount: "Up to ₹10 crores",
        documents: ["Project proposal", "Land documents", "Financial statements", "Technical details"],
        contactInfo: {
          phone: "011-2306-2444",
          website: "https://sampada.gov.in/"
        },
        priority: 6,
        tags: ["Food Processing", "Infrastructure", "Modernization", "SAMPADA"]
      },
      {
        name: "National Mission on Sustainable Agriculture (NMSA)",
        description: "Mission to promote sustainable agriculture practices and climate-resilient farming.",
        category: "Training",
        state: "All India",
        eligibility: "Farmers, farmer groups, and agricultural institutions",
        benefits: [
          "Training on sustainable practices",
          "Financial support for adoption",
          "Technology transfer",
          "Climate resilience building"
        ],
        applicationProcedure: "Contact nearest Krishi Vigyan Kendra (KVK) or agricultural department",
        applicationLink: "https://nmsa.dac.gov.in/",
        lastApplyDate: "Ongoing",
        amount: "Varies by component",
        documents: ["Land records", "Farmer registration", "Project proposal"],
        contactInfo: {
          phone: "011-2306-2444",
          website: "https://nmsa.dac.gov.in/"
        },
        priority: 5,
        tags: ["Sustainable Agriculture", "Climate Resilience", "Training", "NMSA"]
      },
      {
        name: "Pradhan Mantri Kisan Maan Dhan Yojana",
        description: "Pension scheme for small and marginal farmers to provide social security in old age.",
        category: "General",
        state: "All India",
        eligibility: "Small and marginal farmers aged 18-40 years",
        benefits: [
          "Monthly pension of ₹3,000",
          "Family pension in case of death",
          "Government contribution",
          "Social security in old age"
        ],
        applicationProcedure: "Apply at Common Service Centres (CSC) with required documents",
        applicationLink: "https://pmkmy.gov.in/",
        lastApplyDate: "Ongoing",
        amount: "₹3,000 monthly pension",
        documents: ["Aadhaar card", "Land records", "Bank account details", "Age proof"],
        contactInfo: {
          phone: "1800-180-1551",
          website: "https://pmkmy.gov.in/"
        },
        priority: 4,
        tags: ["Pension", "Social Security", "Small Farmers", "Old Age Support"]
      },
      {
        name: "Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan (PM-KUSUM)",
        description: "Scheme to promote solar energy in agriculture and provide energy security to farmers.",
        category: "Technology",
        state: "All India",
        eligibility: "Farmers with agricultural land and grid-connected pumps",
        benefits: [
          "Solar pump installation subsidy",
          "Solar power generation",
          "Reduced electricity bills",
          "Additional income from surplus power"
        ],
        applicationProcedure: "Apply through state nodal agencies or online portal",
        applicationLink: "https://pmkusum.mnre.gov.in/",
        lastApplyDate: "As per state schedule",
        amount: "Up to 60% subsidy",
        documents: ["Land records", "Electricity connection details", "Bank account details"],
        contactInfo: {
          phone: "1800-180-1551",
          website: "https://pmkusum.mnre.gov.in/"
        },
        priority: 3,
        tags: ["Solar Energy", "Renewable Energy", "Energy Security", "PM-KUSUM"]
      }
    ];
    
    // Clear existing schemes and insert new ones
    await Scheme.deleteMany({});
    await Scheme.insertMany(schemes);
    
    res.json({
      success: true,
      message: `${schemes.length} schemes seeded successfully`
    });
  } catch (error) {
    console.error('Error seeding schemes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getSchemes,
  getSchemeById,
  getCategories,
  getStates,
  createScheme,
  updateScheme,
  deleteScheme,
  seedSchemes,
  getAISchemes
};
