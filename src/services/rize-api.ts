import { GraphQLClient, gql } from 'graphql-request';
import { RizeUser, RizeProject, RizeFocusSession, RizeProductivityMetrics, RizeAnalytics } from '../types/rize.js';
import { AuthService } from './auth.js';
import { CacheService } from './cache.js';
// import { McpError } from '@modelcontextprotocol/sdk/types.js'; // Sostituire con errore custom se serve

export class RizeApiService {
  private client: GraphQLClient;
  private auth: AuthService;
  private cache: CacheService;

  constructor(apiKey: string) {
    this.auth = new AuthService(apiKey);
    this.cache = new CacheService({
      maxSize: 1000,
      ttl: 5 * 60 * 1000 // 5 minuti
    });
    this.client = new GraphQLClient('https://api.rize.io/api/v1/graphql', {
      headers: this.auth.getHeaders()
    });
  }

  async getCurrentUser(): Promise<RizeUser> {
    const cacheKey = 'current-user';
    const cached = this.cache.get<RizeUser>(cacheKey);
    if (cached) return cached;
    const query = gql`
      query CurrentUser {
        currentUser {
          email
          name
        }
      }
    `;
    const response: any = await this.client.request(query);
    const user = response.currentUser;
    this.cache.set(cacheKey, user);
    return user;
  }

  async getProjects(limit: number = 50, cursor?: string): Promise<{
    projects: RizeProject[];
    hasNextPage: boolean;
    nextCursor?: string;
  }> {
    const query = gql`
      query GetProjects($first: Int, $after: String) {
        projects(first: $first, after: $after) {
          edges {
            node {
              id
              name
              color
              createdAt
              updatedAt
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;
    const response: any = await this.client.request(query, {
      first: limit,
      after: cursor
    });
    const projects = response.projects.edges.map((edge: any) => edge.node);
    const hasNextPage = response.projects.pageInfo.hasNextPage;
    const nextCursor = response.projects.pageInfo.endCursor;
    return {
      projects,
      hasNextPage,
      nextCursor
    };
  }

  async createProject(name: string, description?: string): Promise<RizeProject> {
    const mutation = gql`
      mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
          project {
            id
            name
            description
            color
            isArchived
            createdAt
            updatedAt
          }
        }
      }
    `;
    const response: any = await this.client.request(mutation, {
      input: {
        args: {
          name,
          description
        }
      }
    });
    return response.createProject.project;
  }

  public generateSimulatedMetrics(startDate: string, endDate: string): RizeProductivityMetrics[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const metrics: RizeProductivityMetrics[] = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      metrics.push({
        date: date.toISOString().split('T')[0],
        totalFocusTime: Math.floor(Math.random() * 480) + 120, // 2-10 hours
        productivityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        focusSessionsCount: Math.floor(Math.random() * 12) + 3, // 3-15 sessions
        topCategory: ['Development', 'Design', 'Research', 'Communication'][Math.floor(Math.random() * 4)],
        breakTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
        distractionTime: Math.floor(Math.random() * 90) + 10, // 10-100 minutes
        contextSwitches: Math.floor(Math.random() * 25) + 5 // 5-30 switches
      });
    }
    return metrics;
  }

  public generateSimulatedFocusSessions(startDate: string): RizeFocusSession[] {
    const sessions: RizeFocusSession[] = [];
    const applications = ['VS Code', 'Figma', 'Chrome', 'Slack', 'Notion'];
    const categories = ['Development', 'Design', 'Research', 'Communication'];
    for (let i = 0; i < 10; i++) {
      const startTime = new Date(startDate);
      startTime.setHours(9 + Math.floor(Math.random() * 8));
      startTime.setMinutes(Math.floor(Math.random() * 60));
      const duration = Math.floor(Math.random() * 180) + 15; // 15-195 minutes
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);
      sessions.push({
        id: `session-${i}`,
        userId: 'user-1',
        projectId: Math.random() > 0.5 ? 'project-1' : undefined,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        focusScore: Math.floor(Math.random() * 40) + 60,
        category: categories[Math.floor(Math.random() * categories.length)],
        application: applications[Math.floor(Math.random() * applications.length)],
        title: `Focus Session ${i + 1}`,
        isActive: false
      });
    }
    return sessions;
  }

  async getFocusMetrics(startDate: string, endDate: string): Promise<RizeProductivityMetrics[]> {
    return this.generateSimulatedMetrics(startDate, endDate);
  }

  async getFocusSessions(startDate: string): Promise<RizeFocusSession[]> {
    return this.generateSimulatedFocusSessions(startDate);
  }

  async getAnalytics(
    timeframe: 'day' | 'week' | 'month',
    includeInsights: boolean = true
  ): Promise<RizeAnalytics> {
    const cacheKey = `analytics-${timeframe}-${includeInsights}`;
    const cached = this.cache.get<RizeAnalytics>(cacheKey);
    if (cached) return cached;
    const query = gql`
      query GetAnalytics($timeframe: String!, $includeInsights: Boolean!) {
        analytics(timeframe: $timeframe, includeInsights: $includeInsights) {
          timeframe
          metrics {
            date
            totalFocusTime
            productivityScore
            focusSessionsCount
            topCategory
            breakTime
            distractionTime
            contextSwitches
          }
          insights {
            id
            type
            title
            description
            priority
            category
            timestamp
            metadata
          }
          trends {
            focusTime
            productivityScore
            consistency
          }
        }
      }
    `;
    const response: any = await this.client.request(query, {
      timeframe,
      includeInsights
    });
    const analytics = response.analytics;
    this.cache.set(cacheKey, analytics);
    return analytics;
  }
}
