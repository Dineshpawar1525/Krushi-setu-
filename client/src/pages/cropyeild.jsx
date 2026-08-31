import React, { useState } from 'react';
import { Shield, Leaf, Thermometer, Droplets, Cloud, Sun, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';
import { diagnosticsApi } from '../services/diagnosticsApi';

const cropyeild = () => {
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    temperature: '',
    humidity: '',
    ph: '',
    rainfall: '',
    ph_category: 'Neutral',
    rainfall_level: 'Medium'
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const phOptions = ['Neutral', 'Alkaline', 'Acidic'];
  const rainfallOptions = ['Very High', 'High', 'Medium', 'Low'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await diagnosticsApi.getCropRecommendation(formData);
      setPrediction(result.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      N: '',
      P: '',
      K: '',
      temperature: '',
      humidity: '',
      ph: '',
      rainfall: '',
      ph_category: 'Neutral',
      rainfall_level: 'Medium'
    });
    setPrediction(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <DashboardNav />
      
      <div className="pt-16 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-green-600 mr-3" />
              <h1 className="text-4xl font-bold text-green-800">Crop Prediction</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get AI-powered crop recommendations based on soil conditions, weather data, and environmental factors
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Leaf className="h-6 w-6 text-green-600 mr-2" />
                Soil & Environmental Data
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* NPK Values */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nitrogen (N)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="N"
                      value={formData.N}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter N value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phosphorus (P)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="P"
                      value={formData.P}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter P value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Potassium (K)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="K"
                      value={formData.K}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter K value"
                    />
                  </div>
                </div>

                {/* Weather Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Thermometer className="h-4 w-4 text-orange-500 mr-1" />
                      Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="temperature"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter temperature"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Droplets className="h-4 w-4 text-blue-500 mr-1" />
                      Humidity (%)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="humidity"
                      value={formData.humidity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter humidity"
                    />
                  </div>
                </div>

                {/* Soil Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      pH Level
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="ph"
                      value={formData.ph}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter pH value"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Cloud className="h-4 w-4 text-gray-500 mr-1" />
                      Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="rainfall"
                      value={formData.rainfall}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter rainfall"
                    />
                  </div>
                </div>

                {/* Categorical Data */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      pH Category
                    </label>
                    <select
                      name="ph_category"
                      value={formData.ph_category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {phOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rainfall Level
                    </label>
                    <select
                      name="rainfall_level"
                      value={formData.rainfall_level}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {rainfallOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Get Recommendation
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <Sun className="h-6 w-6 text-yellow-500 mr-2" />
                AI Recommendation
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700 font-medium">Error</span>
                  </div>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              )}

              {prediction && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    <span className="text-green-700 font-semibold text-lg">Recommended Crop</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <h3 className="text-2xl font-bold text-green-800 capitalize text-center">
                      {prediction}
                    </h3>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>This recommendation is based on your soil conditions, weather data, and environmental factors.</p>
                  </div>
                </div>
              )}

              {!prediction && !error && (
                <div className="text-center py-12">
                  <Leaf className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Enter your soil and environmental data to get AI-powered crop recommendations</p>
                </div>
              )}
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Data Input</h3>
                <p className="text-gray-600 text-sm">Enter your soil NPK values, weather conditions, and environmental factors</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">AI Analysis</h3>
                <p className="text-gray-600 text-sm">Our machine learning model analyzes the data to find the best crop match</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Sun className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Recommendation</h3>
                <p className="text-gray-600 text-sm">Get personalized crop recommendations optimized for your conditions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default cropyeild;
