const gemini = require('../config/gemini');

// Financial Advisor Controller
const chatWithFinancialAdvisor = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    
    // Log the request for debugging
    console.log('Financial Advisor Request:', {
      message: message?.substring(0, 100) + '...',
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

    // Create financial advisor system prompt
    const systemPrompt = `You are Dhan Sarthi, an expert AI Financial Advisor with comprehensive knowledge in:

💰 FINANCIAL EXPERTISE:
- Personal finance management
- Investment strategies and portfolio management
- Government financial schemes and subsidies
- Tax planning and optimization
- Insurance planning (life, health, property)
- Retirement planning
- Loan and credit management
- Banking and financial services
- Real estate investment
- Mutual funds, stocks, and bonds
- Cryptocurrency and alternative investments
- Business finance and entrepreneurship

🎯 RESPONSE GUIDELINES:
1. Provide accurate, practical financial advice
2. Consider the user's financial situation and goals
3. Suggest government schemes and subsidies when relevant
4. Include specific steps and actionable advice
5. Mention risks and precautions
6. Reference current financial regulations and policies
7. Be encouraging and supportive
8. Ask clarifying questions when needed
9. Provide cost-effective solutions
10. Include specific examples and calculations
11. Mention relevant government schemes and benefits
12. Provide actionable advice that users can implement immediately

🌍 REGIONAL AWARENESS:
- Understand Indian financial system and regulations
- Know about government schemes like PM-KISAN, PMFBY, etc.
- Consider local banking and financial services
- Understand regional economic conditions
- Know about state-specific financial schemes

💡 COMMUNICATION STYLE:
- Use clear, simple language accessible to all users
- Include specific amounts, percentages, and calculations
- Provide step-by-step instructions when appropriate
- Use encouraging and positive language
- Be patient and thorough in explanations
- Give specific examples and case studies
- Provide actionable advice that users can implement immediately

IMPORTANT: Always prioritize user's financial safety and security. When discussing investments, mention risks and suggest diversification. Provide specific, detailed answers rather than generic responses.

CONVERSATION HISTORY: ${JSON.stringify(conversationHistory)}

USER'S QUESTION: ${message}`;

    console.log('Sending request to Gemini with prompt length:', systemPrompt.length);
    
    const response = await gemini(systemPrompt);
    
    console.log('Received response from Gemini, length:', response.length);

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Financial Advisor error:', error);
    
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
    
    // Provide a basic financial response as fallback
    if (message && message.toLowerCase().includes('government') || message.toLowerCase().includes('scheme')) {
      fallbackResponse = "Here are some key government financial schemes: 1) PM-KISAN - ₹6,000/year for farmers, 2) PMFBY - Crop insurance, 3) Kisan Credit Card - Low-interest loans, 4) Pradhan Mantri Jan Dhan Yojana - Banking for all, 5) Atal Pension Yojana - Pension scheme. Contact your nearest bank or government office for application details.";
    } else if (message && message.toLowerCase().includes('investment')) {
      fallbackResponse = "For investment advice, I recommend starting with low-risk options like fixed deposits, government bonds, or mutual funds. Consider your risk tolerance and financial goals. Always diversify your investments and never invest more than you can afford to lose.";
    } else if (message && message.toLowerCase().includes('saving')) {
      fallbackResponse = "For saving money, start with creating a budget, cutting unnecessary expenses, and setting up automatic transfers to a savings account. Consider high-yield savings accounts, fixed deposits, or government savings schemes like PPF or NSC.";
    } else if (message && message.toLowerCase().includes('tax')) {
      fallbackResponse = "For tax planning, consider investing in tax-saving instruments like ELSS mutual funds, PPF, NSC, or tax-saving FDs. Also, claim deductions for home loan interest, medical insurance, and other eligible expenses. Consult a tax advisor for personalized advice.";
    }

    res.status(500).json({
      success: false,
      response: fallbackResponse,
      error: 'AI service temporarily unavailable',
      timestamp: new Date().toISOString()
    });
  }
};

// Get financial tips and advice
const getFinancialTips = async (req, res) => {
  try {
    const { category, type, amount } = req.query;
    
    const tipPrompt = `Provide 5 practical financial tips for:
Category: ${category || 'general personal finance'}
Type: ${type || 'saving and investment'}
Amount: ${amount || 'any budget'}

Format as a numbered list with brief, actionable advice.`;

    const response = await gemini(tipPrompt);
    
    res.json({
      success: true,
      tips: response,
      category,
      type,
      amount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Financial tips error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch financial tips at this time',
      error: error.message
    });
  }
};

// Get government schemes information
const getGovernmentSchemes = async (req, res) => {
  try {
    const { category, eligibility } = req.query;
    
    const schemePrompt = `Provide information about government financial schemes for:
Category: ${category || 'general'}
Eligibility: ${eligibility || 'all citizens'}

Include scheme names, benefits, eligibility criteria, and application process.`;

    const response = await gemini(schemePrompt);
    
    res.json({
      success: true,
      schemes: response,
      category,
      eligibility,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Government schemes error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch government schemes at this time',
      error: error.message
    });
  }
};

module.exports = {
  chatWithFinancialAdvisor,
  getFinancialTips,
  getGovernmentSchemes
};
