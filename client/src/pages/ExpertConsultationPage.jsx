import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../Authorisation/axiosConfig';
import ExpertChat from '../components/ExpertChat';

const ExpertConsultationPage = () => {
  const [activeTab, setActiveTab] = useState('get-advice'); // 'get-advice' or 'register-expert'
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  
  // Expert Registration Form
  const [expertForm, setExpertForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    bio: '',
    location: {
      state: '',
      district: '',
      pincode: ''
    },
    qualifications: '',
    certifications: '',
    proofFile: null
  });

  // Filters for expert listing
  const [filters, setFilters] = useState({
    specialization: '',
    location: '',
    search: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12
  });

  useEffect(() => {
    if (activeTab === 'get-advice') {
      fetchExperts();
    }
  }, [filters, pagination.current, activeTab]);

  const fetchExperts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.limit,
        ...filters
      });
      
      const response = await axios.get(`/experts?${params}`);
      setExperts(response.data.experts);
      setFilteredExperts(response.data.experts);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching experts:', error);
      toast.error('Failed to load experts');
    } finally {
      setLoading(false);
    }
  };

  const handleExpertClick = (expert) => {
    setSelectedExpert(expert);
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
    setSelectedExpert(null);
  };

  const handleExpertRegistration = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', expertForm.name);
      formData.append('email', expertForm.email);
      formData.append('phone', expertForm.phone);
      formData.append('specialization', expertForm.specialization);
      formData.append('experience', expertForm.experience);
      formData.append('bio', expertForm.bio);
      formData.append('location', JSON.stringify(expertForm.location));
      formData.append('qualifications', expertForm.qualifications);
      formData.append('certifications', expertForm.certifications);
      
      if (expertForm.proofFile) {
        formData.append('proofFile', expertForm.proofFile);
      }

      const response = await axios.post('/experts/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Expert registration submitted successfully! We will review your application.');
      setExpertForm({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience: '',
        bio: '',
        location: {
          state: '',
          district: '',
          pincode: ''
        },
        qualifications: '',
        certifications: '',
        proofFile: null
      });
    } catch (error) {
      console.error('Error registering expert:', error);
      toast.error(error.response?.data?.message || 'Failed to register as expert');
    }
  };

  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setExpertForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setExpertForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    setExpertForm(prev => ({
      ...prev,
      proofFile: e.target.files[0]
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const specializations = [
    'Crop Science', 'Soil Science', 'Plant Pathology', 'Entomology',
    'Agricultural Economics', 'Livestock Management', 'Organic Farming',
    'Irrigation', 'Post-Harvest Technology', 'Agricultural Extension'
  ];

  if (loading && activeTab === 'get-advice') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading experts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Expert Consultation</h1>
          <p className="mt-2 text-gray-600">Connect with agricultural specialists or register as an expert</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('get-advice')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'get-advice'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Get Advice
              </button>
              <button
                onClick={() => setActiveTab('register-expert')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'register-expert'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Register as Expert
              </button>
            </nav>
          </div>
        </div>

        {/* Get Advice Tab */}
        {activeTab === 'get-advice' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Find Experts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search experts..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <select
                    value={filters.specialization}
                    onChange={(e) => handleFilterChange('specialization', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">All Specializations</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="State or District"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ specialization: '', location: '', search: '' })}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Experts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperts.map((expert) => (
                <div
                  key={expert._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleExpertClick(expert)}
                >
                  <div className="p-6">
                    {/* Expert Avatar */}
                    <div className="flex items-center mb-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        {expert.avatar ? (
                          <img
                            src={expert.avatar}
                            alt={expert.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-green-600">
                            {expert.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{expert.name}</h3>
                        <p className="text-sm text-gray-600">{expert.specialization}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(expert.rating || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {expert.rating || 0} ({expert.totalReviews || 0} reviews)
                      </span>
                    </div>

                    {/* Experience */}
                    <p className="text-sm text-gray-600 mb-2">
                      {expert.experience} years experience
                    </p>

                    {/* Location */}
                    <p className="text-sm text-gray-600 mb-4">
                      {expert.location?.state}, {expert.location?.district}
                    </p>

                    {/* Bio */}
                    <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                      {expert.bio}
                    </p>

                    {/* Chat Button */}
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      Chat with Expert
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                    disabled={pagination.current === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPagination(prev => ({ ...prev, current: i + 1 }))}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pagination.current === i + 1
                          ? 'bg-green-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                    disabled={pagination.current === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Register as Expert Tab */}
        {activeTab === 'register-expert' && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Register as Expert</h2>
            <p className="text-gray-600 mb-8">
              Join our platform as an agricultural expert and help farmers with your knowledge and experience.
            </p>

            <form onSubmit={handleExpertRegistration} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={expertForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={expertForm.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={expertForm.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization *
                  </label>
                  <select
                    value={expertForm.specialization}
                    onChange={(e) => handleFormChange('specialization', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    value={expertForm.experience}
                    onChange={(e) => handleFormChange('experience', e.target.value)}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={expertForm.location.state}
                    onChange={(e) => handleFormChange('location.state', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    value={expertForm.location.district}
                    onChange={(e) => handleFormChange('location.district', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    value={expertForm.location.pincode}
                    onChange={(e) => handleFormChange('location.pincode', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio *
                </label>
                <textarea
                  value={expertForm.bio}
                  onChange={(e) => handleFormChange('bio', e.target.value)}
                  required
                  rows={4}
                  placeholder="Tell us about your expertise and experience..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Educational Qualifications
                </label>
                <textarea
                  value={expertForm.qualifications}
                  onChange={(e) => handleFormChange('qualifications', e.target.value)}
                  rows={3}
                  placeholder="e.g., B.Sc Agriculture, M.Sc Plant Pathology, Ph.D. in Crop Science..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Certifications
                </label>
                <textarea
                  value={expertForm.certifications}
                  onChange={(e) => handleFormChange('certifications', e.target.value)}
                  rows={3}
                  placeholder="e.g., Certified Organic Farming Consultant, ISO 9001, etc..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Proof File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proof of Expertise (Optional)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload certificates, degrees, or any proof of your expertise (PDF, DOC, or image files)
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {showChatModal && selectedExpert && (
        <ExpertChat 
          expert={selectedExpert} 
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default ExpertConsultationPage;