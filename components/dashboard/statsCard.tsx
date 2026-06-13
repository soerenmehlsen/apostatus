import { memo } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon tile (background + text color). */
  tone?: string;
}

const StatsCard = memo(
  ({ title, value, subtitle, icon: Icon, tone }: StatsCardProps) => (
    <Card className="group gap-0 py-0 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
            {subtitle && (
              <span className="ml-1.5 text-base font-normal text-muted-foreground">
                {subtitle}
              </span>
            )}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            tone ?? "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-5" aria-hidden />
        </div>
      </div>
    </Card>
  )
);

StatsCard.displayName = "StatsCard";

export default StatsCard;
