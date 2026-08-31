import React from 'react';

const VisualTest = () => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        <span className="font-semibold">Components Loaded!</span>
      </div>
    </div>
  );
};

export default VisualTest;
