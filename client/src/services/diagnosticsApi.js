import { pythonApi } from './pythonApi';

export const diagnosticsApi = {
  /**
   * Get crop recommendation based on soil and environmental data
   * @param {Object} formData - The form data containing soil and environmental parameters
   * @returns {Promise<Object>} - The prediction result
   */
  async getCropRecommendation(formData) {
    return await pythonApi.getCropRecommendation(formData);
  },

  /**
   * Test the connection to the diagnostics API
   * @returns {Promise<Object>} - API status information
   */
  async testConnection() {
    return await pythonApi.testConnection();
  }
};

export default diagnosticsApi;
