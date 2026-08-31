import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Shield, 
  Settings,
  LogOut,
  ArrowLeft,
  BadgeDollarSign,
  Loader2
} from 'lucide-react';
import AuthContext from '../Authorisation/AuthProvider';
import DashboardNav from '../components/DashboardNav';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getAuthData } from '../utils/authUtils';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    farmSize: '',
    crops: '',
    experience: '',
    bio: ''
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const authData = getAuthData();
      const token = authData.token;
      
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const userData = response.data.user;
        setProfileData(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          farmSize: userData.farmSize || '',
          crops: userData.crops || '',
          experience: userData.experience || '',
          bio: userData.bio || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
    } else {
        toast.error('Failed to load profile data');
        // Set fallback data from context
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          location: user?.location || '',
          farmSize: user?.farmSize || '',
          crops: user?.crops || '',
          experience: user?.experience || '',
          bio: user?.bio || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const authData = getAuthData();
      const token = authData.token;
      
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/user/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setProfileData(response.data.user);
        toast.success('Profile updated successfully! 🎉');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile data:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save profile data');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profileData?.name || user?.name || '',
      email: profileData?.email || user?.email || '',
      phone: profileData?.phone || user?.phone || '',
      location: profileData?.location || user?.location || '',
      farmSize: profileData?.farmSize || user?.farmSize || '',
      crops: profileData?.crops || user?.crops || '',
      experience: profileData?.experience || user?.experience || '',
      bio: profileData?.bio || user?.bio || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
  };

  // Show loading spinner while fetching data
  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <DashboardNav />
      
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-white font-bold text-4xl">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b-2 border-green-500 text-3xl font-bold text-gray-800 focus:outline-none"
                  />
                ) : (
                  formData.name || 'User Name'
                )}
              </h1>
              <p className="text-green-600 text-lg mb-4">
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b-2 border-green-500 text-green-600 text-lg focus:outline-none"
                  />
                ) : (
                  formData.email || 'user@example.com'
                )}
              </p>
              <p className="text-gray-600 mb-6">
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-transparent border-2 border-green-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:border-green-500 resize-none"
                    rows="3"
                  />
                ) : (
                  formData.bio || 'Passionate farmer dedicated to sustainable agriculture and innovation.'
                )}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {isEditing ? (
                  <>
              <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                  </>
                ) : (
                  <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Changes
                  </>
                )}
              </button>
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Edit3 className="w-5 h-5 mr-2" />
                    Edit Profile
                  </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="w-6 h-6 mr-3 text-green-600" />
              Personal Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border-2 border-green-200 rounded-lg p-2 focus:outline-none focus:border-green-500"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-600">{formData.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full border-2 border-green-200 rounded-lg p-2 focus:outline-none focus:border-green-500"
                      placeholder="Enter your location"
                    />
                  ) : (
                    <p className="text-gray-600">{formData.location || 'Not provided'}</p>
                  )}
                      </div>
                    </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Farming Experience</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      className="w-full border-2 border-green-200 rounded-lg p-2 focus:outline-none focus:border-green-500"
                      placeholder="e.g., 5 years"
                    />
                  ) : (
                    <p className="text-gray-600">{formData.experience || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
                  </div>
                  
          {/* Farm Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-green-600" />
              Farm Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleInputChange}
                    className="w-full border-2 border-green-200 rounded-lg p-2 focus:outline-none focus:border-green-500"
                    placeholder="e.g., 10 acres"
                  />
                ) : (
                  <p className="text-gray-600">{formData.farmSize || 'Not provided'}</p>
                )}
                  </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Crops</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="crops"
                    value={formData.crops}
                    onChange={handleInputChange}
                    className="w-full border-2 border-green-200 rounded-lg p-2 focus:outline-none focus:border-green-500"
                    placeholder="e.g., Wheat, Rice, Corn"
                  />
                ) : (
                  <p className="text-gray-600">{formData.crops || 'Not provided'}</p>
                )}
                    </div>
                  </div>
                </div>
              </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-3 text-green-600" />
            Account Settings
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Security</h3>
              <button className="w-full text-left p-4 border-2 border-green-200 rounded-lg hover:border-green-500 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">Change Password</p>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                  </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Account Actions</h3>
              <button 
                onClick={handleLogout}
                className="w-full text-left p-4 border-2 border-red-200 rounded-lg hover:border-red-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-800">Sign Out</p>
                    <p className="text-sm text-gray-600">Sign out of your account</p>
                  </div>
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                  </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
