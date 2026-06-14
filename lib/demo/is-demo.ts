// Fælles demo-helpers der kan importeres fra både klient og server.
// VIGTIGT: må ikke importere next/headers (ville bryde klient-bundlen).

export const DEMO_COOKIE = "apostatus_demo";

/** Læser demo-cookien fra document.cookie. Kun til brug i browseren. */
export function isDemoClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((entry) => entry === `${DEMO_COOKIE}=1`);
}
