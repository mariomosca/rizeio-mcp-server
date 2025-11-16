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
    // Log strutturato per debug (solo se necessario)
    // console.log('API Response getCurrentUser:', JSON.stringify(response, null, 2));
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
    // Log strutturato per debug (solo se necessario)
    // console.log('API Response getProjects:', JSON.stringify(response, null, 2));
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
    // Log strutturato per debug (solo se necessario)
    // console.log('API Response createProject:', JSON.stringify(response, null, 2));
    return response.createProject.project;
  }


  async getSummaries(startDate: string, endDate: string): Promise<RizeProductivityMetrics[]> {
    try {
      const query = gql`
        query GetSummaries($startDate: ISO8601Date!, $endDate: ISO8601Date!, $bucketSize: String!) {
          summaries(startDate: $startDate, endDate: $endDate, bucketSize: $bucketSize, includeCategories: true) {
            buckets {
              date
              focusTime
              breakTime
              meetingTime
              trackedTime
              categories {
                category {
                  name
                  idle
                  focus
                  work
                }
                timeSpent
              }
            }
            focusTime
            breakTime
            meetingTime
            trackedTime
            workHours
          }
        }
      `;

      const response: any = await this.client.request(query, {
        startDate,
        endDate,
        bucketSize: "day"
      });

      // Mappa i dati dell'API ai nostri tipi
      // NOTA: I valori dell'API sono in SECONDI, convertiamo in minuti
      const buckets = response.summaries?.buckets || [];
      return buckets.map((bucket: any) => {
        // Trova la categoria con più tempo
        let topCategory: any = 'Work';
        let focusSessionsCount = 0;

        if (bucket.categories && bucket.categories.length > 0) {
          const topCat = bucket.categories.reduce((prev: any, curr: any) =>
            curr.timeSpent > prev.timeSpent ? curr : prev
          );
          topCategory = {
            name: topCat.category.name,
            timeSpent: Math.floor(topCat.timeSpent / 60),
            focus: topCat.category.focus
          };

          // Se la top category ha focus true, consideriamo che c'è stata almeno una sessione di focus
          if (topCat.category.focus === true) {
            // Possiamo stimare il numero di sessioni di focus come 1 per ora di topCategory.timeSpent, oppure semplicemente 1 se > 0
            focusSessionsCount = topCat.timeSpent > 0 ? 1 : 0;
          } else {
            focusSessionsCount = 0;
          }
        }

        return {
          date: bucket.date,
          totalFocusTime: Math.floor((bucket.focusTime || 0) / 60), // Converti secondi in minuti
          productivityScore: bucket.focusTime && bucket.trackedTime ?
            Math.round((bucket.focusTime / bucket.trackedTime) * 100) : 0,
          focusSessionsCount, // Basato su topCategory.focus
          topCategory,
          breakTime: Math.floor((bucket.breakTime || 0) / 60), // Converti secondi in minuti
          distractionTime: Math.floor((bucket.meetingTime || 0) / 60), // Usiamo meetingTime come distraction
          contextSwitches: 0 // Non disponibile
        };
      });
    } catch (error) {
      return [];
    }
  }

  async getFocusSessions(startDate: string): Promise<RizeFocusSession[]> {
    try {
      const query = gql`
        query GetSessions($startTime: ISO8601DateTime!, $endTime: ISO8601DateTime!) {
          sessions(startTime: $startTime, endTime: $endTime, statuses: ["active"]) {
            id
            startTime
            endTime
            title
          }
        }
      `;

      // Calcola endTime come fine della giornata
      const endDateTime = new Date(startDate);
      endDateTime.setHours(23, 59, 59, 999);

      const response: any = await this.client.request(query, {
        startTime: startDate,
        endTime: endDateTime.toISOString()
      });

      // Log strutturato per debug (solo se necessario)
      // console.log('API Response getFocusSessions:', JSON.stringify(response, null, 2));

      // Se ci sono sessioni, mappale ai nostri tipi (calcolando duration)
      const sessions = response.sessions || [];
      return sessions.map((session: any) => ({
        id: session.id,
        userId: '', // Non disponibile nell'API
        projectId: undefined, // Non disponibile nell'API
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.endTime && session.startTime ?
          Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60)) : 0,
        focusScore: 0, // Non disponibile nell'API
        category: 'Unknown', // Non disponibile nell'API
        application: 'Unknown', // Non disponibile nell'API
        title: session.title,
        isActive: false // Non disponibile nell'API
      }));
    } catch (error) {
      return [];
    }
  }

  async getAnalytics(
    timeframe: 'day' | 'week' | 'month',
    includeInsights: boolean = true
  ): Promise<RizeAnalytics> {
    const cacheKey = `analytics-${timeframe}-${includeInsights}`;
    const cached = this.cache.get<RizeAnalytics>(cacheKey);
    if (cached) return cached;

    try {
      // Calcola le date basandosi sul timeframe
      const now = new Date();
      let startDate: string, endDate: string;

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          startDate = weekStart.toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          startDate = monthStart.toISOString().split('T')[0];
          endDate = monthEnd.toISOString().split('T')[0];
          break;
      }

      // Usa getSummaries per ottenere i dati (stessa API, meno duplicazioni)
      const metrics = await this.getSummaries(startDate, endDate);

      // Costruisci l'oggetto analytics
      const analytics: RizeAnalytics = {
        timeframe,
        metrics,
        insights: [], // Per ora vuoto, da implementare se disponibile
        trends: {
          focusTime: metrics.reduce((sum: number, m: RizeProductivityMetrics) => sum + m.totalFocusTime, 0),
          productivityScore: metrics.length > 0 ? metrics.reduce((sum: number, m: RizeProductivityMetrics) => sum + m.productivityScore, 0) / metrics.length : 0,
          consistency: 0 // Da calcolare se necessario
        }
      };

      this.cache.set(cacheKey, analytics);
      return analytics;
    } catch (error) {
      const analytics: RizeAnalytics = {
        timeframe,
        metrics: [],
        insights: [],
        trends: {
          focusTime: 0,
          productivityScore: 0,
          consistency: 0
        }
      };

      this.cache.set(cacheKey, analytics);
      return analytics;
    }
  }
}
