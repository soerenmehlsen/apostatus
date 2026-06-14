"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Archive as ArchiveIcon, Inbox, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ArchiveYearSection from "@/components/archive/yearSection";
import { getLocationNames, formatDateDa } from "@/lib/dashboard-display";
import { cn } from "@/lib/utils";
import type { ArchiveSessionSummary, ArchiveYearGroup } from "@/types/archive";

interface ArchiveClientProps {
  years: ArchiveYearGroup[];
}

/** Recompute a year's totals from a (possibly filtered) subset of sessions. */
function summariseYear(
  year: number,
  sessions: ArchiveSessionSummary[]
): ArchiveYearGroup {
  return {
    year,
    sessions,
    totalSessions: sessions.length,
    totalDiscrepancies: sessions.reduce((sum, s) => sum + s.discrepancies, 0),
    totalValueVariance: sessions.reduce((sum, s) => sum + s.valueVariance, 0),
  };
}

export default function ArchiveClient({ years }: ArchiveClientProps) {
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [openYears, setOpenYears] = useState<Set<number>>(
    () => new Set(years.length > 0 ? [years[0].year] : [])
  );

  // Distinct, readable location names across the whole archive (for filtering).
  const availableLocations = useMemo(() => {
    const names = new Set<string>();
    for (const group of years) {
      for (const session of group.sessions) {
        for (const name of getLocationNames(session.locations)) {
          names.add(name);
        }
      }
    }
    return Array.from(names).sort((a, b) => a.localeCompare(b, "da"));
  }, [years]);

  const isFiltering = query.trim() !== "" || locationFilter !== "all";

  const filteredYears = useMemo(() => {
    const q = query.trim().toLowerCase();

    return years
      .map((group) => {
        const sessions = group.sessions.filter((session) => {
          const locationNames = getLocationNames(session.locations);

          if (
            locationFilter !== "all" &&
            !locationNames.includes(locationFilter)
          ) {
            return false;
          }

          if (!q) return true;

          const haystack = [...locationNames, session.createdBy ?? ""]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });

        return summariseYear(group.year, sessions);
      })
      .filter((group) => group.sessions.length > 0);
  }, [years, query, locationFilter]);

  const toggleYear = (year: number) => {
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <PageHeader />

      {years.length === 0 ? (
        <EmptyState filtered={false} />
      ) : (
        <>
          {/* Search + location filter */}
          <section className="space-y-3">
            <div className="relative sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Søg lokation eller person..."
                className="pl-9"
                aria-label="Søg i arkivet"
              />
            </div>

            {availableLocations.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                <FilterPill
                  label="Alle lokationer"
                  active={locationFilter === "all"}
                  onClick={() => setLocationFilter("all")}
                />
                {availableLocations.map((name) => (
                  <FilterPill
                    key={name}
                    label={name}
                    active={locationFilter === name}
                    onClick={() => setLocationFilter(name)}
                  />
                ))}
              </div>
            )}
          </section>

          {filteredYears.length === 0 ? (
            <EmptyState filtered />
          ) : (
            <div className="space-y-4">
              {filteredYears.map((group) => (
                <ArchiveYearSection
                  key={group.year}
                  group={group}
                  open={isFiltering || openYears.has(group.year)}
                  onToggle={() => toggleYear(group.year)}
                  formatDate={formatDateDa}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <header className="space-y-3">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Tilbage til oversigt
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ArchiveIcon className="size-5" aria-hidden />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Arkiv
          </h1>
          <p className="text-sm text-muted-foreground">
            Gennemførte lagerstatusser samlet pr. år.
          </p>
        </div>
      </div>
    </header>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-xs"
          : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <Card className="items-center gap-3 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="size-6 text-muted-foreground" aria-hidden />
      </div>
      {filtered ? (
        <p className="text-sm text-muted-foreground">
          Ingen lagerstatusser matcher din søgning.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Der er ingen gennemførte lagerstatusser i arkivet endnu.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard">Tilbage til oversigt</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
