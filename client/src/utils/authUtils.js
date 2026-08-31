// Auth utility functions for managing authentication state
export const setAuthData = (user, token) => {
  try {
    localStorage.setItem('agriai_user', JSON.stringify(user));
    localStorage.setItem('agriai_token', token);
    localStorage.setItem('agriai_authenticated', 'true');
  } catch (error) {
    console.error('Error saving auth data:', error);
  }
};

export const getAuthData = () => {
  try {
    const user = localStorage.getItem('agriai_user');
    const token = localStorage.getItem('agriai_token');
    const isAuthenticated = localStorage.getItem('agriai_authenticated') === 'true';
    
    return {
      user: user ? JSON.parse(user) : null,
      token: token || null,
      isAuthenticated: isAuthenticated && !!user && !!token
    };
  } catch (error) {
    console.error('Error getting auth data:', error);
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  }
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem('agriai_user');
    localStorage.removeItem('agriai_token');
    localStorage.removeItem('agriai_authenticated');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
};