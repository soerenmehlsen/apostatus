import { LOCATION_MAP } from "@/types/api";
import type { SessionStatus } from "@/types/api";

/**
 * Display helpers for the dashboard. Pure presentation — no data is changed,
 * only how it is shown to the staff (Danish labels, readable location names,
 * relative dates).
 */

export type StatusKey = "in progress" | "review" | "completed";

export interface StatusMeta {
  /** Danish label shown to the user. */
  label: string;
  /** Tailwind classes for the colored status pill. */
  pill: string;
  /** Tailwind text color for accompanying icons. */
  accent: string;
}

const STATUS_META: Record<StatusKey, StatusMeta> = {
  "in progress": {
    label: "Igangværende",
    pill: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
    accent: "text-sky-600 dark:text-sky-400",
  },
  review: {
    label: "Gennemsyn",
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
    accent: "text-amber-600 dark:text-amber-400",
  },
  completed: {
    label: "Gennemført",
    pill: "bg-primary/10 text-primary ring-primary/20 dark:bg-primary/15 dark:text-primary dark:ring-primary/25",
    accent: "text-primary",
  },
};

const FALLBACK_STATUS: StatusMeta = {
  label: "Ukendt",
  pill: "bg-muted text-muted-foreground ring-border",
  accent: "text-muted-foreground",
};

export function getStatusMeta(status: string): StatusMeta {
  return STATUS_META[status.toLowerCase() as StatusKey] ?? FALLBACK_STATUS;
}

export function isInProgress(status: SessionStatus | string): boolean {
  return status.toLowerCase() === "in progress";
}

export function isReview(status: SessionStatus | string): boolean {
  return status.toLowerCase() === "review";
}

/**
 * Maps a stored location value to a human-readable name. Values are usually
 * location codes (e.g. "101"); if a value is already a name it is returned
 * untouched.
 */
export function getLocationName(value: string): string {
  return LOCATION_MAP[value] ?? value;
}

/** De-duplicated, readable location names for a session. */
export function getLocationNames(locations: string[]): string[] {
  return Array.from(new Set(locations.map(getLocationName)));
}

const dateFormatter = new Intl.DateTimeFormat("da-DK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDateDa(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return dateFormatter.format(date);
}

/**
 * Danish relative time, e.g. "i dag", "i går", "for 3 dage siden".
 * Falls back to an absolute date for anything older than ~30 days.
 */
export function formatRelativeDa(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000
  );

  if (days <= 0) return "i dag";
  if (days === 1) return "i går";
  if (days < 7) return `for ${days} dage siden`;
  if (days < 14) return "for en uge siden";
  if (days < 30) return `for ${Math.floor(days / 7)} uger siden`;
  return formatDateDa(dateString);
}

/** Danish pluralisation for counted items. */
export function itemsCountedLabel(count: number): string {
  return `${count} ${count === 1 ? "vare" : "varer"} talt`;
}

export interface SessionAction {
  label: string;
  href: string;
}

/** Primary row/card action, routed by status. */
export function getSessionAction(id: string, status: string): SessionAction {
  switch (status.toLowerCase()) {
    case "in progress":
      return { label: "Fortsæt optælling", href: `/stocktake/check?sessionId=${id}` };
    case "review":
      return { label: "Gennemse", href: `/review?sessionId=${id}` };
    default:
      return { label: "Se detaljer", href: `/review?sessionId=${id}` };
  }
}
