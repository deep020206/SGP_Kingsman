import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000,
  withCredentials: true
});

// Debug interceptor
api.interceptors.request.use(request => {
  console.log('🚀 Starting Request:', request.url);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('✅ Response:', response.config.url, response.status);
    return response;
  },
  error => {
    console.error('❌ Response Error:', error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Attach token automatically
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
