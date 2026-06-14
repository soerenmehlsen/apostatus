import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-500/15 dark:text-amber-200">
      <Info className="size-4 shrink-0" aria-hidden />
      <span>
        Demo-tilstand — alt er eksempeldata og gemmes ikke.
      </span>
    </div>
  );
}
