import { memo } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DashboardSession } from "@/types/dashboard";
import {
  getLocationNames,
  formatRelativeDa,
  itemsCountedLabel,
} from "@/lib/dashboard-display";

interface ActiveStocktakeCardProps {
  session: DashboardSession;
}

/**
 * Highlighted card for an in-progress stocktake. Gives staff a one-tap route
 * back into counting ("Fortsæt optælling").
 */
const ActiveStocktakeCard = memo(({ session }: ActiveStocktakeCardProps) => {
  const locations = getLocationNames(session.location);

  return (
    <div className="group flex flex-col gap-4 rounded-xl border border-sky-200/70 bg-gradient-to-br from-sky-50/80 to-card p-5 shadow-sm transition-shadow hover:shadow-md dark:border-sky-400/20 dark:from-sky-500/[0.07] dark:to-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="size-4 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden />
          <div className="flex flex-wrap gap-1.5">
            {locations.length > 0 ? (
              locations.map((name) => (
                <span
                  key={name}
                  className="rounded-md bg-sky-100/80 px-2 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-500/15 dark:text-sky-200"
                >
                  {name}
                </span>
              ))
            ) : (
              <span className="text-sm font-medium text-foreground">
                Lagerstatus
              </span>
            )}
          </div>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatRelativeDa(session.date)}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <PackageCheck className="size-4 text-sky-600 dark:text-sky-400" aria-hidden />
        <span className="font-medium text-foreground tabular-nums">
          {itemsCountedLabel(session.stockChecksCount)}
        </span>
        {session.name && session.name !== "Unknown" && (
          <span className="truncate">· {session.name}</span>
        )}
      </div>

      <Button asChild className="mt-auto w-full sm:w-auto">
        <Link href={`/stocktake/check?sessionId=${session.id}`}>
          Fortsæt optælling
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    </div>
  );
});

ActiveStocktakeCard.displayName = "ActiveStocktakeCard";

export default ActiveStocktakeCard;
