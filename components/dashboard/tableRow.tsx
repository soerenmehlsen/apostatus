import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { StocktakeSession, BadgeVariant } from "@/types/dashboard";

interface SessionTableRowProps {
  session: StocktakeSession;
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
      <Button variant="link" size="sm">
        View Details
      </Button>
    </TableCell>
  </TableRow>
));

SessionTableRow.displayName = 'SessionTableRow';

export default SessionTableRow;