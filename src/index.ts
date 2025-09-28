#!/usr/bin/env node
import 'dotenv/config';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { RizeApiService } from './services/rize-api.js';
import { loadConfig } from './config.js';
import { validateInput, DateRangeSchema, TimeframeSchema, CategorySchema, PaginationSchema } from './utils/validation.js';
import { formatProductivityMetrics, formatFocusSessions, formatAnalytics, formatDuration } from './utils/formatting.js';
import { AuthenticationError } from './utils/errors.js';
import { createLogger, format, transports } from 'winston';

const config = loadConfig();

const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' })
  ]
});

const rizeApi = new RizeApiService(config.apiKey);

const server = new McpServer({
  name: 'rize-mcp-server',
  version: '1.0.0'
});

server.tool(
  'get_current_user',
  {
    description: 'Get current user information from Rize.io'
  },
  async (): Promise<any> => {
    try {
      const user = await rizeApi.getCurrentUser();
      return {
        content: [{
          type: 'text',
          text: `👤 Current User: ${user.email}${user.name ? ` (${user.name})` : ''}`
        }]
      };
    } catch (error) {
      logger.error('Failed to get current user', { error: (error as Error).message });
      throw error;
    }
  }
);

server.tool(
  'get_productivity_metrics',
  {
    startDate: z.string().describe('Start date (YYYY-MM-DD)'),
    endDate: z.string().describe('End date (YYYY-MM-DD)'),
    category: CategorySchema.describe('Category filter (work, personal, all)')
  },
  async ({ startDate, endDate, category }: { startDate: string; endDate: string; category: string }): Promise<any> => {
    try {
      const dateRange = validateInput(DateRangeSchema, { startDate, endDate });
      const metrics = await rizeApi.getSummaries(
        dateRange.startDate,
        dateRange.endDate
      );
      return {
        content: [{
          type: 'text',
          text: formatProductivityMetrics(metrics)
        }]
      };
    } catch (error) {
      logger.error('Failed to get productivity metrics', { error: (error as Error).message, startDate, endDate, category });
      throw error;
    }
  }
);

server.tool(
  'get_focus_sessions',
  {
    startDate: z.string().describe('Start date (YYYY-MM-DD)'),
    endDate: z.string().describe('End date (YYYY-MM-DD)'),
    projectId: z.string().optional().describe('Project ID filter'),
    category: CategorySchema.describe('Category filter (work, personal, all)'),
    minDuration: z.number().optional().describe('Minimum session duration in minutes')
  },
  async ({ startDate, endDate, projectId, category, minDuration }: { startDate: string; endDate: string; projectId?: string; category: string; minDuration?: number }): Promise<any> => {
    try {
      const dateRange = validateInput(DateRangeSchema, { startDate, endDate });
      let sessions = await rizeApi.getFocusSessions(
        dateRange.startDate
      );
      if (minDuration) {
        sessions = sessions.filter(session => (session.duration || 0) >= minDuration);
      }
      return {
        content: [{
          type: 'text',
          text: formatFocusSessions(sessions)
        }]
      };
    } catch (error) {
      logger.error('Failed to get focus sessions', { error: (error as Error).message, startDate, endDate, projectId, category });
      throw error;
    }
  }
);

server.tool(
  'get_analytics_report',
  {
    timeframe: TimeframeSchema.describe('Time frame for analytics (day, week, month)'),
    includeInsights: z.boolean().default(true).describe('Include AI-generated insights')
  },
  async ({ timeframe, includeInsights }: { timeframe: 'day' | 'week' | 'month'; includeInsights: boolean }): Promise<any> => {
    try {
      const validatedTimeframe = validateInput(TimeframeSchema, timeframe);
      const analytics = await rizeApi.getAnalytics(validatedTimeframe, includeInsights);
      return {
        content: [{
          type: 'text',
          text: formatAnalytics(analytics)
        }]
      };
    } catch (error) {
      logger.error('Failed to get analytics report', { error: (error as Error).message, timeframe, includeInsights });
      throw error;
    }
  }
);

server.tool(
  'list_projects',
  {
    limit: z.number().min(1).max(100).default(50).describe('Maximum number of projects to return'),
    cursor: z.string().optional().describe('Pagination cursor')
  },
  async ({ limit, cursor }: { limit: number; cursor?: string }): Promise<any> => {
    try {
      const pagination = validateInput(PaginationSchema, { limit, cursor });
      const result = await rizeApi.getProjects(pagination.limit, pagination.cursor);
      let formatted = `📁 Projects (${result.projects.length} found)\n\n`;
      result.projects.forEach(project => {
        formatted += `• ${project.name}`;
        formatted += `\n  ID: ${project.id}`;
        formatted += `\n\n`;
      });
      if (result.hasNextPage) {
        formatted += `\n🔄 More projects available. Use cursor: ${result.nextCursor}`;
      }
      return {
        content: [{
          type: 'text',
          text: formatted
        }]
      };
    } catch (error) {
      logger.error('Failed to list projects', { error: (error as Error).message, limit, cursor });
      throw error;
    }
  }
);

