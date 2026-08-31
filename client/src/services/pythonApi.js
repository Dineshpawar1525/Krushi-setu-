/**
 * Python API Service
 * Handles API calls to the unified Python server (port 5000)
 */

const PYTHON_API_BASE_URL = 'http://localhost:5000/api';

export const pythonApi = {
  /**
   * Plant Disease Detection
   * @param {File} imageFile - The image file to analyze
   * @returns {Promise<Object>} - The prediction result
   */
  async predictPlantDisease(imageFile) {
    try {
      console.log('🔍 Analyzing plant image:', imageFile.name, imageFile.size, 'bytes');
      
      const formData = new FormData();
      formData.append('file', imageFile);

      console.log('📤 Sending request to Python server...');
      const response = await fetch(`${PYTHON_API_BASE_URL}/plant-disease/predict`, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Received response from Python server:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Python API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Python API Response:', data);
      
      // Transform the response to match frontend expectations
      const transformedResponse = {
        success: data.success,
        prediction: {
          disease: data.class || 'Unknown',
          confidence: Math.round((data.confidence || 0) * 100), // Convert to percentage
          severity: this.getSeverityFromConfidence(data.confidence || 0),
          description: this.getDiseaseDescription(data.class || 'Unknown'),
          treatment: this.getTreatmentAdvice(data.class || 'Unknown'),
          prevention: this.getPreventionAdvice(data.class || 'Unknown')
        }
      };
      
      console.log('Transformed response:', transformedResponse);
      return transformedResponse;
    } catch (error) {
      console.error('Error predicting plant disease:', error);
      throw new Error(error.message || 'Failed to analyze plant disease. Please try again.');
    }
  },

  /**
   * Get severity level based on confidence score
   */
  getSeverityFromConfidence(confidence) {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    if (confidence >= 0.4) return 'Low';
    return 'Very Low';
  },

  /**
   * Get disease description
   */
  getDiseaseDescription(className) {
    const descriptions = {
      'Apple__Apple_scab': 'Apple scab is a fungal disease that causes dark, scabby lesions on leaves and fruit.',
      'Apple_Black_rot': 'Black rot is a fungal disease that causes dark, sunken lesions on fruit.',
      'Apple_Cedar_apple_rust': 'Cedar apple rust causes orange, rust-colored spots on leaves.',
      'Apple_healthy': 'The apple plant appears to be healthy with no visible disease symptoms.',
      'Tomato_Bacterial_spot': 'Bacterial spot causes small, dark lesions on leaves and fruit.',
      'Tomato_Early_blight': 'Early blight causes concentric rings on leaves and stems.',
      'Tomato_Late_blight': 'Late blight causes water-soaked lesions that turn brown and papery.',
      'Tomato_healthy': 'The tomato plant appears to be healthy with no visible disease symptoms.',
      'Potato_Early_blight': 'Early blight causes dark lesions with concentric rings on potato leaves.',
      'Potato_Late_blight': 'Late blight causes rapid tissue death and can destroy entire plants.',
      'Potato_healthy': 'The potato plant appears to be healthy with no visible disease symptoms.'
    };
    return descriptions[className] || 'Plant disease analysis completed.';
  },

  /**
   * Get treatment advice
   */
  getTreatmentAdvice(className) {
    const treatments = {
      'Apple__Apple_scab': 'Apply fungicide sprays in early spring. Remove fallen leaves and fruit.',
      'Apple_Black_rot': 'Prune infected branches. Apply copper fungicide during dormant season.',
      'Apple_Cedar_apple_rust': 'Remove nearby cedar trees if possible. Apply fungicide in spring.',
      'Apple_healthy': 'Continue current care practices. Monitor for any changes.',
      'Tomato_Bacterial_spot': 'Remove infected plants. Apply copper-based fungicide.',
      'Tomato_Early_blight': 'Improve air circulation. Apply fungicide containing chlorothalonil.',
      'Tomato_Late_blight': 'Remove infected plants immediately. Apply fungicide preventively.',
      'Tomato_healthy': 'Continue current care practices. Monitor for any changes.',
      'Potato_Early_blight': 'Apply fungicide containing chlorothalonil. Improve air circulation.',
      'Potato_Late_blight': 'Remove infected plants immediately. Apply fungicide preventively.',
      'Potato_healthy': 'Continue current care practices. Monitor for any changes.'
    };
    return treatments[className] || 'Consult with a local agricultural expert for specific treatment recommendations.';
  },

  /**
   * Get prevention advice
   */
  getPreventionAdvice(className) {
    const preventions = {
      'Apple__Apple_scab': 'Plant resistant varieties. Ensure good air circulation. Water at soil level.',
      'Apple_Black_rot': 'Prune for good air circulation. Remove infected fruit promptly.',
      'Apple_Cedar_apple_rust': 'Plant resistant varieties. Remove nearby cedar trees.',
      'Apple_healthy': 'Maintain good cultural practices. Regular monitoring.',
      'Tomato_Bacterial_spot': 'Use disease-free seeds. Avoid overhead watering. Rotate crops.',
      'Tomato_Early_blight': 'Improve air circulation. Avoid overhead watering. Rotate crops.',
      'Tomato_Late_blight': 'Avoid overhead watering. Improve air circulation. Use resistant varieties.',
      'Tomato_healthy': 'Continue good cultural practices. Regular monitoring.',
      'Potato_Early_blight': 'Improve air circulation. Avoid overhead watering. Rotate crops.',
      'Potato_Late_blight': 'Avoid overhead watering. Improve drainage. Use certified seed.',
      'Potato_healthy': 'Continue good cultural practices. Regular monitoring.'
    };
    return preventions[className] || 'Maintain good cultural practices including proper watering, fertilization, and pest management.';
  },

  /**
   * Crop Recommendation
   * @param {Object} formData - The form data containing soil and environmental parameters
   * @returns {Promise<Object>} - The prediction result
   */
  async getCropRecommendation(formData) {
    try {
      console.log('Sending data to Python API:', formData);
      
      const response = await fetch(`${PYTHON_API_BASE_URL}/crop-recommendation/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Python API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Python API Response:', data);
      return data;
    } catch (error) {
      console.error('Error getting crop recommendation:', error);
      throw new Error(error.message || 'Failed to get crop recommendation. Please try again.');
    }
  },

  /**
   * Crop Yield Prediction
   * @param {Object} formData - The form data containing crop and environmental parameters
   * @returns {Promise<Object>} - The prediction result
   */
  async predictCropYield(formData) {
    try {
      console.log('Sending data to Python API:', formData);
      
      const response = await fetch(`${PYTHON_API_BASE_URL}/crop-yield/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Python API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Python API Response:', data);
      return data;
    } catch (error) {
      console.error('Error predicting crop yield:', error);
      throw new Error(error.message || 'Failed to predict crop yield. Please try again.');
    }
  },

  /**
   * Get available crops for yield prediction
   * @returns {Promise<Array>} - List of available crops
   */
  async getCrops() {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/crop-yield/crops`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.crops || [];
    } catch (error) {
      console.error('Error fetching crops:', error);
      return [];
    }
  },

  /**
   * Get available regions for yield prediction
   * @returns {Promise<Array>} - List of available regions
   */
  async getRegions() {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/crop-yield/regions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.regions || [];
    } catch (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
  },

  /**
   * Get available soil types for yield prediction
   * @returns {Promise<Array>} - List of available soil types
   */
  async getSoilTypes() {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/crop-yield/soil-types`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.soil_types || [];
    } catch (error) {
      console.error('Error fetching soil types:', error);
      return [];
    }
  },

  /**
   * Get available weather conditions for yield prediction
   * @returns {Promise<Array>} - List of available weather conditions
   */
  async getWeatherConditions() {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/crop-yield/weather-conditions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.weather_conditions || [];
    } catch (error) {
      console.error('Error fetching weather conditions:', error);
      return [];
    }
  },

  /**
   * Test the connection to the Python API
   * @returns {Promise<Object>} - API status information
   */
  async testConnection() {
    try {
      const response = await fetch(`${PYTHON_API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error('Error testing Python API connection:', error);
      return { success: false, error: error.message };
    }
  }
};

export default pythonApi;
