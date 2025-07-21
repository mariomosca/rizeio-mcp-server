// import { McpError } from '@modelcontextprotocol/sdk/types.js'; // Sostituire con errore custom se serve

export class RizeApiError extends Error {
  constructor(message: string, data?: any) {
    super(`Rize API Error: ${message}`);
    this.name = 'RizeApiError';
    (this as any).data = data;
  }
}

export class ValidationError extends Error {
  constructor(message: string, data?: any) {
    super(`Validation Error: ${message}`);
    this.name = 'ValidationError';
    (this as any).data = data;
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Invalid API key') {
    super(`Authentication Error: ${message}`);
    this.name = 'AuthenticationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(`Rate Limit Error: ${message}`);
    this.name = 'RateLimitError';
  }
}
