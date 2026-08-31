import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Filter, 
  Download,
  RefreshCw,
  Info
} from 'lucide-react';

const FarmerAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    state: [],
    district: [],
    crop: [],
    season: [],
    year_start: null,
    year_end: null
  });
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    districts: [],
    crops: [],
    seasons: [],
    year_min: 2000,
    year_max: 2023
  });
  const [filteredOptions, setFilteredOptions] = useState({
    districts: [],
    crops: [],
    seasons: []
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
    loadAnalyticsSummary();
    // Load analytics data with default filters on mount
    loadAnalyticsData();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/farmer-analytics/filters');
      const data = await response.json();
      
      if (data.success) {
        setFilterOptions(data.data);
        // Initialize filtered options with all options
        setFilteredOptions({
          districts: data.data.districts,
          crops: data.data.crops,
          seasons: data.data.seasons
        });
        // Set default filters
        setFilters(prev => ({
          ...prev,
          year_start: data.data.year_min,
          year_end: data.data.year_max
        }));
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
      setError('Failed to load filter options');
    }
  };

  const loadAnalyticsSummary = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/farmer-analytics/summary');
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.data);
        console.log('Summary data loaded:', data.data);
      } else {
        console.error('Failed to load summary:', data.error);
      }
    } catch (error) {
      console.error('Error loading analytics summary:', error);
      setError('Failed to load analytics summary');
    }
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.state.length > 0) queryParams.append('state', filters.state.join(','));
      if (filters.district.length > 0) queryParams.append('district', filters.district.join(','));
      if (filters.crop.length > 0) queryParams.append('crop', filters.crop.join(','));
      if (filters.season.length > 0) queryParams.append('season', filters.season.join(','));
      if (filters.year_start) queryParams.append('year_start', filters.year_start);
      if (filters.year_end) queryParams.append('year_end', filters.year_end);

      const url = `http://localhost:8000/api/farmer-analytics/data?${queryParams}`;
      console.log('Loading analytics data from:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Analytics data response:', data);
      
      if (data.success) {
        setAnalyticsData(data.data);
        console.log('Analytics data loaded successfully:', data.data);
      } else {
        console.error('Failed to load analytics data:', data.error);
        setError(data.error || 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleMultiSelectChange = (filterType, value) => {
    const newValue = Array.isArray(value) ? value : [value];
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [filterType]: newValue
      };
      
      // Handle cascading filters
      if (filterType === 'state') {
        // When state changes, reset district, crop, and season selections
        newFilters.district = [];
        newFilters.crop = [];
        newFilters.season = [];
        updateFilteredOptions(newFilters);
      } else if (filterType === 'district') {
        // When district changes, reset crop and season selections
        newFilters.crop = [];
        newFilters.season = [];
        updateFilteredOptions(newFilters);
      } else if (filterType === 'crop') {
        // When crop changes, reset season selection
        newFilters.season = [];
        updateFilteredOptions(newFilters);
      }
      
      return newFilters;
    });
  };

  const updateFilteredOptions = async (currentFilters) => {
    try {
      // Get filtered districts based on selected states
      if (currentFilters.state.length > 0) {
        const response = await fetch(`http://localhost:8000/api/farmer-analytics/filtered-districts?states=${currentFilters.state.join(',')}`);
        const data = await response.json();
        if (data.success) {
          setFilteredOptions(prev => ({
            ...prev,
            districts: data.data.districts || []
          }));
        }
      } else {
        setFilteredOptions(prev => ({
          ...prev,
          districts: filterOptions.districts
        }));
      }

      // Get filtered crops based on selected states and districts
      if (currentFilters.state.length > 0 || currentFilters.district.length > 0) {
        const params = new URLSearchParams();
        if (currentFilters.state.length > 0) params.append('states', currentFilters.state.join(','));
        if (currentFilters.district.length > 0) params.append('districts', currentFilters.district.join(','));
        
        const response = await fetch(`http://localhost:8000/api/farmer-analytics/filtered-crops?${params}`);
        const data = await response.json();
        if (data.success) {
          setFilteredOptions(prev => ({
            ...prev,
            crops: data.data.crops || []
          }));
        }
      } else {
        setFilteredOptions(prev => ({
          ...prev,
          crops: filterOptions.crops
        }));
      }

      // Get filtered seasons based on selected crops
      if (currentFilters.crop.length > 0) {
        const response = await fetch(`http://localhost:8000/api/farmer-analytics/filtered-seasons?crops=${currentFilters.crop.join(',')}`);
        const data = await response.json();
        if (data.success) {
          setFilteredOptions(prev => ({
            ...prev,
            seasons: data.data.seasons || []
          }));
        }
      } else {
        setFilteredOptions(prev => ({
          ...prev,
          seasons: filterOptions.seasons
        }));
      }
    } catch (error) {
      console.error('Error updating filtered options:', error);
    }
  };

  const resetFilters = () => {
    setFilters({
      state: [],
      district: [],
      crop: [],
      season: [],
      year_start: filterOptions.year_min,
      year_end: filterOptions.year_max
    });
    setFilteredOptions({
      districts: filterOptions.districts,
      crops: filterOptions.crops,
      seasons: filterOptions.seasons
    });
    setAnalyticsData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-sm p-8 mb-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
                Farmer Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Comprehensive agricultural data analysis and insights for smart farming decisions
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Real-time Data Processing
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Interactive Visualizations
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Advanced Analytics
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Records</div>
                <div className="text-2xl font-bold text-green-600">
                  {summary?.total_records?.toLocaleString() || '345,336'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  onClick={loadAnalyticsData}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <BarChart3 className="h-4 w-4" />
                  )}
                  {loading ? 'Analyzing...' : 'Generate Analytics'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        {summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Records</p>
                  <p className="text-3xl font-bold text-blue-900">{summary.total_records?.toLocaleString() || '0'}</p>
                  <p className="text-xs text-blue-600 mt-1">Agricultural data points</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-blue-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">States Covered</p>
                  <p className="text-3xl font-bold text-green-900">{summary.total_states || '0'}</p>
                  <p className="text-xs text-green-600 mt-1">Indian states & territories</p>
                </div>
                <div className="p-3 bg-green-200 rounded-xl">
                  <MapPin className="h-8 w-8 text-green-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Crops Analyzed</p>
                  <p className="text-3xl font-bold text-purple-900">{summary.total_crops || '0'}</p>
                  <p className="text-xs text-purple-600 mt-1">Different crop types</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Year Range</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {summary.year_range?.[0] || '1997'} - {summary.year_range?.[1] || '2020'}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Data coverage period</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-xl">
                  <Calendar className="h-8 w-8 text-orange-700" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Records</p>
                  <p className="text-3xl font-bold text-blue-900">Loading...</p>
                  <p className="text-xs text-blue-600 mt-1">Agricultural data points</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-blue-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm p-6 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">States Covered</p>
                  <p className="text-3xl font-bold text-green-900">Loading...</p>
                  <p className="text-xs text-green-600 mt-1">Indian states & territories</p>
                </div>
                <div className="p-3 bg-green-200 rounded-xl">
                  <MapPin className="h-8 w-8 text-green-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm p-6 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Crops Analyzed</p>
                  <p className="text-3xl font-bold text-purple-900">Loading...</p>
                  <p className="text-xs text-purple-600 mt-1">Different crop types</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Year Range</p>
                  <p className="text-3xl font-bold text-orange-900">Loading...</p>
                  <p className="text-xs text-orange-600 mt-1">Data coverage period</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-xl">
                  <Calendar className="h-8 w-8 text-orange-700" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              Filter Options
            </h2>
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={loadAnalyticsData}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                {loading ? 'Analyzing...' : 'Generate Analytics'}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* State Filter */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 inline mr-1" />
                State
                {filters.state.length > 0 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {filters.state.length} selected
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  multiple
                  value={filters.state}
                  onChange={(e) => handleMultiSelectChange('state', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32 text-sm"
                  size="4"
                >
                  {filterOptions.states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

             {/* District Filter */}
             <div className="space-y-2">
               <label className="block text-sm font-medium text-gray-700">
                 <MapPin className="h-4 w-4 inline mr-1" />
                 District
                 {filters.district.length > 0 && (
                   <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                     {filters.district.length} selected
                   </span>
                 )}
                 {filters.state.length > 0 && (
                   <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                     Filtered by {filters.state.length} state(s)
                   </span>
                 )}
               </label>
               <div className="relative">
                 <select
                   multiple
                   value={filters.district}
                   onChange={(e) => handleMultiSelectChange('district', Array.from(e.target.selectedOptions, option => option.value))}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32 text-sm"
                   size="4"
                   disabled={filters.state.length === 0}
                 >
                   {filteredOptions.districts.map(district => (
                     <option key={district} value={district}>{district}</option>
                   ))}
                 </select>
                 {filters.state.length === 0 && (
                   <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                     <span className="text-sm text-gray-500">Select state first</span>
                   </div>
                 )}
               </div>
             </div>

             {/* Crop Filter */}
             <div className="space-y-2">
               <label className="block text-sm font-medium text-gray-700">
                 <TrendingUp className="h-4 w-4 inline mr-1" />
                 Crop
                 {filters.crop.length > 0 && (
                   <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                     {filters.crop.length} selected
                   </span>
                 )}
                 {filters.district.length > 0 && (
                   <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                     Filtered by {filters.district.length} district(s)
                   </span>
                 )}
                 {filters.state.length > 0 && filters.district.length === 0 && (
                   <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                     Filtered by {filters.state.length} state(s)
                   </span>
                 )}
               </label>
               <div className="relative">
                 <select
                   multiple
                   value={filters.crop}
                   onChange={(e) => handleMultiSelectChange('crop', Array.from(e.target.selectedOptions, option => option.value))}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32 text-sm"
                   size="4"
                 >
                   {filteredOptions.crops.map(crop => (
                     <option key={crop} value={crop}>{crop}</option>
                   ))}
                 </select>
                 {filters.state.length === 0 && filters.district.length === 0 && (
                   <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                     <span className="text-sm text-gray-500">Select state or district first</span>
                   </div>
                 )}
               </div>
             </div>

             {/* Season Filter */}
             <div className="space-y-2">
               <label className="block text-sm font-medium text-gray-700">
                 <Calendar className="h-4 w-4 inline mr-1" />
                 Season
                 {filters.season.length > 0 && (
                   <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                     {filters.season.length} selected
                   </span>
                 )}
                 {filters.crop.length > 0 && (
                   <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                     Filtered by {filters.crop.length} crop(s)
                   </span>
                 )}
               </label>
               <div className="relative">
                 <select
                   multiple
                   value={filters.season}
                   onChange={(e) => handleMultiSelectChange('season', Array.from(e.target.selectedOptions, option => option.value))}
                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 h-32 text-sm"
                   size="4"
                 >
                   {filteredOptions.seasons.map(season => (
                     <option key={season} value={season}>{season.trim()}</option>
                   ))}
                 </select>
                 {filters.crop.length === 0 && (
                   <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                     <span className="text-sm text-gray-500">Select crop first</span>
                   </div>
                 )}
               </div>
             </div>

            {/* Year Range */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 inline mr-1" />
                Year Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">From</label>
                  <input
                    type="number"
                    value={filters.year_start || ''}
                    onChange={(e) => handleFilterChange('year_start', parseInt(e.target.value))}
                    min={filterOptions.year_min}
                    max={filterOptions.year_max}
                    placeholder={filterOptions.year_min}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To</label>
                  <input
                    type="number"
                    value={filters.year_end || ''}
                    onChange={(e) => handleFilterChange('year_end', parseInt(e.target.value))}
                    min={filterOptions.year_min}
                    max={filterOptions.year_max}
                    placeholder={filterOptions.year_max}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Available range: {filterOptions.year_min} - {filterOptions.year_max}
              </div>
            </div>

            {/* Quick Filter Presets */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <Filter className="h-4 w-4 inline mr-1" />
                Quick Filters
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      crop: ['Rice'],
                      year_start: 2015,
                      year_end: 2020
                    }));
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Rice Production (2015-2020)
                </button>
                <button
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      crop: ['Wheat'],
                      year_start: 2015,
                      year_end: 2020
                    }));
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Wheat Production (2015-2020)
                </button>
                <button
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      season: ['Kharif'],
                      year_start: 2018,
                      year_end: 2020
                    }));
                  }}
                  className="w-full text-left px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  Kharif Season (2018-2020)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Analytics Results */}
        {analyticsData && (
          <div className="space-y-6">
            {/* Analysis Summary */}
            {analyticsData && analyticsData.summary && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-sm p-6 border border-green-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Analysis Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-gray-600">Records Analyzed</div>
                    <div className="text-2xl font-bold text-green-600">{analyticsData.summary.total_records?.toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-gray-600">States Covered</div>
                    <div className="text-2xl font-bold text-blue-600">{analyticsData.summary.states_covered}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="text-sm text-gray-600">Districts Covered</div>
                    <div className="text-2xl font-bold text-purple-600">{analyticsData.summary.districts_covered}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="text-sm text-gray-600">Crops Analyzed</div>
                    <div className="text-2xl font-bold text-orange-600">{analyticsData.summary.crops_analyzed}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Interactive Visualizations
              </h3>
              
              {analyticsData.charts && (
                <div className="space-y-8">
                  <div className="text-center py-12 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-green-200">
                    <BarChart3 className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Charts Ready for Display</h4>
                    <p className="text-gray-600 mb-4">
                      {Object.keys(analyticsData.charts).length} interactive charts have been generated
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {Object.keys(analyticsData.charts).map((chart, index) => (
                        <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {chart.replace('_', ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                      Chart integration with Plotly.js will be implemented for interactive visualizations
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced No Data Message */}
        {!analyticsData && !loading && !error && (
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl shadow-sm p-12 text-center border border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Analyze</h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select your filters and generate comprehensive agricultural analytics insights
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Filter by state, district, crop, or season</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Choose your analysis time period</span>
                </div>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Generate interactive visualizations</span>
                </div>
              </div>
              <button
                onClick={loadAnalyticsData}
                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-lg shadow-md"
              >
                Start Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerAnalytics;
