import { memo } from "react";
import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import StatusPill from "@/components/dashboard/statusPill";
import type { DashboardSession } from "@/types/dashboard";
import { getLocationNames, getSessionAction } from "@/lib/dashboard-display";

interface SessionCardProps {
  session: DashboardSession;
  formatDate: (date: string) => string;
}

/** Tappable session card used on small screens (table collapses to cards). */
const SessionCard = memo(({ session, formatDate }: SessionCardProps) => {
  const locations = getLocationNames(session.location);
  const action = getSessionAction(session.id, session.status);
  const creator =
    session.name && session.name !== "Unknown" ? session.name : "Ukendt";

  return (
    <Link
      href={action.href}
      className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50 active:bg-accent"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {locations.length > 0 ? (
            locations.map((name) => (
              <span
                key={name}
                className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80"
              >
                {name}
              </span>
            ))
          ) : (
            <span className="text-sm font-medium">Lagerstatus</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <User className="size-3.5" aria-hidden />
            {creator}
          </span>
          <span className="tabular-nums">{formatDate(session.date)}</span>
        </div>
        <StatusPill status={session.status} />
      </div>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
});

SessionCard.displayName = "SessionCard";

export default SessionCard;
