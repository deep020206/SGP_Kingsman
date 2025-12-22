const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',

  // MongoDB
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/food-ordering',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
      connectTimeoutMS: 15000,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000
    },
    maxRetries: 2,
    retryInterval: 10000
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // CORS
  cors: {
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001',
      'http://192.168.1.0/24:3000', // Local network access
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:3000$/, // Any 192.168.x.x:3000
      /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:3000$/, // Any 10.x.x.x:3000
      /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:3000$/, // Any 172.16-31.x.x:3000
      process.env.FRONTEND_URL, // Production frontend URL
      /^https:\/\/kingsman-frontend-.*\.vercel\.app$/, // Any Vercel frontend deployment
      /^https:\/\/.*\.vercel\.app$/ // Allow all Vercel preview deployments
    ].filter(Boolean), // Remove undefined values
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },

  // File Upload
  upload: {
    directory: process.env.UPLOAD_DIR || 'uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
  },

  // Email (for future use)
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },

  // Validation
  validation: {
    passwordMinLength: 6,
    phoneRegex: /^\+?[\d\s-]{10,}$/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
};

// Validate required configurations in production
if (config.nodeEnv === 'production') {
  const required = [
    'JWT_SECRET',
    'MONGODB_URI'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = config;