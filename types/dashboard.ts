export interface StocktakeSession {
  id: string;
  name: string;
  date: string;
  status: string;
  location: string;
}

export interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  reviewSessions: number;
  needsReview: number;
}

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";