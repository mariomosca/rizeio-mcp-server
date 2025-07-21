import { z } from 'zod';

const ConfigSchema = z.object({
  apiKey: z.string().min(1, 'RIZE_API_KEY is required'),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  cacheConfig: z.object({
    maxSize: z.number().default(1000),
    ttl: z.number().default(5 * 60 * 1000) // 5 minutes
  }),
  rateLimiting: z.object({
    enabled: z.boolean().default(true),
    maxRequests: z.number().default(100),
    windowMs: z.number().default(60 * 1000) // 1 minute
  })
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(): Config {
  const config = {
    apiKey: process.env.RIZE_API_KEY || '',
    logLevel: process.env.LOG_LEVEL || 'info',
    cacheConfig: {
      maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
      ttl: parseInt(process.env.CACHE_TTL || '300000')
    },
    rateLimiting: {
      enabled: process.env.RATE_LIMITING !== 'false',
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '60000')
    }
  };

  return ConfigSchema.parse(config);
}
