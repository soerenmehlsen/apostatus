import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StatusPill from "@/components/dashboard/statusPill";
import { ArrowRight } from "lucide-react";
import type { DashboardSession } from "@/types/dashboard";
import { getLocationNames, getSessionAction } from "@/lib/dashboard-display";
import Link from "next/link";

interface SessionTableRowProps {
  session: DashboardSession;
  formatDate: (date: string) => string;
}

function initialsOf(name: string): string {
  if (!name || name === "Unknown") return "—";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const SessionTableRow = memo(
  ({ session, formatDate }: SessionTableRowProps) => {
    const locations = getLocationNames(session.location);
    const action = getSessionAction(session.id, session.status);
    const creator =
      session.name && session.name !== "Unknown" ? session.name : "Ukendt";

    return (
      <TableRow className="group">
        <TableCell className="py-3">
          <div className="flex flex-wrap gap-1.5">
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
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initialsOf(session.name)}
            </span>
            <span className="text-sm text-foreground">{creator}</span>
          </div>
        </TableCell>
        <TableCell className="py-3 text-sm text-muted-foreground tabular-nums">
          {formatDate(session.date)}
        </TableCell>
        <TableCell className="py-3">
          <StatusPill status={session.status} />
        </TableCell>
        <TableCell className="py-3 text-right">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-muted-foreground group-hover:text-foreground"
          >
            <Link href={action.href}>
              {action.label}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </TableCell>
      </TableRow>
    );
  }
);

SessionTableRow.displayName = "SessionTableRow";

export default SessionTableRow;
