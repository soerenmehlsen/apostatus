import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { StocktakeSession, DashboardStats, BadgeVariant } from "@/types/dashboard";

export const useDashboard = () => {
  const [sessions, setSessions] = useState<StocktakeSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    completedSessions: 0,
    reviewSessions: 0,
    needsReview: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard');
      const data = await response.json();

      if (response.ok) {
        setSessions(data.sessions || []);
        setStats(data.stats || {
          totalSessions: 0,
          completedSessions: 0,
          reviewSessions: 0,
          needsReview: 0
        });
      } else {
        const errorMessage = data.error || 'Failed to load dashboard data';
        setError(errorMessage);
        toast.error("Failed to load dashboard data", {
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error("Failed to load dashboard data", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateString));
    } catch (error) {
      return dateString;
    }
  }, []);

  const getBadgeVariant = useCallback((status: string): BadgeVariant => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "secondary";
      case "review":
        return "destructive";
      case "completed":
        return "default";
      default:
        return "outline";
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    sessions,
    stats,
    isLoading,
    error,
    fetchDashboardData,
    formatDate,
    getBadgeVariant,
  };
};