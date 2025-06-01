// Application configuration
export const config = {
  // Backend API configuration
  api: {
    baseUrl: 'http://localhost:8000',
    timeout: 10000, // 10 seconds
    endpoints: {
      chat: '/api/chat',
      database: '/api/database',
      query: '/api/query',
      connect: '/api/database/connect',
      disconnect: '/api/database/disconnect',
      testConnection: '/api/v1/database/test-connection',
      geminiChat: '/api/v1/gemini/chat',
    },
  },
  
  // Database configuration
  database: {
    defaultPort: '3306',
    connectionTimeout: 30000, // 30 seconds
  },
  
  // UI configuration
  ui: {
    typingDelay: {
      min: 1000,
      max: 3000,
    },
    animationDuration: 300,
  },
} as const;

// Helper functions for API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

export const getApiEndpoint = (key: keyof typeof config.api.endpoints): string => {
  return getApiUrl(config.api.endpoints[key]);
};

export default config;