import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

const FeaturePlaceholder = ({ featureName, description }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <DashboardNav />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-16 pt-24">
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{featureName}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Coming Soon</h2>
            <p className="text-gray-600">
              This feature is currently under development. We're working hard to bring you the best agricultural solutions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg border-2 border-green-600 hover:bg-green-50 transition-colors duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Home
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Analytics</h3>
            <p className="text-gray-600 text-sm">Advanced data analysis and insights for better farming decisions.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600 text-sm">Live tracking and monitoring of your agricultural operations.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Expert Support</h3>
            <p className="text-gray-600 text-sm">24/7 access to agricultural experts and specialists.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturePlaceholder;
