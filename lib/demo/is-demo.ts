// Fælles demo-helpers der kan importeres fra både klient og server.
// VIGTIGT: må ikke importere next/headers (ville bryde klient-bundlen).

export const DEMO_COOKIE = "apostatus_demo";
/** Sentinel-værdien der markerer en aktiv demo. Holdes ét sted, da den
 * sættes og tjekkes flere steder (route, proxy, server- og klient-helper). */
export const DEMO_COOKIE_VALUE = "1";

/** Læser demo-cookien fra document.cookie. Kun til brug i browseren. */
export function isDemoClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((entry) => entry === `${DEMO_COOKIE}=${DEMO_COOKIE_VALUE}`);
}
