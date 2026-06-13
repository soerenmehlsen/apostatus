import { memo } from "react";
import { CircleDot, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatusMeta } from "@/lib/dashboard-display";

const STATUS_ICON: Record<string, typeof CircleDot> = {
  "in progress": CircleDot,
  review: Clock,
  completed: CheckCircle2,
};

interface StatusPillProps {
  status: string;
  className?: string;
}

/** Colored status pill with a Danish label and matching icon. */
const StatusPill = memo(({ status, className }: StatusPillProps) => {
  const meta = getStatusMeta(status);
  const Icon = STATUS_ICON[status.toLowerCase()] ?? CircleDot;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        meta.pill,
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  );
});

StatusPill.displayName = "StatusPill";

export default StatusPill;
