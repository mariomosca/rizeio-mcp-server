import { z } from 'zod';

const ApiKeySchema = z.string().min(1, 'API key is required');

export class AuthService {
  private apiKey: string;

  constructor(apiKey: string) {
    const validated = ApiKeySchema.parse(apiKey);
    this.apiKey = validated;
  }

  getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'RizeMCPServer/1.0.0'
    };
  }

  isValid(): boolean {
    return this.apiKey.length > 0;
  }
}