server.tool(
  'create_project',
  {
    name: z.string().min(1).max(100).describe('Project name'),
    description: z.string().optional().describe('Project description')
  },
  async ({ name, description }: { name: string; description?: string }): Promise<any> => {
    try {
      const project = await rizeApi.createProject(name, description);
      return {
        content: [{
          type: 'text',
          text: `✅ Project created successfully!\n\n📁 ${project.name}\n🆔 ID: ${project.id}\n📅 Created: ${new Date(project.createdAt).toLocaleDateString()}`
        }]
      };
    } catch (error) {
      logger.error('Failed to create project', { error: (error as Error).message, name, description });
      throw error;
    }
  }
);

server.tool(
  'get_productivity_summary',
  {
    date: z.string().describe('Date for summary (YYYY-MM-DD)'),
    includeBreakdown: z.boolean().default(true).describe('Include category breakdown')
  },
  async ({ date, includeBreakdown }: { date: string; includeBreakdown: boolean }): Promise<any> => {
    try {
      const validatedDate = validateInput(z.string().refine(d => !isNaN(Date.parse(d))), date);
      const metrics = await rizeApi.getSummaries(validatedDate, validatedDate);
      const sessions = await rizeApi.getFocusSessions(validatedDate);
      if (metrics.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `📅 No productivity data available for ${date}`
          }],
          data: null
        };
      }
      const dayMetrics = metrics[0];
      let formatted = `📊 Productivity Summary for ${date}\n\n`;
      formatted += `🎯 Focus Time: ${formatDuration(dayMetrics.totalFocusTime)}\n`;
      formatted += `⚡ Productivity Score: ${dayMetrics.productivityScore}/100\n`;
      formatted += `📈 Focus Sessions: ${dayMetrics.focusSessionsCount}\n`;
      formatted += `🔄 Context Switches: ${dayMetrics.contextSwitches}\n`;
      formatted += `☕ Break Time: ${formatDuration(dayMetrics.breakTime)}\n`;
      formatted += `📱 Distraction Time: ${formatDuration(dayMetrics.distractionTime)}\n`;
      formatted += `🏆 Top Category: ${dayMetrics.topCategory}\n`;
      let breakdown: Record<string, number> = {};
      if (includeBreakdown && sessions.length > 0) {
        formatted += `\n📋 Session Breakdown:\n`;
        const categoryMap = new Map<string, number>();
        sessions.forEach(session => {
          const current = categoryMap.get(session.category) || 0;
          categoryMap.set(session.category, current + (session.duration || 0));
        });
        categoryMap.forEach((duration, category) => {
          formatted += `• ${category}: ${formatDuration(duration)}\n`;
          breakdown[category] = duration;
        });
      }
      return {
        content: [{
          type: 'text',
          text: formatted
        }],
        data: {
          ...dayMetrics,
          sessionBreakdown: breakdown,
          sessions
        }
      };
    } catch (error) {
      logger.error('Failed to get productivity summary', { error: (error as Error).message, date });
      throw error;
    }
  }
);

server.tool(
  'health_check',
  {
    description: 'Check the health status of the Rize MCP server'
  },
  async (): Promise<any> => {
    try {
      await rizeApi.getCurrentUser();
      return {
        content: [{
          type: 'text',
          text: `✅ Rize MCP Server Health Check\n\n🟢 Status: Healthy\n📅 Timestamp: ${new Date().toISOString()}\n🔑 API Connection: OK\n📊 Version: 1.0.0`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `❌ Rize MCP Server Health Check\n\n🔴 Status: Unhealthy\n📅 Timestamp: ${new Date().toISOString()}\n❌ API Connection: Failed\n📝 Error: ${(error as Error).message}`
        }]
      };
    }
  }
);

server.onerror = (error: any) => {
  logger.error('MCP Server Error', { error: (error as Error).message, stack: (error as Error).stack });
};

async function main() {
  try {
    if (!config.apiKey) {
      throw new AuthenticationError('RIZE_API_KEY environment variable is required');
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('Rize MCP Server started successfully');
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

main().catch(error => {
  logger.error('Unhandled error', { error: (error as Error).message });
  process.exit(1);
});
