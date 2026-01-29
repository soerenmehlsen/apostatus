"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { DashboardSession, DashboardStats, BadgeVariant } from "@/types/dashboard";

interface UseDashboardProps {
  initialSessions?: DashboardSession[];
  initialStats?: DashboardStats;
}

export const useDashboard = (props?: UseDashboardProps) => {
  const [sessions, setSessions] = useState<DashboardSession[]>(props?.initialSessions || []);
  const [stats, setStats] = useState<DashboardStats>(
    props?.initialStats || {
      needsReview: 0,
      completedSessions: 0,
      totalSessions: 0,
      reviewSessions: 0
    }
  );
  const [isLoading, setIsLoading] = useState(!props?.initialSessions);
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
    // Only fetch if we don't have initial data
    if (!props?.initialSessions && !props?.initialStats) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, props?.initialSessions, props?.initialStats]);

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