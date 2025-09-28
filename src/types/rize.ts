export interface RizeUser {
  email: string;
  name?: string;
}

export interface RizeProject {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RizeFocusSession {
  id: string;
  userId: string;
  projectId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  focusScore?: number;
  category: string;
  application?: string;
  title?: string;
  isActive: boolean;
}

export interface RizeProductivityMetrics {
  date: string;
  totalFocusTime: number;
  productivityScore: number;
  focusSessionsCount: number;
  topCategory: {
    name: string;
    timeSpent: number;
  };
  breakTime: number;
  distractionTime: number;
  contextSwitches: number;
}

export interface RizeTimeEntry {
  id: string;
  userId: string;
  projectId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  description?: string;
  category: string;
  tags?: string[];
  isManual: boolean;
}

export interface RizeInsight {
  id: string;
  type: 'recommendation' | 'observation' | 'achievement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RizeAnalytics {
  timeframe: string;
  metrics: RizeProductivityMetrics[];
  insights: RizeInsight[];
  trends: {
    focusTime: number;
    productivityScore: number;
    consistency: number;
  };
}
