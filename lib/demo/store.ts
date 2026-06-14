import { DemoState } from "./types";
import { createInitialDemoState } from "./fixtures";

const STORAGE_KEY = "apostatus_demo_state";

// Holder demo-state i hele besøget. sessionStorage gør at ændringer
// overlever navigation men nulstilles når fanen lukkes eller demoen afsluttes.

export function getDemoState(): DemoState {
  if (typeof window === "undefined") {
    return createInitialDemoState();
  }
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DemoState;
    } catch {
      // Korrupt state — start forfra.
    }
  }
  const initial = createInitialDemoState();
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function setDemoState(state: DemoState): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Læs, mutér og gem i én operation. Returnerer den opdaterede state. */
export function updateDemoState(
  mutate: (state: DemoState) => void
): DemoState {
  const state = getDemoState();
  mutate(state);
  setDemoState(state);
  return state;
}

/** Rydder demo-state. Kaldes af "Afslut demo". */
export function resetDemoState(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
