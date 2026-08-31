import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/calendar';

// Create axios instance with default config
const calendarApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
calendarApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agriai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Calendar Events API
export const calendarEventsApi = {
  // Get all events for a user
  getEvents: async (params = {}) => {
    try {
      const response = await calendarApi.get('/events', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  },

  // Get events by date range
  getEventsByDateRange: async (startDate, endDate) => {
    try {
      const response = await calendarApi.get('/events', {
        params: {
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw error;
    }
  },

  // Get a single event by ID
  getEventById: async (eventId) => {
    try {
      const response = await calendarApi.get(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      throw error;
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await calendarApi.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  },

  // Update an existing event
  updateEvent: async (eventId, eventData) => {
    try {
      const response = await calendarApi.put(`/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      const response = await calendarApi.delete(`/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  },

  // Mark event as completed
  markEventCompleted: async (eventId, completionData) => {
    try {
      const response = await calendarApi.patch(`/events/${eventId}/complete`, completionData);
      return response.data;
    } catch (error) {
      console.error('Error marking event as completed:', error);
      throw error;
    }
  },

  // Get events by category
  getEventsByCategory: async (category) => {
    try {
      const response = await calendarApi.get('/events', {
        params: { category }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events by category:', error);
      throw error;
    }
  },

  // Get events by field
  getEventsByField: async (fieldId) => {
    try {
      const response = await calendarApi.get('/events', {
        params: { fieldId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events by field:', error);
      throw error;
    }
  }
};

// Fields API
export const fieldsApi = {
  // Get all fields for a user
  getFields: async () => {
    try {
      const response = await calendarApi.get('/fields');
      return response.data;
    } catch (error) {
      console.error('Error fetching fields:', error);
      throw error;
    }
  },

  // Create a new field
  createField: async (fieldData) => {
    try {
      const response = await calendarApi.post('/fields', fieldData);
      return response.data;
    } catch (error) {
      console.error('Error creating field:', error);
      throw error;
    }
  }
};

// Teams API
export const teamsApi = {
  // Get all teams
  getTeams: async () => {
    try {
      const response = await calendarApi.get('/teams');
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }
};

// Notifications API
export const notificationsApi = {
  // Get notifications for a user
  getNotifications: async () => {
    try {
      const response = await calendarApi.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }
};

export default calendarApi;
