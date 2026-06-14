"use client";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
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
import {
  formatCurrency,
  getLocationNames,
  valueVarianceText,
} from "@/lib/dashboard-display";
import { cn } from "@/lib/utils";
import type { ArchiveSessionSummary, ArchiveYearGroup } from "@/types/archive";

interface ArchiveYearSectionProps {
  group: ArchiveYearGroup;
  open: boolean;
  onToggle: () => void;
  formatDate: (date: string) => string;
}

export default function ArchiveYearSection({
  group,
  open,
  onToggle,
  formatDate,
}: ArchiveYearSectionProps) {
  const sessionLabel =
    group.totalSessions === 1 ? "status" : "statusser";

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/40"
      >
        {open ? (
          <ChevronDown className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <span className="text-lg font-semibold tracking-tight tabular-nums">
          {group.year}
        </span>
        <span className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">
            {group.totalSessions} {sessionLabel}
          </span>
          <span className="text-muted-foreground">
            {group.totalDiscrepancies} afvigelser
          </span>
          <span
            className={cn(
              "font-medium tabular-nums",
              valueVarianceText(group.totalValueVariance)
            )}
          >
            {formatCurrency(group.totalValueVariance)}
          </span>
        </span>
      </button>

      {open && (
        <div className="border-t">
          {/* Desktop: table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-5 py-3">Lokation</TableHead>
                  <TableHead className="px-5 py-3">Oprettet af</TableHead>
                  <TableHead className="px-5 py-3">Dato</TableHead>
                  <TableHead className="px-5 py-3 text-center">
                    Afvigelser
                  </TableHead>
                  <TableHead className="px-5 py-3 text-right">
                    Værdiafvigelse
                  </TableHead>
                  <TableHead className="px-5 py-3 text-right">
                    <span className="sr-only">Handling</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_td:first-child]:px-5 [&_td:last-child]:px-5">
                {group.sessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    formatDate={formatDate}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
            {group.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                formatDate={formatDate}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function creatorLabel(createdBy: string | null): string {
  return createdBy && createdBy !== "Unknown" ? createdBy : "Ukendt";
}

function LocationCodes({ locations }: { locations: string[] }) {
  const codes = Array.from(new Set(locations));
  if (codes.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {codes.map((code) => (
        <span
          key={code}
          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80"
        >
          {code}
        </span>
      ))}
    </div>
  );
}

function SessionRow({
  session,
  formatDate,
}: {
  session: ArchiveSessionSummary;
  formatDate: (date: string) => string;
}) {
  const names = getLocationNames(session.locations);

  return (
    <TableRow className="group">
      <TableCell className="py-3">
        <div className="space-y-1">
          <LocationCodes locations={session.locations} />
          {names.length > 0 && (
            <p className="text-xs text-muted-foreground">{names.join(", ")}</p>
          )}
        </div>
      </TableCell>
      <TableCell className="py-3 text-sm">{creatorLabel(session.createdBy)}</TableCell>
      <TableCell className="py-3 text-sm text-muted-foreground tabular-nums">
        {formatDate(session.date)}
      </TableCell>
      <TableCell className="py-3 text-center text-sm tabular-nums">
        {session.discrepancies}
      </TableCell>
      <TableCell
        className={cn(
          "py-3 text-right text-sm font-medium tabular-nums",
          valueVarianceText(session.valueVariance)
        )}
      >
        {formatCurrency(session.valueVariance)}
      </TableCell>
      <TableCell className="py-3 text-right">
        <Link
          href={`/archive/${session.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground"
        >
          Se optælling
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </TableCell>
    </TableRow>
  );
}

function SessionCard({
  session,
  formatDate,
}: {
  session: ArchiveSessionSummary;
  formatDate: (date: string) => string;
}) {
  return (
    <Link
      href={`/archive/${session.id}`}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50 active:bg-accent"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <LocationCodes locations={session.locations} />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5" aria-hidden />
            {creatorLabel(session.createdBy)}
          </span>
          <span className="tabular-nums">{formatDate(session.date)}</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            {session.discrepancies} afvigelser
          </span>
          <span
            className={cn(
              "font-medium tabular-nums",
              valueVarianceText(session.valueVariance)
            )}
          >
            {formatCurrency(session.valueVariance)}
          </span>
        </div>
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}
