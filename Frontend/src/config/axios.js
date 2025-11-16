// Initialize axios with base configuration
const { REACT_APP_API_URL = 'http://localhost:5000/api' } = process.env;

const axiosConfig = {
  baseURL: REACT_APP_API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
};

export default axiosConfig;
