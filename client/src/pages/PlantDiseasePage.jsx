import React from 'react';
import PlantDiseaseDetector from '../components/PlantDiseaseDetector';
import { Leaf, Shield, Droplets, Sun } from 'lucide-react';

const PlantDiseasePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Leaf className="w-10 h-10 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Plant Disease Detection</h1>
                <p className="text-gray-600">AI-powered plant health analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Powered by</p>
                <p className="font-semibold text-green-600">KrushiSetu CNN Model</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PlantDiseaseDetector />
      </div>

      {/* Features Section */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Plant Disease Detector?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Detection</h3>
              <p className="text-gray-600">
                Advanced CNN model trained on thousands of plant disease images for accurate diagnosis
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-gray-600">
                Get immediate diagnosis and treatment recommendations within seconds
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Recommendations</h3>
              <p className="text-gray-600">
                Detailed treatment plans and prevention strategies from agricultural experts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2024 KrushiSetu - Advanced Plant Disease Detection System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDiseasePage;
