import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DashboardSession, BadgeVariant } from "@/types/dashboard";
import Link from "next/link";

interface SessionTableRowProps {
  session: DashboardSession;
  formatDate: (date: string) => string;
  getBadgeVariant: (status: string) => BadgeVariant;
}

const SessionTableRow = memo(({ 
  session, 
  formatDate, 
  getBadgeVariant 
}: SessionTableRowProps) => (
  <TableRow>
    <TableCell className="font-medium">{session.location}</TableCell>
    <TableCell>{session.name}</TableCell>
    <TableCell>{formatDate(session.date)}</TableCell>
    <TableCell>
      <Badge className="w-20" variant={getBadgeVariant(session.status)}>
        {session.status}
      </Badge>
    </TableCell>
    <TableCell>
      <Link href={`/review?sessionId=${session.id}`}>
      <Button variant="link" size="sm">
        View Details
      </Button>
      </Link>
    </TableCell>
  </TableRow>
));

SessionTableRow.displayName = 'SessionTableRow';

export default SessionTableRow;