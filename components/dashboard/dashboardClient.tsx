"use client";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StatsCard from "@/components/dashboard/statsCard";
import Loading from "@/components/dashboard/loading";
import SessionTableRow from "@/components/dashboard/tableRow";
import { useDashboard } from "@/hooks/useDashboard";
import { useDatabaseStatus } from "@/hooks/useDatabaseStatus";
import { DashboardSession, DashboardStats } from "@/types/dashboard";
import { toast } from "sonner";

const DATABASE_STATUS_TOAST_ID = "database-status";

interface DashboardClientProps {
  initialSessions?: DashboardSession[];
  initialStats?: DashboardStats;
  initialDatabaseConnected?: boolean;
}

export default function DashboardClient({ 
  initialSessions, 
  initialStats,
  initialDatabaseConnected = true,
}: DashboardClientProps) {
  const {
    sessions,
    stats,
    isLoading,
    error,
    fetchDashboardData,
    formatDate,
    getBadgeVariant,
  } = useDashboard({ 
    initialSessions, 
    initialStats 
  });
  const shouldShowDatabaseStatus = !initialDatabaseConnected && sessions.length === 0;
  const { databaseStatus } = useDatabaseStatus(shouldShowDatabaseStatus);

  // Show toast notifications based on database status
  useEffect(() => {
    if (!shouldShowDatabaseStatus) {
      toast.dismiss(DATABASE_STATUS_TOAST_ID);
      return;
    }

    // If the database is starting, it will show a loading toast. 
    if (databaseStatus === "starting") {
      toast.loading("Database is starting up. Waiting for connection...", {
        id: DATABASE_STATUS_TOAST_ID,
        duration: Infinity,
      });
      return;
    }

    // If the database is running, it will show a success toast 
    toast.success("Database is running. Please restart the site to load dashboard data.", {
      id: DATABASE_STATUS_TOAST_ID,
      duration: 12000,
    });
  }, [databaseStatus, shouldShowDatabaseStatus]);

  // Show loading state while fetching data
  if (isLoading && !sessions.length) {
    return <Loading />;
  }

  // Show error state with retry option
  if (error && !sessions.length) {
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

        <div className="text-center py-8">
          <p className="text-destructive mb-4">
            Failed to load dashboard data: {error}
          </p>
          <Button 
            onClick={fetchDashboardData} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Loading..." : "Try Again"}
          </Button>
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
        <StatsCard 
          title="Stocks need review" 
          value={stats.needsReview} 
        />
        <StatsCard 
          title="Stocktakes Completed" 
          value={stats.completedSessions}
          subtitle={`of ${stats.totalSessions}`}
        />
        <StatsCard 
          title="Next Stocktake" 
          value="May 2026" 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : sessions.length === 0 ? (
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
                  <SessionTableRow 
                    key={session.id}
                    session={session}
                    formatDate={formatDate}
                    getBadgeVariant={getBadgeVariant}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
