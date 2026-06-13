"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Coins,
  MapPin,
  PackageX,
  ScanSearch,
  ShieldCheck,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/statsCard";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  getLocationName,
  getStatusMeta,
  formatDateDa,
} from "@/lib/dashboard-display";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CheckResult {
  id: string;
  article: string;
  name: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  value: number;
}

interface ReviewSession {
  id: string;
  date: string;
  location: string;
  locationId: string;
  status: string;
  name: string;
}

interface ReviewSummary {
  missingItems: number;
  totalValueVariance: number;
  totalDiscrepancies: number;
}

interface ReviewData {
  session: ReviewSession;
  summary: ReviewSummary;
  checkResults: CheckResult[];
}

interface ReviewClientProps {
  initialData?: ReviewData | null;
  sessionId?: string | null;
}

const currencyFormatter = new Intl.NumberFormat("da-DK", {
  style: "currency",
  currency: "DKK",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export default function ReviewClient({
  initialData,
  sessionId,
}: ReviewClientProps) {
  const router = useRouter();

  const [reviewData, setReviewData] = useState<ReviewData | null>(
    initialData || null
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchReviewData = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = sessionId ? `/api/review?sessionId=${sessionId}` : "/api/review";

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setReviewData(data);
      } else {
        toast.error("Kunne ikke hente gennemsyn", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error fetching review data:", error);
      toast.error("Kunne ikke hente gennemsyn", {
        description: "Prøv venligst igen senere.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchReviewData();
  }, [fetchReviewData]);

  const handleConfirm = async () => {
    if (!reviewData) return;

    try {
      setIsConfirming(true);
      const response = await fetch("/api/review/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: reviewData.session.id }),
      });

      if (response.ok) {
        toast.success("Gennemsyn bekræftet");
        router.push("/dashboard");
      } else {
        const data = await response.json();
        toast.error("Kunne ikke bekræfte gennemsyn", {
          description: data.error,
        });
      }
    } catch (error) {
      console.error("Error confirming review:", error);
      toast.error("Kunne ikke bekræfte gennemsyn", {
        description: "Prøv venligst igen senere.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const valueVarianceTone = useMemo(() => {
    if (!reviewData) return "bg-muted text-muted-foreground";
    const v = reviewData.summary.totalValueVariance;
    if (v < 0)
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    if (v > 0)
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
    return "bg-primary/10 text-primary";
  }, [reviewData]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <PageHeader />
        <Card className="items-center gap-3 py-16 text-center">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-muted-foreground">Henter gennemsyn...</p>
        </Card>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <PageHeader />
        <Card className="items-center gap-3 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <ScanSearch className="size-6 text-muted-foreground" aria-hidden />
          </div>
          <p className="text-sm text-muted-foreground">
            Ingen lagerstatus tilgængelig til gennemsyn.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Tilbage til oversigt</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const { session, summary, checkResults } = reviewData;
  const isCompleted = session.status === "Completed";
  const statusMeta = getStatusMeta(session.status);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 pb-28 sm:pb-8">
      <PageHeader status={session.status} statusLabel={statusMeta.label} statusPill={statusMeta.pill} />

      {/* Session meta */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="size-4" aria-hidden />
          {getLocationName(session.locationId)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4" aria-hidden />
          {formatDateDa(session.date)}
        </span>
        {session.name && (
          <span className="inline-flex items-center gap-1.5">
            <User className="size-4" aria-hidden />
            {session.name}
          </span>
        )}
      </div>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatsCard
          title="Manglende varer"
          value={summary.missingItems}
          icon={PackageX}
          tone="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
        />
        <StatsCard
          title="Uoverensstemmelser"
          value={summary.totalDiscrepancies}
          icon={ScanSearch}
          tone="bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
        />
        <StatsCard
          title="Værdiafvigelse"
          value={formatCurrency(summary.totalValueVariance)}
          icon={Coins}
          tone={valueVarianceTone}
        />
      </section>

      {/* Discrepancies */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Uoverensstemmelser
        </h2>

        {checkResults.length === 0 ? (
          <Card className="items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-6 text-primary" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">
              Ingen uoverensstemmelser. Alle varer stemmer med det forventede.
            </p>
          </Card>
        ) : (
          <>
            {/* Desktop: table */}
            <Card className="hidden overflow-hidden py-0 md:block">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-5 py-3">Vare</TableHead>
                    <TableHead className="px-5 py-3 text-center">
                      Forventet
                    </TableHead>
                    <TableHead className="px-5 py-3 text-center">
                      Optalt
                    </TableHead>
                    <TableHead className="px-5 py-3 text-center">
                      Afvigelse
                    </TableHead>
                    <TableHead className="px-5 py-3 text-right">Værdi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkResults.map((item) => (
                    <TableRow key={item.id} className="[&>td]:px-5 [&>td]:py-3">
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-tight">
                            {item.name}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {item.article}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">
                        {item.expectedQty}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {item.countedQty}
                      </TableCell>
                      <TableCell className="text-center">
                        <VarianceBadge variance={item.variance} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium tabular-nums",
                          item.value < 0
                            ? "text-red-600 dark:text-red-400"
                            : item.value > 0
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-muted-foreground"
                        )}
                      >
                        {formatCurrency(item.value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile: cards */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {checkResults.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{item.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {item.article}
                      </p>
                    </div>
                    <VarianceBadge variance={item.variance} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Forventet{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {item.expectedQty}
                      </span>
                      <span className="mx-1.5">·</span>
                      Optalt{" "}
                      <span className="font-medium tabular-nums text-foreground">
                        {item.countedQty}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "font-medium tabular-nums",
                        item.value < 0
                          ? "text-red-600 dark:text-red-400"
                          : item.value > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground"
                      )}
                    >
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Sticky confirm bar */}
      <div className="sticky bottom-4 z-10">
        <div className="flex flex-col gap-3 rounded-xl border bg-card/90 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/75 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
            {isCompleted
              ? "Denne lagerstatus er gennemført."
              : "Bekræft for at markere lagerstatussen som gennemført."}
          </p>
          <Button
            className="w-full sm:w-auto"
            onClick={handleConfirm}
            disabled={isConfirming || isCompleted}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 />
                Gennemført
              </>
            ) : isConfirming ? (
              <>
                <LoadingSpinner size="sm" className="text-current" />
                Bekræfter...
              </>
            ) : (
              <>
                <CheckCircle2 />
                Bekræft gennemsyn
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  status?: string;
  statusLabel?: string;
  statusPill?: string;
}

function PageHeader({ status, statusLabel, statusPill }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tilbage til oversigt
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Gennemsyn
          </h1>
          <p className="text-sm text-muted-foreground">
            Gennemgå afvigelser og bekræft lagerstatussen.
          </p>
        </div>
      </div>
    </header>
  );
}

function VarianceBadge({ variance }: { variance: number }) {
  if (variance === 0) {
    return <span className="text-sm tabular-nums text-muted-foreground">0</span>;
  }
  const positive = variance > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums",
        positive
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
          : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
      )}
    >
      {positive ? `+${variance}` : variance}
    </span>
  );
}
