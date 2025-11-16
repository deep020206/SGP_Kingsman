const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');

// Import configurations and utilities
const config = require('./config');
const logger = require('./utils/logger');
const PerformanceMonitor = require('./performance-monitor');

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const vendorRoutes = require('./routes/vendor');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const favoriteRoutes = require('./routes/favorites');
const adminAuthRoutes = require('./routes/adminAuth');
const testRoutes = require('./routes/test');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize email service
const emailService = require('./services/emailService');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketIo(server, {
  cors: config.cors
});

// Middleware
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// Add OPTIONS handling for preflight requests
app.options('*', cors(config.cors));

// Make io available in request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/test', testRoutes);

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { email, name, testOTP } = req.body;
    
    if (testOTP) {
      // Test OTP email
      const otpService = require('./services/otpService');
      const result = await otpService.sendOTPEmail(email, '123456', 'test');
      
      if (result.success) {
        res.json({ message: 'Test OTP email sent successfully', result });
      } else {
        res.status(500).json({ message: 'Failed to send test OTP email', result });
      }
    } else {
      // Test welcome email
      if (!email || !name) {
        return res.status(400).json({ message: 'Email and name are required' });
      }
      
      const result = await emailService.sendWelcomeEmail({ email, name });
      if (result) {
        res.json({ message: 'Test email sent successfully' });
      } else {
        res.status(500).json({ message: 'Failed to send test email' });
      }
    }
  } catch (error) {
    logger.error('Test email failed:', error);
    res.status(500).json({ message: 'Email service error', error: error.message });
  }
});

// File uploads directory
app.use('/uploads', express.static(path.join(__dirname, config.upload.directory)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use((req, res, next) => {
  const error = new Error('Not Found');
  error.status = 404;
  next(error);
});

app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });

  // Join room for real-time updates
  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.debug(`Socket ${socket.id} joined room: user-${userId}`);
  });

  // Leave room
  socket.on('leave-room', (userId) => {
    socket.leave(`user-${userId}`);
    logger.debug(`Socket ${socket.id} left room: user-${userId}`);
  });

  // Join vendor room
  socket.on('join-vendor-room', (vendorId) => {
    socket.join(`vendor-${vendorId}`);
    logger.debug(`Socket ${socket.id} joined vendor room: vendor-${vendorId}`);
  });

  // Leave vendor room
  socket.on('leave-vendor-room', (vendorId) => {
    socket.leave(`vendor-${vendorId}`);
    logger.debug(`Socket ${socket.id} left vendor room: vendor-${vendorId}`);
  });
});

// Make io available globally for notifications
global.io = io;

// MongoDB connection with retries and better error handling
let isConnecting = false;
let connectionRetries = 0;

const connectWithRetry = async (retries = config.mongodb.maxRetries) => {
  if (isConnecting) {
    logger.info('MongoDB connection already in progress, skipping...');
    return;
  }

  isConnecting = true;
  connectionRetries = retries;

  try {
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info('✅ MongoDB connected successfully');
    isConnecting = false;
    connectionRetries = 0;
  } catch (error) {
    isConnecting = false;
    
    if (retries > 0) {
      logger.warn(`MongoDB connection failed. Retrying in ${config.mongodb.retryInterval/1000} seconds... (${retries} attempts remaining)`);
      setTimeout(() => connectWithRetry(retries - 1), config.mongodb.retryInterval);
    } else {
      logger.error('MongoDB connection error:', error);
      logger.error('Please make sure MongoDB is installed and running on your system.');
      logger.info('Installation instructions:');
      logger.info('1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community');
      logger.info('2. Run the installer and follow the installation steps');
      logger.info('3. Make sure to install MongoDB as a Service');
      logger.info('4. Start MongoDB service using: net start MongoDB');
      
      // Don't exit immediately, allow server to start without DB
      logger.warn('⚠️  Server will start without database connection. Some features may not work.');
    }
  }
};

connectWithRetry();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${config.nodeEnv} mode`);
  
  // Start performance monitoring in development
  if (config.isDevelopment) {
    const monitor = new PerformanceMonitor();
    monitor.startMonitoring(30000); // Check every 30 seconds
  }
});
