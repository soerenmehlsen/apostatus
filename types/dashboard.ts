import { SessionStatus } from './api';

// Dashboard-specific types (transformed for UI)
export interface DashboardSession {
  id: string;
  name: string;
  date: string;
  status: SessionStatus;
  location: string[];
  stockChecksCount: number;
}

export interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  reviewSessions: number;
  needsReview: number;
}

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Hook return types
export interface DashboardData {
  sessions: DashboardSession[];
  stats: DashboardStats;
}

export interface UseDashboardReturn {
  sessions: DashboardSession[];
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
  formatDate: (dateString: string) => string;
  getBadgeVariant: (status: string) => BadgeVariant;
}