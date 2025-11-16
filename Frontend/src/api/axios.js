import axios from 'axios';
import { getApiUrl, refreshApiConfig } from '../config/api';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Function to check if error is network-related
const isNetworkError = (error) => {
  return !error.response && (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    error.message.includes('Network Error') ||
    error.message.includes('timeout') ||
    error.message.includes('Failed to fetch')
  );
};

// Function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create axios instance without fixed baseURL
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 8000,
  withCredentials: true
});

// Add request interceptor to dynamically set baseURL
api.interceptors.request.use(async (config) => {
  try {
    // Get the current API URL dynamically
    const currentApiUrl = await getApiUrl();
    
    // If the request URL is relative, prepend the base URL
    if (!config.url.startsWith('http')) {
      config.url = `${currentApiUrl}${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
      console.log('🌐 API Request:', { url: config.url, method: config.method });
    }
  } catch (error) {
    console.error('❌ Failed to resolve API URL:', error);
    // Fallback to localhost if resolution fails
    if (!config.url.startsWith('http')) {
      config.url = `http://localhost:5000/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor with network-aware retry logic
api.interceptors.response.use(
  response => {
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
      console.log('✅ API Response:', { 
        url: response.config.url, 
        status: response.status 
      });
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Avoid infinite retry loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if this is a network error that we should retry
    if (isNetworkError(error)) {
      originalRequest._retry = true;
      let retryCount = originalRequest._retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        originalRequest._retryCount = retryCount + 1;
        
        console.log(`🔄 Network error detected. Refreshing config and retrying (${retryCount + 1}/${MAX_RETRIES}):`, {
          url: originalRequest.url,
          error: error.message
        });
        
        // Refresh network configuration on first retry
        if (retryCount === 0) {
          try {
            console.log('🔄 Refreshing network configuration...');
            await refreshApiConfig();
            console.log('✅ Network configuration refreshed');
          } catch (configError) {
            console.warn('⚠️ Failed to refresh network config:', configError);
          }
        }
        
        // Exponential backoff
        const delayMs = RETRY_DELAY * Math.pow(2, retryCount);
        await delay(delayMs);
        
        // Clear the _retry flag and try again
        delete originalRequest._retry;
        return api(originalRequest);
      } else {
        console.error('❌ Max retries exceeded for:', originalRequest.url);
      }
    }
    
    // Log errors
    if (process.env.REACT_APP_ENVIRONMENT !== 'production') {
      console.error('❌ API Error:', { 
        url: error.config?.url, 
        message: error.message,
        status: error.response?.status,
        isNetworkError: isNetworkError(error)
      });
    }
    
    // Enhance network error messages
    if (isNetworkError(error)) {
      error.isNetworkError = true;
      error.userMessage = "Unable to connect to server. Please check your internet connection.";
    }

    return Promise.reject(error);
  }
);// Attach token automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Handle responses and token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
