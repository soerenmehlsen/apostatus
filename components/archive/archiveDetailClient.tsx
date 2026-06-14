"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Coins,
  Download,
  ListChecks,
  PackageX,
  ScanSearch,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/statsCard";
import { VarianceBadge } from "@/components/ui/variance-badge";
import {
  formatCurrency,
  formatDateDa,
  getLocationNames,
  getVarianceReasonLabel,
  valueVarianceText,
  valueVarianceTone,
} from "@/lib/dashboard-display";
import { csvNumber, downloadCsv, toCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import type { ArchiveDetail } from "@/types/archive";

interface ArchiveDetailClientProps {
  detail: ArchiveDetail;
}

function slugifyForFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ArchiveDetailClient({
  detail,
}: ArchiveDetailClientProps) {
  const [discrepanciesOnly, setDiscrepanciesOnly] = useState(false);

  const { session, summary, items } = detail;
  const locationNames = getLocationNames(session.locations);
  const title = locationNames.length > 0 ? locationNames.join(", ") : "Lagerstatus";
  const creator =
    session.createdBy && session.createdBy !== "Unknown"
      ? session.createdBy
      : "Ukendt";

  const visibleItems = useMemo(
    () =>
      discrepanciesOnly ? items.filter((item) => item.variance !== 0) : items,
    [items, discrepanciesOnly]
  );

  const handleExport = () => {
    const csv = toCsv(
      ["Vare", "Varenr.", "Forventet", "Optalt", "Afvigelse", "Årsag", "Værdi (DKK)"],
      items.map((item) => [
        item.name,
        item.article ?? "",
        item.expectedQty,
        item.countedQty,
        item.variance,
        getVarianceReasonLabel(item.reason),
        csvNumber(item.value),
      ])
    );
    const namePart = slugifyForFilename(title) || "lagerstatus";
    downloadCsv(`lagerstatus-${namePart}-${session.date}.csv`, csv);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Header */}
      <header className="space-y-3">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Tilbage til arkiv
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground">Arkiveret optælling</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download />
            Eksportér CSV
          </Button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden />
            {formatDateDa(session.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="size-4" aria-hidden />
            {creator}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-4" aria-hidden />
            {summary.itemCount} varer talt
          </span>
        </div>
      </header>

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
          tone={valueVarianceTone(summary.totalValueVariance)}
        />
      </section>

      {/* Item list */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Optælling</h2>
          {summary.totalDiscrepancies > 0 && (
            <button
              type="button"
              onClick={() => setDiscrepanciesOnly((prev) => !prev)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                discrepanciesOnly
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              )}
            >
              Kun afvigelser
            </button>
          )}
        </div>

        {visibleItems.length === 0 ? (
          <Card className="items-center gap-3 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-6 text-primary" aria-hidden />
            </div>
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? "Der blev ikke optalt nogen varer i denne lagerstatus."
                : "Ingen afvigelser. Alle varer stemmer med det forventede."}
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
                    <TableHead className="px-5 py-3 text-center">Optalt</TableHead>
                    <TableHead className="px-5 py-3 text-center">
                      Afvigelse
                    </TableHead>
                    <TableHead className="px-5 py-3">Årsag</TableHead>
                    <TableHead className="px-5 py-3 text-right">Værdi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleItems.map((item) => (
                    <TableRow key={item.id} className="[&>td]:px-5 [&>td]:py-3">
                      <TableCell>
                        <div className="min-w-0">
                          <p className="truncate font-medium leading-tight">
                            {item.name}
                          </p>
                          {item.article && (
                            <p className="font-mono text-xs text-muted-foreground">
                              {item.article}
                            </p>
                          )}
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
                      <TableCell className="text-sm text-muted-foreground">
                        {getVarianceReasonLabel(item.reason) || "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-medium tabular-nums",
                          valueVarianceText(item.value)
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
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{item.name}</p>
                      {item.article && (
                        <p className="font-mono text-xs text-muted-foreground">
                          {item.article}
                        </p>
                      )}
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
                        valueVarianceText(item.value)
                      )}
                    >
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  {getVarianceReasonLabel(item.reason) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Årsag:{" "}
                      <span className="text-foreground">
                        {getVarianceReasonLabel(item.reason)}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
