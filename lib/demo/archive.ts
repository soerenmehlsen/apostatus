import {
  ArchiveDetail,
  ArchiveDetailItem,
  ArchiveSessionSummary,
  ArchiveYearGroup,
} from "@/types/archive";
import { createInitialDemoState } from "./fixtures";

// Beregner arkiv-data fra base-fixtures (kun gennemførte sessioner), med
// samme udregning som lib/archive-server.ts. Server-safe (ingen DB).

export function getDemoArchiveData(): { years: ArchiveYearGroup[] } {
  const state = createInitialDemoState();
  const sessions = state.sessions
    .filter((s) => s.status === "Completed")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const byYear = new Map<number, ArchiveYearGroup>();

  for (const session of sessions) {
    const checks = state.checks.filter((c) => c.sessionId === session.id);
    let discrepancies = 0;
    let valueVariance = 0;

    for (const check of checks) {
      const product = state.products.find((p) => p.id === check.productId);
      const expected = product?.expectedQty ?? 0;
      const variance = check.countedQty - expected;
      if (variance !== 0) {
        discrepancies += 1;
        valueVariance += variance * (product?.price ?? 0);
      }
    }

    const date = session.createdAt.split("T")[0];
    const year = Number(date.slice(0, 4));
    const locations = Array.from(
      new Set(
        state.files
          .filter((f) => f.stocktakeSessionId === session.id)
          .map((f) => f.location)
      )
    );

    const summary: ArchiveSessionSummary = {
      id: session.id,
      date,
      createdBy: session.createdBy,
      locations,
      discrepancies,
      valueVariance,
    };

    let group = byYear.get(year);
    if (!group) {
      group = {
        year,
        sessions: [],
        totalSessions: 0,
        totalDiscrepancies: 0,
        totalValueVariance: 0,
      };
      byYear.set(year, group);
    }
    group.sessions.push(summary);
    group.totalSessions += 1;
    group.totalDiscrepancies += discrepancies;
    group.totalValueVariance += valueVariance;
  }

  return { years: Array.from(byYear.values()).sort((a, b) => b.year - a.year) };
}

export function getDemoArchiveDetail(sessionId: string): ArchiveDetail | null {
  const state = createInitialDemoState();
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session || session.status !== "Completed") {
    return null;
  }

  const checks = state.checks.filter((c) => c.sessionId === session.id);
  const items: ArchiveDetailItem[] = checks.map((check) => {
    const product = state.products.find((p) => p.id === check.productId);
    const expectedQty = product?.expectedQty ?? 0;
    const variance = check.countedQty - expectedQty;
    const value = variance * (product?.price ?? 0);
    return {
      id: check.id,
      article: product?.sku ?? null,
      name: product?.name ?? "",
      expectedQty,
      countedQty: check.countedQty,
      variance,
      value,
      reason: check.reason,
    };
  });

  items.sort(
    (a, b) =>
      Math.abs(b.variance) - Math.abs(a.variance) ||
      a.name.localeCompare(b.name, "da")
  );

  const discrepancyItems = items.filter((item) => item.variance !== 0);
  const locations = Array.from(
    new Set(
      state.files
        .filter((f) => f.stocktakeSessionId === session.id)
        .map((f) => f.location)
    )
  );

  return {
    session: {
      id: session.id,
      date: session.createdAt.split("T")[0],
      locations,
      createdBy: session.createdBy,
    },
    summary: {
      missingItems: discrepancyItems.filter((i) => i.variance < 0).length,
      totalDiscrepancies: discrepancyItems.length,
      totalValueVariance: discrepancyItems.reduce((s, i) => s + i.value, 0),
      itemCount: items.length,
    },
    items,
  };
}
