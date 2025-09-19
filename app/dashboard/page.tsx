"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
interface StocktakeSession {
  id: string;
  name: string;
  date: string;
  status: string;
  location: string;
}

interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  reviewSessions: number;
  needsReview: number;
}

export default function Dashboard() {
  const [sessions, setSessions] = useState<StocktakeSession[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    completedSessions: 0,
    reviewSessions: 0,
    needsReview: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
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
        toast.error("Failed to load dashboard data", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Failed to load dashboard data", {
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

   // Memoize functions to prevent child component re-renders
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

  const getBadgeVariant = (status: string) => {
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
  };

  if (isLoading) {
    return (
      <div className="space-y-6 px-6 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/upload">
              <Button>Upload</Button>
            </Link>
            <Link href="/stocktake/new">
              <Button>New Stocktake</Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6 py-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/upload">
            <Button>Upload</Button>
          </Link>
          <Link href="/stocktake/new">
            <Button>New Stocktake</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stocks need review</CardDescription>
            <CardTitle className="text-3xl">{stats.needsReview}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stocktakes Completed</CardDescription>
            <CardTitle className="text-3xl">
              {stats.completedSessions} <span className="text-base">of {stats.totalSessions}</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next Stocktake</CardDescription>
            <CardTitle className="text-3xl">May 2026</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
           {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No stocktake sessions found. Create your first stocktake session to get started.
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.location}</TableCell>
                    <TableCell>{session.name}</TableCell>
                    <TableCell>{formatDate(session.date)}</TableCell>
                    <TableCell>
                      <Badge className="w-20" variant={getBadgeVariant(session.status)}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
