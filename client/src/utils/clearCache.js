/**
 * Utility to clear browser cache and force reload
 * This helps ensure the frontend uses the updated API endpoints
 */

export const clearCacheAndReload = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Force reload with cache bypass
  window.location.reload(true);
};

export const testPythonServerConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/');
    const data = await response.json();
    console.log('✅ Python server is accessible:', data);
    return true;
  } catch (error) {
    console.error('❌ Python server not accessible:', error);
    return false;
  }
};

export const testAllEndpoints = async () => {
  const endpoints = [
    'http://localhost:5000/api/crop-yield/crops',
    'http://localhost:5000/api/crop-yield/regions',
    'http://localhost:5000/api/crop-yield/soil-types',
    'http://localhost:5000/api/crop-yield/weather-conditions'
  ];
  
  const results = await Promise.allSettled(
    endpoints.map(url => fetch(url).then(res => res.json()))
  );
  
  console.log('🧪 Testing Python API endpoints:');
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`✅ ${endpoints[index]}:`, result.value);
    } else {
      console.error(`❌ ${endpoints[index]}:`, result.reason);
    }
  });
  
  return results.every(result => result.status === 'fulfilled');
};
