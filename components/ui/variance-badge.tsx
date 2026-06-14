import { cn } from "@/lib/utils";

/**
 * A compact, colored quantity-variance indicator.
 * Zero renders muted; a surplus is amber, a shortfall is red.
 */
export function VarianceBadge({ variance }: { variance: number }) {
  if (variance === 0) {
    return <span className="text-sm tabular-nums text-muted-foreground">0</span>;
  }
  const positive = variance > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums",
        positive
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
          : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
      )}
    >
      {positive ? `+${variance}` : variance}
    </span>
  );
}
