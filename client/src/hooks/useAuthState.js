import { useState, useEffect } from 'react';
import { getAuthData, clearAuthData, isTokenValid } from '../utils/authUtils';

// Global auth state management
let globalAuthState = {
  isAuthenticated: false,
  user: null,
  loading: true
};

let authStateListeners = [];

export const useAuthState = () => {
  const [authState, setAuthState] = useState(globalAuthState);

  useEffect(() => {
    // Add listener
    authStateListeners.push(setAuthState);

    // Initialize auth state
    initializeAuthState();

    return () => {
      // Remove listener
      authStateListeners = authStateListeners.filter(listener => listener !== setAuthState);
    };
  }, []);

  return authState;
};

export const setAuthState = (newState) => {
  globalAuthState = { ...globalAuthState, ...newState };
  authStateListeners.forEach(listener => listener(globalAuthState));
};

export const clearAuthState = () => {
  globalAuthState = {
    isAuthenticated: false,
    user: null,
    loading: false
  };
  authStateListeners.forEach(listener => listener(globalAuthState));
};

const initializeAuthState = async () => {
  try {
    const authData = getAuthData();
    
    if (authData.isAuthenticated && authData.token && authData.user) {
      // Validate token
      if (isTokenValid(authData.token)) {
        setAuthState({
          isAuthenticated: true,
          user: authData.user,
          loading: false
        });
      } else {
        // Token expired, clear auth data
        clearAuthData();
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
    }
  } catch (error) {
    console.error('Error initializing auth state:', error);
    clearAuthData();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  }
};