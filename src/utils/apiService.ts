import { config, getApiEndpoint } from '../config';

// API utility functions
export class ApiService {
  private static async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Database connection methods
  static async testConnection(credentials: DatabaseCredentials): Promise<any> {
    const requestBody = this.transformCredentials(credentials);
    return this.makeRequest(getApiEndpoint('testConnection'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  static async disconnectDatabase(): Promise<any> {
    return this.makeRequest(getApiEndpoint('disconnect'), {
      method: 'POST',
    });
  }

  // Chat methods
  static async sendChatMessage(message: string, dbContext?: any): Promise<any> {
    return this.makeRequest(getApiEndpoint('chat'), {
      method: 'POST',
      body: JSON.stringify({ message, dbContext }),
    });
  }

  static async sendGeminiChatMessage(
    message: string, 
    databaseCredentials: DatabaseCredentials,
    maxTokens: number = 1000,
    temperature: number = 0.7
  ): Promise<any> {
    const requestBody = {
      database_credentials: this.transformCredentials(databaseCredentials),
      max_tokens: maxTokens,
      messages: [
        {
          content: message,
          role: "user"
        }
      ],
      temperature: temperature
    };

    return this.makeRequest(getApiEndpoint('geminiChat'), {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // Query methods
  static async executeQuery(query: string): Promise<any> {
    return this.makeRequest(getApiEndpoint('query'), {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  static async getTableSchema(tableName: string): Promise<any> {
    return this.makeRequest(`${getApiEndpoint('database')}/schema/${tableName}`, {
      method: 'GET',
    });
  }

  static async listTables(): Promise<any> {
    return this.makeRequest(`${getApiEndpoint('database')}/tables`, {
      method: 'GET',
    });
  }

  // Transform frontend credentials to backend format
  private static transformCredentials(credentials: DatabaseCredentials) {
    return {
      database: credentials.database,
      db_type: "mysql",
      host: credentials.host,
      password: credentials.password,
      port: parseInt(credentials.port),
      username: credentials.username
    };
  }
}

// Type definitions for API requests/responses
export interface DatabaseCredentials {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

export interface ChatMessage {
  message: string;
  dbContext?: any;
}

export interface QueryRequest {
  query: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};

export default ApiService;