// Archive-specific types (transformed for the archive UI).
// The archive only ever deals with completed stocktakes.

/** One completed stocktake as shown in the archive list. */
export interface ArchiveSessionSummary {
  id: string;
  /** ISO date (yyyy-mm-dd) of when the session was created. */
  date: string;
  createdBy: string | null;
  /** De-duplicated location codes (e.g. ["101", "103"]). */
  locations: string[];
  /** Number of items whose counted quantity differed from expected. */
  discrepancies: number;
  /** Summed value of all discrepancies (DKK, can be negative). */
  valueVariance: number;
}

/** Completed stocktakes grouped under a single calendar year. */
export interface ArchiveYearGroup {
  year: number;
  sessions: ArchiveSessionSummary[];
  totalSessions: number;
  totalDiscrepancies: number;
  totalValueVariance: number;
}

/** One counted product line on the archive detail page. */
export interface ArchiveDetailItem {
  id: string;
  article: string | null;
  name: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  /** variance * unit price (DKK). */
  value: number;
}

/** Full read-only detail of a single archived stocktake. */
export interface ArchiveDetail {
  session: {
    id: string;
    date: string;
    /** De-duplicated location codes. */
    locations: string[];
    createdBy: string | null;
  };
  summary: {
    missingItems: number;
    totalDiscrepancies: number;
    totalValueVariance: number;
    /** Total number of counted items (the full list, not just discrepancies). */
    itemCount: number;
  };
  /** Every counted item, sorted with the largest discrepancies first. */
  items: ArchiveDetailItem[];
}
