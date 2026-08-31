import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, Calendar, Droplets, Thermometer, Shield, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';
import { pythonApi } from '../services/pythonApi';

const CropYieldPrediction = () => {
  const [formData, setFormData] = useState({
    region: '',
    crop: '',
    soil_type: '',
    weather_condition: '',
    temperature: '',
    humidity: '',
    rainfall: ''
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [crops, setCrops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [soilTypes, setSoilTypes] = useState([]);
  const [weatherConditions, setWeatherConditions] = useState([]);

  // Fetch available crops and areas on component mount
  useEffect(() => {
    // Add cache-busting parameter to force fresh requests
    fetchCropsAndAreas();
  }, []);

  const fetchCropsAndAreas = async () => {
    try {
      const [crops, regions, soilTypes, weatherConditions] = await Promise.all([
        pythonApi.getCrops(),
        pythonApi.getRegions(),
        pythonApi.getSoilTypes(),
        pythonApi.getWeatherConditions()
      ]);
      
      setCrops(crops);
      setRegions(regions);
      setSoilTypes(soilTypes);
      setWeatherConditions(weatherConditions);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

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
      const data = await pythonApi.predictCropYield(formData);
      setPrediction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      region: '',
      crop: '',
      soil_type: '',
      weather_condition: '',
      temperature: '',
      humidity: '',
      rainfall: ''
    });
    setPrediction(null);
    setError(null);
  };

  const getYieldCategory = (yield_value) => {
    if (yield_value < 1000) return { category: 'Low', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (yield_value < 3000) return { category: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (yield_value < 5000) return { category: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    return { category: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <DashboardNav />
      
      <div className="pt-16 px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-green-600 mr-3" />
              <h1 className="text-4xl font-bold text-green-800">Crop Yield Prediction</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Predict crop yield based on location, weather conditions, and farming practices using advanced AI technology
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                Enter Farm Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Region and Crop */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 text-green-500 mr-1" />
                      Region
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Region</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Crop Type
                    </label>
                    <select
                      name="crop"
                      value={formData.crop}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Crop</option>
                      {crops.map(crop => (
                        <option key={crop} value={crop}>{crop}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Soil Type and Weather Condition */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Soil Type
                    </label>
                    <select
                      name="soil_type"
                      value={formData.soil_type}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Soil Type</option>
                      {soilTypes.map(soilType => (
                        <option key={soilType} value={soilType}>{soilType}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weather Condition
                    </label>
                    <select
                      name="weather_condition"
                      value={formData.weather_condition}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Weather</option>
                      {weatherConditions.map(weather => (
                        <option key={weather} value={weather}>{weather}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Weather Data */}
                <div className="grid grid-cols-3 gap-4">
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
                      min="-50"
                      max="60"
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
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter humidity"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Droplets className="h-4 w-4 text-blue-500 mr-1" />
                      Rainfall (mm)
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="rainfall"
                      value={formData.rainfall}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="5000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter rainfall"
                    />
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
                        Predicting...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Predict Yield
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
                <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                Yield Prediction
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
                <div className="space-y-6">
                  {/* Main Prediction */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                      <span className="text-green-700 font-semibold text-lg">Predicted Yield</span>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-800 mb-2">
                        {prediction.predicted_yield.toLocaleString()}
                      </div>
                      <div className="text-lg text-gray-600 mb-4">{prediction.unit}</div>
                      {(() => {
                        const category = getYieldCategory(prediction.predicted_yield);
                        return (
                          <div className={`inline-block px-4 py-2 rounded-full ${category.bgColor} ${category.color} font-semibold`}>
                            {category.category} Yield
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Prediction Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Prediction Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Crop:</span>
                        <span className="font-medium">{prediction.crop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Region:</span>
                        <span className="font-medium">{prediction.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Soil Type:</span>
                        <span className="font-medium">{prediction.soil_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weather:</span>
                        <span className="font-medium">{prediction.weather_condition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span className="font-medium text-green-600">{prediction.confidence}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!prediction && !error && (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Enter your farm details to get AI-powered yield predictions</p>
                </div>
              )}
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">How Yield Prediction Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Farm Data Input</h3>
                <p className="text-gray-600 text-sm">Enter your location, crop type, weather conditions, and farming practices</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">AI Analysis</h3>
                <p className="text-gray-600 text-sm">Our machine learning model analyzes historical data to predict crop yield</p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Yield Forecast</h3>
                <p className="text-gray-600 text-sm">Get accurate yield predictions to optimize your farming decisions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropYieldPrediction;
