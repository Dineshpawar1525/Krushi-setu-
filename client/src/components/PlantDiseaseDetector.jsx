import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download,
  RefreshCw,
  Info,
  Shield,
  Droplets,
  Sun
} from 'lucide-react';
import { pythonApi } from '../services/pythonApi';

const PlantDiseaseDetector = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleCameraCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
        setShowCamera(false);
      }, 'image/jpeg', 0.8);
    }
  };

  const analyzePlant = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      console.log('🔍 Analyzing plant image:', selectedFile.name, selectedFile.size, 'bytes');
      
      const formData = new FormData();
      formData.append('image', selectedFile);

      console.log('📤 Sending request to Python server...');
      const response = await pythonApi.predictPlantDisease(selectedFile);

      console.log('📥 Received response from Python server:', response);
      setResult(response);
    } catch (err) {
      console.error('❌ Plant disease analysis error:', err);
      setError(err.message || 'Failed to analyze plant disease');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'none':
        return 'text-green-600 bg-green-100';
      case 'low':
        return 'text-yellow-600 bg-yellow-100';
      case 'medium':
        return 'text-orange-600 bg-orange-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'very high':
        return 'text-red-800 bg-red-200';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'none':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-yellow-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'high':
      case 'very high':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Leaf className="w-12 h-12 text-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">Plant Disease Detector</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Upload a photo of your plant to get instant disease diagnosis and treatment recommendations
        </p>
      </div>

      {/* Upload Section */}
      <div className="mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
          {!preview ? (
            <div>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Upload Plant Image</h3>
              <p className="text-gray-500 mb-4">Choose an image file or take a photo</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose File
                </button>
                <button
                  onClick={() => setShowCamera(!showCamera)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Take Photo
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div>
              <img
                src={preview}
                alt="Plant preview"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
              />
              <div className="mt-4 flex justify-center space-x-4">
                <button
                  onClick={analyzePlant}
                  disabled={isAnalyzing}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Leaf className="w-5 h-5 mr-2" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Plant'}
                </button>
                <button
                  onClick={resetAnalysis}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Camera Section */}
        {showCamera && (
          <div className="mt-6 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Take Photo</h3>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full max-w-md mx-auto rounded-lg"
                style={{ display: 'block' }}
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={handleCameraCapture}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture
                </button>
                <button
                  onClick={() => setShowCamera(false)}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Disease Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.prediction?.severity)}`}>
                {getSeverityIcon(result.prediction?.severity)}
                <span className="ml-2">{result.prediction?.severity || 'Unknown'} Severity</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Disease Detected</h3>
                <p className="text-2xl font-bold text-gray-800 mb-2">{result.prediction?.disease}</p>
                <div className="flex items-center mb-4">
                  <span className="text-sm text-gray-600">Confidence: </span>
                  <div className="ml-2 bg-gray-200 rounded-full h-2 w-32">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${result.prediction?.confidence || 0}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium">{result.prediction?.confidence || 0}%</span>
                </div>
                <p className="text-gray-600">{result.prediction?.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Treatment & Prevention</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">Treatment:</p>
                      <p className="text-gray-600 text-sm">{result.prediction?.treatment}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Droplets className="w-5 h-5 text-green-600 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-700">Prevention:</p>
                      <p className="text-gray-600 text-sm">{result.prediction?.prevention}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Print Report
            </button>
            <button
              onClick={resetAnalysis}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Analyze Another Plant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDiseaseDetector;
