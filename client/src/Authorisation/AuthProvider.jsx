import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { clearAuthData, setAuthData, getAuthData } from "../utils/authUtils";
import { useAuthState, setAuthState, clearAuthState } from "../hooks/useAuthState";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Use the global auth state
  const globalState = useAuthState();
  const [isAuthenticated, setIsAuthenticated] = useState(globalState.isAuthenticated);
  const [user, setUser] = useState(globalState.user);
  const [loading, setLoading] = useState(globalState.loading);

  // Sync local state with global state
  useEffect(() => {
    const wasAuthenticated = isAuthenticated;
    
    setIsAuthenticated(globalState.isAuthenticated);
    setUser(globalState.user);
    setLoading(globalState.loading);
    
    // Show welcome message only once when user becomes authenticated
    if (!wasAuthenticated && globalState.isAuthenticated && globalState.user) {
      const welcomeMessageShown = sessionStorage.getItem('welcomeMessageShown');
      
      // Only show welcome message if it hasn't been shown yet and we're not on the login page
      if (!welcomeMessageShown && window.location.pathname !== '/login') {
        sessionStorage.setItem('welcomeMessageShown', 'true');
        
        // Small delay to ensure it's not shown multiple times
        setTimeout(() => {
          toast.success(`Welcome back, ${globalState.user.name}! 🎉`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, 100);
      }
    }
  }, [globalState, isAuthenticated]);

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthData(userData, token);
    setAuthState({
      isAuthenticated: true,
      user: userData,
      loading: false
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearAuthData();
    clearAuthState();
    
    // Clear welcome message flag
    sessionStorage.removeItem('welcomeMessageShown');
    
    toast.success('Logged out successfully! 👋', {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    setUser(newUserData);
    setAuthData(newUserData, getAuthData().token);
    setAuthState({
      isAuthenticated: true,
      user: newUserData,
      loading: false
    });
  };

  const checkAuth = async () => {
    try {
      const authData = getAuthData();
      
      if (!authData.isAuthenticated || !authData.token) {
        return false;
      }

      // Verify token with server
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api/auth/verify`,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`
          }
        }
      );

      if (response.data.success) {
        updateUser(response.data.user);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
      return false;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;