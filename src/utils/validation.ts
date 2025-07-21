import { z } from 'zod';
// import { McpError } from '@modelcontextprotocol/sdk/types.js'; // Sostituire con errore custom se serve

export const DateSchema = z.string().refine(
  (date) => !isNaN(Date.parse(date)),
  'Invalid date format. Use ISO 8601 format (YYYY-MM-DD)'
);

export const DateRangeSchema = z.object({
  startDate: DateSchema,
  endDate: DateSchema
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  'End date must be after or equal to start date'
);

export const PaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().optional()
});

export const TimeframeSchema = z.enum(['day', 'week', 'month']);

export const CategorySchema = z.enum(['work', 'personal', 'all']).default('all');

export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    // if (error instanceof z.ZodError) {
    //   const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
    //   throw new McpError(-32602, `Invalid parameters: ${messages}`);
    // }
    throw error;
  }
}
