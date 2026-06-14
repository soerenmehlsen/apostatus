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

const SessionTableRow = memo(
  ({ session, formatDate }: SessionTableRowProps) => {
    const locationNames = getLocationNames(session.location);
    const locationCodes = Array.from(new Set(session.location));
    const action = getSessionAction(session.id, session.status);
    const creator =
      session.name && session.name !== "Unknown" ? session.name : "Ukendt";

    return (
      <TableRow className="group">
        <TableCell className="py-3">
          <div className="flex flex-wrap gap-1.5">
            {locationCodes.length > 0 ? (
              locationCodes.map((code) => (
                <span
                  key={code}
                  className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80"
                >
                  {code}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </TableCell>
        <TableCell className="py-3">
          <div className="flex flex-wrap gap-1.5">
            {locationNames.length > 0 ? (
              locationNames.map((name) => (
                <span key={name} className="text-sm text-foreground">
                  {name}
                </span>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </TableCell>
        <TableCell className="py-3">
          <span className="text-sm text-foreground">{creator}</span>
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
