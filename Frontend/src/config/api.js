import { NetworkUtils, connectionManager } from '../utils/networkUtils';

// Dynamic API Configuration that updates when network changes
let currentConfig = null;
let lastNetworkCheck = 0;
const NETWORK_CHECK_INTERVAL = 5000; // Check every 5 seconds

const detectNetworkUrls = async () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If we have environment variables, use them (highest priority)
  if (process.env.REACT_APP_API_URL) {
    return {
      API_URL: process.env.REACT_APP_API_URL,
      SERVER_URL: process.env.REACT_APP_SERVER_URL || process.env.REACT_APP_API_URL.replace('/api', ''),
      SOCKET_URL: process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL.replace('/api', '')
    };
  }

  // Try to discover working API URL
  const apiUrl = await NetworkUtils.discoverApiUrl();
  const baseUrl = apiUrl.replace('/api', '');
  
  return {
    API_URL: apiUrl,
    SERVER_URL: baseUrl,
    SOCKET_URL: baseUrl
  };
};

const getApiConfig = async () => {
  const now = Date.now();
  
  // Use cached config if it's fresh (less than 5 seconds old)
  if (currentConfig && (now - lastNetworkCheck) < NETWORK_CHECK_INTERVAL) {
    return currentConfig;
  }
  
  // Detect current network configuration
  const networkUrls = await detectNetworkUrls();
  
  currentConfig = {
    ...networkUrls,
    ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
    hostname: window.location.hostname,
    isLocalhost: NetworkUtils.isLocalhost(),
    timestamp: now
  };
  
  lastNetworkCheck = now;
  
  console.log('🔧 Updated API Configuration:', currentConfig);
  return currentConfig;
};

// Force refresh of configuration (used when network changes)
export const refreshApiConfig = async () => {
  lastNetworkCheck = 0; // Force refresh
  currentConfig = null;
  return await getApiConfig();
};

// Get current API URL (async)
export const getApiUrl = async () => {
  const config = await getApiConfig();
  return config.API_URL;
};

// Get current server URL (async) 
export const getServerUrl = async () => {
  const config = await getApiConfig();
  return config.SERVER_URL;
};

// Get current socket URL (async)
export const getSocketUrl = async () => {
  const config = await getApiConfig();
  return config.SOCKET_URL;
};

// Synchronous versions for backward compatibility (may be stale)
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
export const ENVIRONMENT = process.env.REACT_APP_ENVIRONMENT || 'development';

// Initialize configuration
getApiConfig();

export default {
  getApiConfig,
  refreshApiConfig,
  getApiUrl,
  getServerUrl,
  getSocketUrl
};