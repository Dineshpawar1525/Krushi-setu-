import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Phone, 
  Globe,
  ArrowLeft,
  BadgeDollarSign,
  Loader2,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardNav from '../components/DashboardNav';

const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  
  const [filters, setFilters] = useState({
    category: 'All',
    state: 'All',
    income: 'All',
    age: 'All',
    occupation: 'All',
    farmSize: 'All',
    crops: 'All',
    sortBy: 'priority'
  });

  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);

  // Fetch initial schemes data (database only)
  const fetchInitialSchemes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/schemes`
      );

      if (response.data.success) {
        setSchemes(response.data.data);
        setFilteredSchemes(response.data.data);
      } else {
        toast.error('Failed to fetch schemes');
      }
    } catch (error) {
      console.error('Error fetching initial schemes:', error);
      toast.error('Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch schemes data using Gemini AI (only when submit is clicked)
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      
      // Check if we should use Gemini (if any specific filters are set)
      const hasSpecificFilters = Object.entries(filters).some(([key, value]) => 
        key !== 'sortBy' && value !== 'All'
      );

      if (hasSpecificFilters) {
        // Use Gemini-powered endpoint for personalized schemes
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/schemes/ai`,
          filters
        );

        if (response.data.success) {
          setSchemes(response.data.data);
          setFilteredSchemes(response.data.data);
          if (response.data.source === 'ai') {
            toast.success('AI-powered personalized schemes loaded!');
          }
        } else {
          toast.error('Failed to fetch personalized schemes');
        }
      } else {
        // Use regular endpoint for general schemes
        const params = new URLSearchParams();
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (searchQuery) params.append('search', searchQuery);

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/schemes?${params}`
        );

        if (response.data.success) {
          setSchemes(response.data.data);
          setFilteredSchemes(response.data.data);
        } else {
          toast.error('Failed to fetch schemes');
        }
      }
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast.error('Failed to fetch schemes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and states
  const fetchFilterData = async () => {
    try {
      const [categoriesRes, statesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/schemes/categories`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/schemes/states`)
      ]);

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
      if (statesRes.data.success) {
        setStates(statesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter data:', error);
    }
  };

  useEffect(() => {
    fetchInitialSchemes();
    fetchFilterData();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const filtered = schemes.filter(scheme =>
        scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scheme.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredSchemes(filtered);
    } else {
      setFilteredSchemes(schemes);
    }
  }, [searchQuery, schemes]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: 'All',
      state: 'All',
      income: 'All',
      age: 'All',
      occupation: 'All',
      farmSize: 'All',
      crops: 'All',
      experience: 'All',
      sortBy: 'priority'
    });
    setSearchQuery('');
  };

  const formatAmount = (amount) => {
    if (!amount) return 'Contact for details';
    return amount;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Crop Insurance': 'bg-blue-100 text-blue-800',
      'Subsidy': 'bg-green-100 text-green-800',
      'Loan': 'bg-purple-100 text-purple-800',
      'Training': 'bg-orange-100 text-orange-800',
      'Technology': 'bg-cyan-100 text-cyan-800',
      'Infrastructure': 'bg-red-100 text-red-800',
      'Marketing': 'bg-yellow-100 text-yellow-800',
      'Research': 'bg-indigo-100 text-indigo-800',
      'General': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <DashboardNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Government Schemes
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover and apply for various government schemes designed to support farmers and agricultural development
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search schemes by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Quick Category Buttons */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['Crop Insurance', 'Subsidy', 'Loan', 'Training', 'Technology', 'Infrastructure', 'Marketing', 'Research'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category }));
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    filters.category === category
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <select
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All States</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Income Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Income Level</label>
                <select
                  value={filters.income}
                  onChange={(e) => handleFilterChange('income', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Income Levels</option>
                  <option value="Below 1 Lakh">Below ₹1 Lakh</option>
                  <option value="1-2 Lakhs">₹1-2 Lakhs</option>
                  <option value="2-5 Lakhs">₹2-5 Lakhs</option>
                  <option value="5-10 Lakhs">₹5-10 Lakhs</option>
                  <option value="Above 10 Lakhs">Above ₹10 Lakhs</option>
                </select>
              </div>

              {/* Age Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <select
                  value={filters.age}
                  onChange={(e) => handleFilterChange('age', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Ages</option>
                  <option value="18-25">18-25 years</option>
                  <option value="26-35">26-35 years</option>
                  <option value="36-45">36-45 years</option>
                  <option value="46-55">46-55 years</option>
                  <option value="56-65">56-65 years</option>
                  <option value="Above 65">Above 65 years</option>
                </select>
              </div>

              {/* Occupation Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                <select
                  value={filters.occupation}
                  onChange={(e) => handleFilterChange('occupation', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Occupations</option>
                  <option value="Farmer">Farmer</option>
                  <option value="Agricultural Worker">Agricultural Worker</option>
                  <option value="Landowner">Landowner</option>
                  <option value="Tenant Farmer">Tenant Farmer</option>
                  <option value="Sharecropper">Sharecropper</option>
                  <option value="Agricultural Entrepreneur">Agricultural Entrepreneur</option>
                  <option value="Rural Business">Rural Business</option>
                </select>
              </div>

              {/* Farm Size Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Farm Size</label>
                <select
                  value={filters.farmSize}
                  onChange={(e) => handleFilterChange('farmSize', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Farm Sizes</option>
                  <option value="Less than 1 acre">Less than 1 acre</option>
                  <option value="1-2 acres">1-2 acres</option>
                  <option value="2-5 acres">2-5 acres</option>
                  <option value="5-10 acres">5-10 acres</option>
                  <option value="Above 10 acres">Above 10 acres</option>
                </select>
              </div>

              {/* Crops Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Crops</label>
                <select
                  value={filters.crops}
                  onChange={(e) => handleFilterChange('crops', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Crops</option>
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Maize">Maize</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Sugarcane">Sugarcane</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Oilseeds">Oilseeds</option>
                  <option value="Spices">Spices</option>
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                <select
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="All">All Experience Levels</option>
                  <option value="Beginner (0-2 years)">Beginner (0-2 years)</option>
                  <option value="Intermediate (3-5 years)">Intermediate (3-5 years)</option>
                  <option value="Experienced (6-10 years)">Experienced (6-10 years)</option>
                  <option value="Expert (10+ years)">Expert (10+ years)</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="priority">Priority</option>
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>
          )}

          {/* Submit Button - Only show when filters are open */}
          {showFilters && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={fetchSchemes}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Search className="w-5 h-5" />
                Find My Schemes
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading schemes...</span>
          </div>
        )}

        {/* Schemes Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme, index) => (
              <div
                key={scheme._id || index}
                className={`bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  activeCard === index ? 'ring-2 ring-green-300' : ''
                }`}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(scheme.category)}`}>
                      {scheme.category}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {scheme.state}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {scheme.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {scheme.description}
                  </p>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Amount/Details */}
                  {scheme.amount && (
                    <div className="mb-4">
                      <div className="flex items-center text-green-600 font-semibold">
                        <BadgeDollarSign className="w-4 h-4 mr-1" />
                        {formatAmount(scheme.amount)}
                      </div>
                      {scheme.interestRate && (
                        <div className="text-sm text-gray-500 mt-1">
                          Interest Rate: {scheme.interestRate}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Eligibility */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Eligibility</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {scheme.eligibility}
                    </p>
                  </div>

                  {/* Benefits */}
                  {scheme.benefits && scheme.benefits.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Key Benefits</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {scheme.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            <span className="line-clamp-1">{benefit}</span>
                          </li>
                        ))}
                        {scheme.benefits.length > 3 && (
                          <li className="text-green-600 text-xs">
                            +{scheme.benefits.length - 3} more benefits
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Application Details */}
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      Last Apply Date: {scheme.lastApplyDate}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {scheme.applicationLink && (
                      <a
                        href={scheme.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Apply Now
                      </a>
                    )}
                    
                    <button className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </div>

                  {/* Contact Info */}
                  {scheme.contactInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {scheme.contactInfo.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {scheme.contactInfo.phone}
                          </div>
                        )}
                        {scheme.contactInfo.website && (
                          <div className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            Website
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredSchemes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No schemes found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentSchemes;
