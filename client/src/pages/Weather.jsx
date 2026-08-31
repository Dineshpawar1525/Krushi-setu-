import React, { useState, useEffect } from 'react';
import { 
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Navigation,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Globe
} from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState({ lat: null, lon: null, name: 'Loading...' });
  const [farmingAdvice, setFarmingAdvice] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Free Weather API Key - Get yours from: https://openweathermap.org/api
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

  // Debug logging for API key
  useEffect(() => {
    console.log('🔑 API Key Debug Info:');
    console.log('Raw env var:', import.meta.env.VITE_WEATHER_API_KEY);
    console.log('Processed key:', WEATHER_API_KEY);
    console.log('Key length:', WEATHER_API_KEY?.length);
    console.log('Key starts with:', WEATHER_API_KEY?.substring(0, 8));
  }, []);

  // Get user's location
  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
              name: 'Current Location'
            });
          },
          (error) => {
            console.log('Geolocation not available or denied, using default location:', error.message);
            // Default to a location if geolocation fails
            setLocation({
              lat: 28.6139, // Delhi, India
              lon: 77.2090,
              name: 'Delhi, India (Default)'
            });
          },
          {
            timeout: 10000, // 10 seconds timeout
            enableHighAccuracy: false, // Use less accurate but faster location
            maximumAge: 300000 // 5 minutes cache
          }
        );
      } else {
        console.log('Geolocation not supported, using default location');
        // Default location if geolocation not supported
        setLocation({
          lat: 28.6139,
          lon: 77.2090,
          name: 'Delhi, India (Default)'
        });
      }
    };

    getLocation();
  }, []);

  // Test API key validity
  const testApiKey = async (apiKey) => {
    try {
      const testResponse = await fetch(
        `${WEATHER_API_URL}/weather?lat=28.6139&lon=77.2090&appid=${apiKey}&units=metric`
      );
      return testResponse.ok;
    } catch (error) {
      return false;
    }
  };

  // Fetch weather data
  const fetchWeatherData = async () => {
    if (!location.lat || !location.lon) return;

    // Check if API key is available
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'undefined') {
      console.log('Weather API key not found, using demo data');
      setError(null); // Clear any previous errors
      setIsDemoMode(true);
      loadDemoData();
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Test API key first
      const isApiKeyValid = await testApiKey(WEATHER_API_KEY);
      if (!isApiKeyValid) {
        console.log('API key test failed, switching to demo mode');
        setError(null); // Clear error
        setIsDemoMode(true);
        loadDemoData();
        return;
      }

      // Fetch current weather
      const currentResponse = await fetch(
        `${WEATHER_API_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_API_KEY}&units=metric`
      );

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `${WEATHER_API_URL}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${WEATHER_API_KEY}&units=metric`
      );

      if (!currentResponse.ok || !forecastResponse.ok) {
        const errorData = await currentResponse.json().catch(() => ({}));
        if (currentResponse.status === 401) {
          throw new Error('API key is invalid or expired. Please check your OpenWeatherMap account.');
        } else if (currentResponse.status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Weather API request failed: ${currentResponse.status} - ${errorData.message || 'Unknown error'}`);
        }
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      setWeatherData(currentData);
      setForecast(forecastData.list.slice(0, 8)); // Next 24 hours (8 x 3-hour intervals)

      // Generate farming advice based on weather
      generateFarmingAdvice(currentData, forecastData.list);

    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(null); // Clear error
      setIsDemoMode(true);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Load demo data when API is not available
  const loadDemoData = () => {
    // Generate realistic weather data based on current time and location
    const now = new Date();
    const hour = now.getHours();
    const month = now.getMonth();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const isDay = hour >= 6 && hour < 18;
    
    // Location-based climate simulation
    const lat = location.lat || 28.6139;
    const lon = location.lon || 77.2090;
    
    // Seasonal temperature base (more realistic)
    const seasonalTemp = getSeasonalTemperature(month, lat);
    const dailyTempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8; // More pronounced daily cycle
    const randomVariation = (Math.random() - 0.5) * 6; // Random weather variation
    const currentTemp = Math.round(seasonalTemp + dailyTempVariation + randomVariation);
    
    // Dynamic weather conditions based on multiple factors
    const weatherCondition = getDynamicWeatherCondition(hour, month, lat, currentTemp);
    
    // Realistic humidity based on temperature and season
    const baseHumidity = getHumidityForTemp(currentTemp, month);
    const humidityVariation = Math.round((Math.random() - 0.5) * 15);
    const currentHumidity = Math.max(20, Math.min(95, baseHumidity + humidityVariation));
    
    // Dynamic pressure based on weather conditions
    const basePressure = 1013;
    const pressureVariation = weatherCondition.main === 'Rain' ? -15 : (weatherCondition.main === 'Clear' ? 5 : -5);
    const currentPressure = basePressure + pressureVariation + Math.round((Math.random() - 0.5) * 10);
    
    // Wind simulation based on weather and location
    const windSpeed = getWindSpeed(weatherCondition, lat, hour);
    const windDirection = Math.round(Math.random() * 360);
    
    const demoWeatherData = {
      main: { 
        temp: currentTemp, 
        feels_like: Math.round(currentTemp + (currentHumidity > 70 ? 2 : 0) + (windSpeed > 5 ? -1 : 0)), 
        humidity: currentHumidity, 
        pressure: currentPressure
      },
      weather: [weatherCondition],
      wind: { 
        speed: windSpeed, 
        deg: windDirection
      },
      visibility: weatherCondition.main === 'Rain' ? Math.round(5000 + Math.random() * 3000) : 10000,
      name: location.name || 'Demo Location'
    };

    // Generate realistic 24-hour forecast with weather patterns
    const demoForecast = generateDynamicForecast(hour, month, lat, currentTemp);

    setWeatherData(demoWeatherData);
    setForecast(demoForecast);
    generateFarmingAdvice(demoWeatherData, demoForecast);
    setLoading(false);
    setIsDemoMode(true);
  };

  // Get seasonal temperature based on month and latitude
  const getSeasonalTemperature = (month, lat) => {
    const isNorthernHemisphere = lat > 0;
    const seasonalCycle = Math.sin((month - 2) * Math.PI / 6); // Peak in summer (month 5-7)
    
    if (isNorthernHemisphere) {
      // Northern hemisphere: warmer in summer (months 5-7), cooler in winter (months 11-1)
      return 20 + seasonalCycle * 15;
    } else {
      // Southern hemisphere: opposite cycle
      return 20 - seasonalCycle * 15;
    }
  };

  // Get dynamic weather condition based on multiple factors
  const getDynamicWeatherCondition = (hour, month, lat, temp) => {
    const isDay = hour >= 6 && hour < 18;
    const isSummer = month >= 5 && month <= 7;
    const isWinter = month >= 11 || month <= 1;
    
    // Weather probability based on season and time
    let weatherTypes = [];
    
    if (isSummer) {
      weatherTypes = [
        { main: 'Clear', description: 'clear sky', icon: isDay ? '01d' : '01n', weight: 40 },
        { main: 'Clouds', description: 'few clouds', icon: isDay ? '02d' : '02n', weight: 30 },
        { main: 'Clouds', description: 'scattered clouds', icon: isDay ? '03d' : '03n', weight: 20 },
        { main: 'Rain', description: 'light rain', icon: isDay ? '10d' : '10n', weight: 10 }
      ];
    } else if (isWinter) {
      weatherTypes = [
        { main: 'Clouds', description: 'overcast clouds', icon: isDay ? '04d' : '04n', weight: 35 },
        { main: 'Clouds', description: 'broken clouds', icon: isDay ? '04d' : '04n', weight: 25 },
        { main: 'Rain', description: 'moderate rain', icon: isDay ? '10d' : '10n', weight: 25 },
        { main: 'Clear', description: 'clear sky', icon: isDay ? '01d' : '01n', weight: 15 }
      ];
    } else {
      // Spring/Fall
      weatherTypes = [
        { main: 'Clouds', description: 'scattered clouds', icon: isDay ? '03d' : '03n', weight: 30 },
        { main: 'Clear', description: 'clear sky', icon: isDay ? '01d' : '01n', weight: 25 },
        { main: 'Clouds', description: 'few clouds', icon: isDay ? '02d' : '02n', weight: 25 },
        { main: 'Rain', description: 'light rain', icon: isDay ? '10d' : '10n', weight: 20 }
      ];
    }
    
    // Select weather based on weighted probability
    const totalWeight = weatherTypes.reduce((sum, weather) => sum + weather.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const weather of weatherTypes) {
      random -= weather.weight;
      if (random <= 0) {
        return weather;
      }
    }
    
    return weatherTypes[0];
  };

  // Get realistic humidity based on temperature and season
  const getHumidityForTemp = (temp, month) => {
    const isSummer = month >= 5 && month <= 7;
    const isWinter = month >= 11 || month <= 1;
    
    if (isSummer) {
      // Summer: higher humidity when hot
      return temp > 30 ? 75 : (temp > 25 ? 65 : 55);
    } else if (isWinter) {
      // Winter: lower humidity when cold
      return temp < 10 ? 45 : (temp < 15 ? 55 : 65);
    } else {
      // Spring/Fall: moderate humidity
      return temp > 25 ? 70 : (temp < 15 ? 50 : 60);
    }
  };

  // Get wind speed based on weather conditions and location
  const getWindSpeed = (weather, lat, hour) => {
    const baseWind = weather.main === 'Rain' ? 4 : (weather.main === 'Clear' ? 2 : 3);
    const timeVariation = hour >= 12 && hour <= 18 ? 1 : 0; // Windier in afternoon
    const randomVariation = (Math.random() - 0.5) * 2;
    
    return Math.round((baseWind + timeVariation + randomVariation) * 10) / 10;
  };

  // Generate dynamic 24-hour forecast
  const generateDynamicForecast = (currentHour, month, lat, currentTemp) => {
    const forecast = [];
    const baseTemp = getSeasonalTemperature(month, lat);
    
    for (let i = 0; i < 8; i++) {
      const futureHour = currentHour + (i * 3);
      const futureDay = futureHour >= 24 ? futureHour - 24 : futureHour;
      const isFutureDay = futureHour >= 24;
      
      // Temperature progression with daily cycle
      const dailyTempVariation = Math.sin((futureDay - 6) * Math.PI / 12) * 8;
      const randomVariation = (Math.random() - 0.5) * 4;
      const futureTemp = Math.round(baseTemp + dailyTempVariation + randomVariation);
      
      // Weather condition for this time
      const weatherCondition = getDynamicWeatherCondition(futureDay, month, lat, futureTemp);
      
      forecast.push({
        dt: Date.now() / 1000 + (i * 3 * 3600),
        main: { temp: futureTemp },
        weather: [weatherCondition]
      });
    }
    
    return forecast;
  };

  // Generate climate-smart farming advice
  const generateFarmingAdvice = (currentWeather, forecastData) => {
    const advice = [];
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();

    if (currentWeather) {
      const temp = currentWeather.main.temp;
      const humidity = currentWeather.main.humidity;
      const windSpeed = currentWeather.wind.speed;
      const pressure = currentWeather.main.pressure;
      const weatherCondition = currentWeather.weather[0].main;
      const visibility = currentWeather.visibility;

      // Enhanced temperature-based advice with more specific ranges
      if (temp > 40) {
        advice.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'Extreme Heat Warning',
          message: 'Dangerous heat levels detected. Avoid field work during peak hours. Increase irrigation frequency.',
          action: 'Work early morning/late evening only'
        });
      } else if (temp > 35) {
        advice.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'High Temperature Alert',
          message: 'High temperatures detected. Consider early morning or late evening irrigation to prevent water loss.',
          action: 'Schedule irrigation for cooler hours'
        });
      } else if (temp < 5) {
        advice.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'Frost Risk Alert',
          message: 'Freezing temperatures detected. Protect sensitive crops immediately with covers or move to greenhouse.',
          action: 'Apply immediate frost protection'
        });
      } else if (temp < 10) {
        advice.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'Low Temperature Alert',
          message: 'Cold temperatures detected. Protect sensitive crops with covers or move to greenhouse.',
          action: 'Apply frost protection measures'
        });
      } else if (temp >= 20 && temp <= 30) {
        advice.push({
          type: 'success',
          icon: CheckCircle,
          title: 'Optimal Temperature Range',
          message: 'Perfect temperature for most crops. Ideal conditions for planting, growth, and field activities.',
          action: 'Continue normal farming operations'
        });
      } else {
        advice.push({
          type: 'info',
          icon: Thermometer,
          title: 'Moderate Temperature',
          message: 'Temperature is within acceptable range for most crops. Monitor crop-specific requirements.',
          action: 'Continue with standard practices'
        });
      }

      // Enhanced humidity-based advice
      if (humidity > 85) {
        advice.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'Very High Humidity',
          message: 'Extremely high humidity increases disease risk significantly. Ensure excellent air circulation.',
          action: 'Increase ventilation and monitor for diseases'
        });
      } else if (humidity > 75) {
        advice.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'High Humidity',
          message: 'High humidity increases disease risk. Ensure good air circulation and avoid overhead watering.',
          action: 'Monitor for fungal diseases'
        });
      } else if (humidity < 25) {
        advice.push({
          type: 'warning',
          icon: Droplets,
          title: 'Very Low Humidity',
          message: 'Extremely low humidity causes severe water stress. Increase irrigation frequency significantly.',
          action: 'Increase watering schedule and consider misting'
        });
      } else if (humidity < 40) {
        advice.push({
          type: 'info',
          icon: Droplets,
          title: 'Low Humidity',
          message: 'Low humidity may cause water stress. Increase irrigation frequency.',
          action: 'Increase watering schedule'
        });
      } else if (humidity >= 50 && humidity <= 70) {
        advice.push({
          type: 'success',
          icon: CheckCircle,
          title: 'Optimal Humidity',
          message: 'Humidity levels are ideal for most crops. Good conditions for growth and disease prevention.',
          action: 'Maintain current practices'
        });
      }

      // Enhanced wind-based advice
      if (windSpeed > 20) {
        advice.push({
          type: 'warning',
          icon: Wind,
          title: 'Severe Wind Warning',
          message: 'Dangerous wind speeds detected. Avoid field work and secure all structures immediately.',
          action: 'Postpone outdoor activities and secure equipment'
        });
      } else if (windSpeed > 15) {
        advice.push({
          type: 'warning',
          icon: Wind,
          title: 'Strong Winds',
          message: 'Strong winds can damage crops and cause soil erosion. Secure structures and consider windbreaks.',
          action: 'Check and secure farm structures'
        });
      } else if (windSpeed > 8) {
        advice.push({
          type: 'info',
          icon: Wind,
          title: 'Moderate Winds',
          message: 'Moderate winds detected. Good for air circulation but avoid spraying operations.',
          action: 'Postpone spraying activities'
        });
      } else if (windSpeed < 2) {
        advice.push({
          type: 'info',
          icon: Wind,
          title: 'Calm Conditions',
          message: 'Very calm conditions. Good for spraying but may increase disease risk in humid conditions.',
          action: 'Ideal for spraying operations'
        });
      }

      // Enhanced weather condition advice
      if (weatherCondition === 'Rain') {
        const rainIntensity = forecastData.filter(item => item.weather[0].main === 'Rain').length;
        if (rainIntensity > 4) {
          advice.push({
            type: 'warning',
            icon: CloudRain,
            title: 'Heavy Rain Expected',
            message: 'Significant rainfall forecasted. Prepare for flooding and reduce irrigation completely.',
            action: 'Prepare drainage and reduce irrigation'
          });
        } else {
          advice.push({
            type: 'info',
            icon: CloudRain,
            title: 'Rain Expected',
            message: 'Rain is forecasted. Reduce irrigation and prepare for potential flooding in low areas.',
            action: 'Adjust irrigation schedule'
          });
        }
      } else if (weatherCondition === 'Clear') {
        advice.push({
          type: 'success',
          icon: Sun,
          title: 'Clear Weather',
          message: 'Perfect weather for field activities, spraying, and harvesting.',
          action: 'Ideal for outdoor farm work'
        });
      } else if (weatherCondition === 'Clouds') {
        advice.push({
          type: 'info',
          icon: Cloud,
          title: 'Cloudy Conditions',
          message: 'Cloudy weather provides good conditions for planting and reduces heat stress.',
          action: 'Good for planting and transplanting'
        });
      }

      // Pressure-based advice
      if (pressure < 1000) {
        advice.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'Low Pressure System',
          message: 'Low atmospheric pressure indicates potential weather changes. Monitor for storms.',
          action: 'Prepare for potential weather changes'
        });
      } else if (pressure > 1025) {
        advice.push({
          type: 'success',
          icon: CheckCircle,
          title: 'High Pressure System',
          message: 'High pressure indicates stable weather conditions. Good for outdoor activities.',
          action: 'Ideal for field work and spraying'
        });
      }

      // Visibility-based advice
      if (visibility < 1000) {
        advice.push({
          type: 'warning',
          icon: Eye,
          title: 'Poor Visibility',
          message: 'Very poor visibility conditions. Avoid machinery operations and field work.',
          action: 'Postpone outdoor activities'
        });
      } else if (visibility < 5000) {
        advice.push({
          type: 'info',
          icon: Eye,
          title: 'Reduced Visibility',
          message: 'Reduced visibility conditions. Exercise caution with machinery operations.',
          action: 'Use caution with equipment'
        });
      }
    }

    // Enhanced seasonal advice with more specific recommendations
    const isSummer = month >= 5 && month <= 7;
    const isWinter = month >= 11 || month <= 1;
    const isSpring = month >= 2 && month <= 4;
    const isFall = month >= 8 && month <= 10;

    if (isSpring) {
      advice.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Spring Planting Season',
        message: 'Spring is ideal for planting most crops. Prepare soil, start seed germination, and plan crop rotation.',
        action: 'Begin spring planting activities'
      });
    } else if (isSummer) {
      advice.push({
        type: 'info',
        icon: Sun,
        title: 'Summer Growing Season',
        message: 'Summer requires increased irrigation, pest management, and heat stress monitoring.',
        action: 'Focus on irrigation and pest control'
      });
    } else if (isFall) {
      advice.push({
        type: 'info',
        icon: Calendar,
        title: 'Fall Harvest Season',
        message: 'Fall is harvest time for many crops. Prepare storage facilities and harvesting equipment.',
        action: 'Plan and execute harvest activities'
      });
    } else if (isWinter) {
      advice.push({
        type: 'info',
        icon: CloudSnow,
        title: 'Winter Preparation',
        message: 'Winter is time for soil preparation, equipment maintenance, and planning for next season.',
        action: 'Focus on maintenance and planning'
      });
    }

    // Time-based advice
    if (hour >= 6 && hour <= 10) {
      advice.push({
        type: 'info',
        icon: Sun,
        title: 'Morning Activities',
        message: 'Morning hours are ideal for irrigation, planting, and light field work.',
        action: 'Schedule morning activities'
      });
    } else if (hour >= 16 && hour <= 19) {
      advice.push({
        type: 'info',
        icon: Sun,
        title: 'Evening Activities',
        message: 'Evening hours are good for irrigation and harvesting activities.',
        action: 'Schedule evening activities'
      });
    }

    setFarmingAdvice(advice);
  };

  // Fetch weather data when location changes
  useEffect(() => {
    if (location.lat && location.lon) {
      fetchWeatherData();
    }
  }, [location]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (location.lat && location.lon) {
        fetchWeatherData();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [location]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (isDemoMode) {
      // For demo mode, just reload demo data to show dynamic changes
      loadDemoData();
    } else {
      await fetchWeatherData();
    }
    setRefreshing(false);
  };

  const testApiKeyDirectly = async () => {
    console.log('🧪 Testing API key directly...');
    const testUrl = `https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&appid=${WEATHER_API_KEY}&units=metric`;
    console.log('Test URL:', testUrl);
    
    try {
      const response = await fetch(testUrl);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API key works! Data:', data);
        alert('✅ API key is working! Check console for details.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('❌ API key failed:', errorData);
        console.log('Full error response:', errorData);
        
        // More detailed error analysis
        if (response.status === 401) {
          console.log('🔍 401 Error Analysis:');
          console.log('- API key format:', WEATHER_API_KEY);
          console.log('- API key length:', WEATHER_API_KEY.length);
          console.log('- URL being called:', testUrl);
          console.log('- Error message:', errorData.message);
          console.log('- Error code:', errorData.cod);
        }
        
        alert(`❌ API key failed: ${response.status} - ${errorData.message || 'Unknown error'}\n\nCheck console for detailed analysis.`);
      }
    } catch (error) {
      console.log('❌ Network error:', error);
      alert(`❌ Network error: ${error.message}`);
    }
  };

  const testAlternativeEndpoints = async () => {
    console.log('🔍 Testing alternative endpoints...');
    
    const endpoints = [
      {
        name: 'Current Weather (Delhi)',
        url: `https://api.openweathermap.org/data/2.5/weather?q=Delhi&appid=${WEATHER_API_KEY}&units=metric`
      },
      {
        name: 'Current Weather (London)',
        url: `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${WEATHER_API_KEY}&units=metric`
      },
      {
        name: 'Weather by Coordinates',
        url: `https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&appid=${WEATHER_API_KEY}&units=metric`
      }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint.name}`);
        const response = await fetch(endpoint.url);
        console.log(`${endpoint.name} - Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint.name} works!`, data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.log(`❌ ${endpoint.name} failed:`, errorData);
        }
      } catch (error) {
        console.log(`❌ ${endpoint.name} network error:`, error);
      }
    }
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': Sun,
      '01n': Sun,
      '02d': Cloud,
      '02n': Cloud,
      '03d': Cloud,
      '03n': Cloud,
      '04d': Cloud,
      '04n': Cloud,
      '09d': CloudRain,
      '09n': CloudRain,
      '10d': CloudRain,
      '10n': CloudRain,
      '11d': CloudLightning,
      '11n': CloudLightning,
      '13d': CloudSnow,
      '13n': CloudSnow,
      '50d': Cloud,
      '50n': Cloud
    };
    return iconMap[iconCode] || Cloud;
  };

  const getAdviceIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'info': return Clock;
      default: return Clock;
    }
  };

  const getAdviceColor = (type) => {
    switch (type) {
      case 'warning': return 'text-red-600 bg-red-50 border-red-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute top-20 left-20 w-40 h-40 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-6 shadow-lg">
                  <RefreshCw className="w-10 h-10 text-white animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Weather Data</h3>
                <p className="text-gray-600 mb-4">Fetching real-time weather and climate information...</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 w-40 h-40 bg-sky-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-4 shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent mb-3">
              Weather Intelligence
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real-time weather forecasts and climate-smart farming advice for optimal agricultural decisions
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium">{isDemoMode ? 'Demo Weather' : 'Live Weather'}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Updated {new Date().toLocaleTimeString()}</span>
              </div>
              {isDemoMode && (
                <>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Demo Mode Active</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Success Message for Demo Mode */}
          {isDemoMode && weatherData && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-green-800 mb-2">Weather Intelligence Active</h3>
                  <p className="text-green-700 mb-3">
                    Currently showing realistic demo data with dynamic weather simulation. All features are fully functional including climate-smart farming advice, 24-hour forecasts, and weather-based recommendations. <strong>Click refresh to see dynamic changes!</strong>
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-green-100">
                    <p className="text-sm text-green-600 mb-2"><strong>Demo Features Working:</strong></p>
                    <ul className="text-sm text-green-600 space-y-1 list-disc list-inside">
                      <li>Dynamic weather simulation based on location, season, and time</li>
                      <li>Realistic 24-hour forecast with weather pattern changes</li>
                      <li>Intelligent climate-smart farming advice and recommendations</li>
                      <li>Advanced temperature, humidity, wind, and pressure monitoring</li>
                      <li>Seasonal and time-based farming guidance and alerts</li>
                      <li>Weather changes on every refresh - try it!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    {error.includes('API key') ? 'API Key Issue' : 'Setup Required'}
                  </h3>
                  <p className="text-orange-700 mb-3">{error}</p>
                  
                  {error.includes('API key') ? (
                    <div className="bg-white rounded-lg p-3 border border-orange-100">
                      <p className="text-sm text-orange-600 mb-2"><strong>API Key Troubleshooting:</strong></p>
                      <ul className="text-sm text-orange-600 space-y-1 list-disc list-inside mb-3">
                        <li>Check if your API key is correct in <code className="bg-orange-100 px-1 rounded">.env.local</code></li>
                        <li>Verify your OpenWeatherMap account is activated</li>
                        <li>Make sure you've confirmed your email address</li>
                        <li>Wait 10-15 minutes after signup for activation</li>
                        <li>Check your API key in the <a href="https://home.openweathermap.org/api_keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-800">OpenWeatherMap dashboard</a></li>
                        <li>Restart your development server after updating the key</li>
                      </ul>
                      <div className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={testApiKeyDirectly}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                          >
                            🧪 Test API Key Directly
                          </button>
                          <button
                            onClick={testAlternativeEndpoints}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            🔍 Test Alternative Endpoints
                          </button>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border">
                          <p className="text-xs text-gray-600 mb-2"><strong>Manual Test URL:</strong></p>
                          <code className="text-xs bg-white p-2 rounded border block break-all">
                            https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&appid=c9117ba821d12b6e44e4561bd89fd13f&units=metric
                          </code>
                          <p className="text-xs text-gray-500 mt-1">Copy this URL and paste it in a new browser tab to test manually</p>
                          
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800 font-medium mb-1">Quick Browser Test:</p>
                            <p className="text-xs text-yellow-700">1. Open browser console (F12)</p>
                            <p className="text-xs text-yellow-700">2. Paste this code:</p>
                            <code className="text-xs bg-yellow-100 p-1 rounded block mt-1">
                              fetch('https://api.openweathermap.org/data/2.5/weather?lat=28.6139&lon=77.2090&appid=c9117ba821d12b6e44e4561bd89fd13f&units=metric').then(r =&gt; r.json()).then(console.log)
                            </code>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-3 border border-orange-100">
                      <p className="text-sm text-orange-600 mb-2"><strong>To get real weather data:</strong></p>
                      <ol className="text-sm text-orange-600 space-y-1 list-decimal list-inside">
                        <li>Go to <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-800">OpenWeatherMap API</a></li>
                        <li>Sign up for a free account</li>
                        <li>Confirm your email address</li>
                        <li>Get your API key from the dashboard</li>
                        <li>Add it to your <code className="bg-orange-100 px-1 rounded">.env.local</code> file as <code className="bg-orange-100 px-1 rounded">VITE_WEATHER_API_KEY=your_key_here</code></li>
                        <li>Restart your development server</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Current Weather */}
          {weatherData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Main Weather Card */}
              <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">{location.name}</h2>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                      {React.createElement(getWeatherIcon(weatherData.weather[0].icon), {
                        className: "w-10 h-10 text-blue-600"
                      })}
                    </div>
                    <div>
                      <div className="text-4xl font-bold text-gray-800">
                        {Math.round(weatherData.main.temp)}°C
                      </div>
                      <div className="text-lg text-gray-600 capitalize">
                        {weatherData.weather[0].description}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm text-gray-600">Humidity</div>
                      <div className="font-bold text-blue-600">{weatherData.main.humidity}%</div>
                    </div>
                    <div className="bg-cyan-50 rounded-lg p-3">
                      <Wind className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                      <div className="text-sm text-gray-600">Wind</div>
                      <div className="font-bold text-cyan-600">{weatherData.wind.speed} m/s</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Details */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100/50">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Weather Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Feels Like</span>
                    </div>
                    <span className="font-semibold">{Math.round(weatherData.main.feels_like)}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Visibility</span>
                    </div>
                    <span className="font-semibold">{(weatherData.visibility / 1000).toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Pressure</span>
                    </div>
                    <span className="font-semibold">{weatherData.main.pressure} hPa</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Wind Direction</span>
                    </div>
                    <span className="font-semibold">{weatherData.wind.deg}°</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Farming Advice */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Climate-Smart Farming Advice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {farmingAdvice.map((advice, index) => (
                <div key={index} className={`p-4 rounded-xl border ${getAdviceColor(advice.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {React.createElement(getAdviceIcon(advice.type), {
                        className: "w-5 h-5"
                      })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{advice.title}</h3>
                      <p className="text-sm mb-3">{advice.message}</p>
                      <div className="text-xs font-medium opacity-75">{advice.action}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 24-Hour Forecast */}
          {forecast.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-blue-100/50">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">24-Hour Forecast</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {forecast.map((item, index) => (
                  <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">
                      {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="w-8 h-8 mx-auto mb-2">
                      {React.createElement(getWeatherIcon(item.weather[0].icon), {
                        className: "w-8 h-8 text-blue-600"
                      })}
                    </div>
                    <div className="font-bold text-gray-800">{Math.round(item.main.temp)}°C</div>
                    <div className="text-xs text-gray-600 capitalize">{item.weather[0].description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Weather;
