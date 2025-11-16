module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test files pattern
  testMatch: ['**/__tests__/**/*.test.js'],
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/'
  ],
  
  // Setup files
  setupFiles: ['./__tests__/setup.js'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Transform files
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  
  // Transform ignored patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(@babel)/)'
  ],
  
  // Module directories
  moduleDirectories: ['node_modules'],
  
  // Module name mapper
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  
  // Test environment variables
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Global setup
  globalSetup: undefined,
  globalTeardown: undefined,
  
  // Fail on console errors/warnings
  silent: false
};