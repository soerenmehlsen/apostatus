"use client";
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


export default function Dashboard() {
  const {
    sessions,
    stats,
    isLoading,
    formatDate,
    getBadgeVariant,
  } = useDashboard();

  if (isLoading) {
    return <Loading/>;
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
