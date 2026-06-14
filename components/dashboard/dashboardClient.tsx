"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  CalendarDays,
  Search,
  Plus,
  Upload,
  PlayCircle,
  Inbox,
  Archive,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatsCard from "@/components/dashboard/statsCard";
import Loading from "@/components/dashboard/loading";
import SessionTableRow from "@/components/dashboard/tableRow";
import SessionCard from "@/components/dashboard/sessionCard";
import ActiveStocktakeCard from "@/components/dashboard/activeStocktakeCard";
import { useDashboard } from "@/hooks/useDashboard";
import { useDatabaseStatus } from "@/hooks/useDatabaseStatus";
import { DashboardSession, DashboardStats } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  getLocationNames,
  getStatusMeta,
  getNextStocktakeLabel,
  isInProgress,
} from "@/lib/dashboard-display";
import { toast } from "sonner";

const DATABASE_STATUS_TOAST_ID = "database-status";

type StatusFilter = "all" | "in progress" | "review" | "completed";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Alle" },
  { key: "in progress", label: "Igangværende" },
  { key: "review", label: "Gennemsyn" },
  { key: "completed", label: "Gennemført" },
];

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
  const { sessions, stats, isLoading, error, fetchDashboardData, formatDate } =
    useDashboard({ initialSessions, initialStats });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const shouldShowDatabaseStatus =
    !initialDatabaseConnected && sessions.length === 0;
  const { databaseStatus } = useDatabaseStatus(shouldShowDatabaseStatus);

  // Show toast notifications based on database status
  useEffect(() => {
    if (!shouldShowDatabaseStatus) {
      toast.dismiss(DATABASE_STATUS_TOAST_ID);
      return;
    }

    if (databaseStatus === "starting") {
      toast.loading("Databasen starter op. Venter på forbindelse...", {
        id: DATABASE_STATUS_TOAST_ID,
        duration: Infinity,
      });
      return;
    }

    toast.success("Databasen kører. Genindlæs siden for at hente data.", {
      id: DATABASE_STATUS_TOAST_ID,
      duration: 12000,
    });
  }, [databaseStatus, shouldShowDatabaseStatus]);

  const inProgressCount = Math.max(
    0,
    stats.totalSessions - stats.completedSessions - stats.reviewSessions
  );

  const nextStocktakeLabel = useMemo(() => getNextStocktakeLabel(), []);

  const activeSessions = useMemo(
    () => sessions.filter((s) => isInProgress(s.status)),
    [sessions]
  );

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sessions.filter((s) => {
      if (statusFilter !== "all" && s.status.toLowerCase() !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        ...getLocationNames(s.location),
        s.name,
        getStatusMeta(s.status).label,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [sessions, statusFilter, query]);

  // Loading state while fetching data
  if (isLoading && !sessions.length) {
    return <Loading />;
  }

  // Error state with retry option
  if (error && !sessions.length) {
    return (
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <PageHeader />
        <Card className="items-center gap-3 py-12 text-center">
          <p className="text-destructive">
            Kunne ikke hente data: {error}
          </p>
          <Button
            onClick={fetchDashboardData}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Henter..." : "Prøv igen"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <PageHeader />

      {/* KPI cards */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatsCard
          title="Igangværende"
          value={inProgressCount}
          icon={ClipboardList}
          tone="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
        />
        <StatsCard
          title="Afventer gennemsyn"
          value={stats.needsReview}
          icon={Clock}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        />
        <StatsCard
          title="Gennemført"
          value={stats.completedSessions}
          subtitle={`af ${stats.totalSessions}`}
          icon={CheckCircle2}
          tone="bg-primary/10 text-primary"
        />
        <StatsCard
          title="Næste lagerstatus"
          value={nextStocktakeLabel}
          icon={CalendarDays}
          tone="bg-muted text-muted-foreground"
        />
      </section>

      {/* Continue where you left off */}
      {activeSessions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="size-5 text-sky-600 dark:text-sky-400" aria-hidden />
            <h2 className="text-lg font-semibold tracking-tight">
              Fortsæt hvor du slap
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeSessions.map((session) => (
              <ActiveStocktakeCard key={session.id} session={session} />
            ))}
          </div>
        </section>
      )}

      {/* Latest stocktakes */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Seneste lagerstatusser
          </h2>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søg lokation eller person..."
              className="pl-9"
              aria-label="Søg i lagerstatusser"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                statusFilter === key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {filteredSessions.length === 0 ? (
          <EmptyState hasSessions={sessions.length > 0} />
        ) : (
          <>
            {/* Desktop: table */}
            <Card className="hidden overflow-hidden py-0 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-5 py-3">Lokation</TableHead>
                    <TableHead className="px-5 py-3">Navn</TableHead>
                    <TableHead className="px-5 py-3">Oprettet af</TableHead>
                    <TableHead className="px-5 py-3">Dato</TableHead>
                    <TableHead className="px-5 py-3">Status</TableHead>
                    <TableHead className="px-5 py-3 text-right">
                      <span className="sr-only">Handling</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[&_td:first-child]:px-5 [&_td:last-child]:px-5">
                  {filteredSessions.map((session) => (
                    <SessionTableRow
                      key={session.id}
                      session={session}
                      formatDate={formatDate}
                    />
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile: cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function PageHeader() {
  const today = new Intl.DateTimeFormat("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Oversigt
        </h1>
        <p className="text-sm text-muted-foreground first-letter:uppercase">
          Mega Syd Apotek · {today}
        </p>
      </div>
      <div className="flex gap-2.5">
        <Button asChild variant="outline" className="flex-1 sm:flex-none">
          <Link href="/archive">
            <Archive />
            Arkiv
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 sm:flex-none">
          <Link href="/upload">
            <Upload />
            Upload fil
          </Link>
        </Button>
        <Button asChild className="flex-1 sm:flex-none">
          <Link href="/stocktake/new">
            <Plus />
            Ny lagerstatus
          </Link>
        </Button>
      </div>
    </header>
  );
}

function EmptyState({ hasSessions }: { hasSessions: boolean }) {
  return (
    <Card className="items-center gap-3 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="size-6 text-muted-foreground" aria-hidden />
      </div>
      {hasSessions ? (
        <p className="text-sm text-muted-foreground">
          Ingen lagerstatusser matcher din søgning.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Ingen lagerstatusser endnu. Opret din første for at komme i gang.
          </p>
          <Button asChild>
            <Link href="/stocktake/new">
              <Plus />
              Ny lagerstatus
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
