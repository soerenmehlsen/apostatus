import { DemoState } from "./types";
import { getDemoState, updateDemoState } from "./store";
import { DEMO_USER } from "./fixtures";
import { LOCATION_MAP, SessionStatus } from "@/types/api";

export interface DemoResponse {
  status: number;
  body: unknown;
}

function locationName(id: string): string {
  return LOCATION_MAP[id] || `Location ${id}`;
}

// Auth.js-stil ApiResponse-wrapper (matcher lib/api-response.ts).
function apiSuccess(data: unknown, message?: string) {
  return {
    data,
    success: true,
    timestamp: new Date().toISOString(),
    ...(message ? { message } : {}),
  };
}

function parsePath(url: string): { path: string; params: URLSearchParams } {
  // url kan være relativ (/api/...) eller absolut. Brug en dummy-base.
  const u = new URL(url, "http://demo.local");
  return { path: u.pathname, params: u.searchParams };
}

/**
 * Besvarer et /api/*-kald fra demo-lageret. Returnerer null hvis ruten ikke
 * håndteres (så det rigtige fetch får lov at køre videre).
 */
export function handleDemoRequest(
  url: string,
  method: string,
  body: unknown
): DemoResponse | null {
  const { path, params } = parsePath(url);

  // --- Dashboard ---
  if (path === "/api/dashboard" && method === "GET") {
    const state = getDemoState();
    return { status: 200, body: apiSuccess(dashboardData(state)) };
  }

  // --- Database-status (altid "connected" i demo) ---
  if (path === "/api/databasestatus" && method === "GET") {
    return { status: 200, body: apiSuccess({ connected: true }) };
  }

  // --- Stock check data ---
  if (path === "/api/stockcheck/stockdata" && method === "GET") {
    const state = getDemoState();
    return {
      status: 200,
      body: apiSuccess(stockData(state, params.get("sessionId"))),
    };
  }

  // --- Gem optælling(er) ---
  if (path === "/api/stockcheck/saveproduct" && method === "POST") {
    return saveProduct(body);
  }
  if (path === "/api/stockcheck/saveproduct" && method === "DELETE") {
    return deleteProduct(body);
  }

  // --- Afslut optælling (In Progress -> Review) ---
  if (path === "/api/stockcheck/completecheck" && method === "POST") {
    return completeCheck(body);
  }

  // --- Gennemsyn ---
  if (path === "/api/review" && method === "GET") {
    return reviewData(params.get("sessionId"));
  }
  if (path === "/api/review/confirm" && method === "POST") {
    return confirmReview(body);
  }

  // --- Ny lagerstatus: ledige filer/lokationer ---
  if (path === "/api/newstocktake" && method === "GET") {
    const state = getDemoState();
    return { status: 200, body: newStocktakeData(state) };
  }

  // --- Opret session ---
  if (path === "/api/newsession" && method === "POST") {
    return createSession(body);
  }

  // --- Upload: liste / sletning / (deaktiveret) upload ---
  if (path === "/api/upload" && method === "GET") {
    const state = getDemoState();
    return { status: 200, body: { files: uploadFiles(state) } };
  }
  if (path === "/api/upload" && method === "DELETE") {
    const fileId = params.get("id");
    updateDemoState((s) => {
      s.files = s.files.filter((f) => f.id !== fileId);
      s.products = s.products.filter((p) => p.fileId !== fileId);
    });
    return { status: 200, body: { success: true } };
  }
  if (path === "/api/upload" && method === "POST") {
    return {
      status: 400,
      body: { error: "Filupload er ikke tilgængelig i demoen." },
    };
  }

  return null;
}

// ---- Databyggere (matcher hvert endpoints svar-form) ----

function dashboardData(state: DemoState) {
  const sorted = [...state.sessions].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  const sessions = sorted.slice(0, 10).map((session) => ({
    id: session.id,
    name: session.createdBy || "Unknown",
    date: session.createdAt.split("T")[0],
    status: session.status,
    location: state.files
      .filter((f) => f.stocktakeSessionId === session.id)
      .map((f) => f.location),
    stockChecksCount: state.checks.filter((c) => c.sessionId === session.id)
      .length,
  }));

  const countByStatus = (status: SessionStatus) =>
    state.sessions.filter((s) => s.status === status).length;
  const totalSessions = state.sessions.length;
  const completedSessions = countByStatus("Completed");
  const reviewSessions = countByStatus("Review");

  return {
    sessions,
    stats: {
      totalSessions,
      completedSessions,
      reviewSessions,
      needsReview: reviewSessions,
    },
  };
}

function stockData(state: DemoState, sessionId: string | null) {
  const products = state.products
    .filter((p) => {
      if (!sessionId) return false;
      const file = state.files.find((f) => f.id === p.fileId);
      return file?.stocktakeSessionId === sessionId;
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
      location: p.location,
      expectedQty: p.expectedQty,
    }));

  const locationIds = [...new Set(products.map((p) => p.location))];
  const locations = locationIds.map((id) => ({ id, name: locationName(id) }));

  const checks = sessionId
    ? state.checks
        .filter((c) => c.sessionId === sessionId)
        .map((c) => ({
          productId: c.productId,
          countedQty: c.countedQty,
          expectedQty: c.expectedQty,
          variance: c.variance,
          checkedBy: c.checkedBy,
          status: c.status,
          reason: c.reason,
        }))
    : [];

  return { products, locations, checks, totalProducts: products.length };
}

interface IncomingCheck {
  productId: string;
  sessionId: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  status: string;
  reason?: string | null;
}

function upsertCheck(state: DemoState, data: IncomingCheck) {
  const existing = state.checks.find(
    (c) => c.productId === data.productId && c.sessionId === data.sessionId
  );
  if (existing) {
    existing.countedQty = data.countedQty;
    existing.variance = data.variance;
    existing.checkedBy = DEMO_USER;
    existing.status = data.status as DemoState["checks"][number]["status"];
    existing.reason = data.reason ?? null;
    existing.checkedAt = new Date().toISOString();
    return existing;
  }
  const created: DemoState["checks"][number] = {
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: data.productId,
    sessionId: data.sessionId,
    expectedQty: data.expectedQty,
    countedQty: data.countedQty,
    variance: data.variance,
    checkedBy: DEMO_USER,
    status: data.status as DemoState["checks"][number]["status"],
    reason: data.reason ?? null,
    checkedAt: new Date().toISOString(),
  };
  state.checks.push(created);
  return created;
}

function saveProduct(body: unknown): DemoResponse {
  if (Array.isArray(body)) {
    const stockChecks: unknown[] = [];
    updateDemoState((s) => {
      for (const item of body as IncomingCheck[]) {
        stockChecks.push(upsertCheck(s, item));
      }
    });
    return { status: 200, body: { success: true, stockChecks } };
  }
  let stockCheck: unknown;
  updateDemoState((s) => {
    stockCheck = upsertCheck(s, body as IncomingCheck);
  });
  return { status: 200, body: { success: true, stockCheck } };
}

function deleteProduct(body: unknown): DemoResponse {
  const { productId, sessionId } = (body ?? {}) as {
    productId?: string;
    sessionId?: string;
  };
  if (!productId || !sessionId) {
    return {
      status: 400,
      body: { error: "productId and sessionId are required" },
    };
  }
  updateDemoState((s) => {
    s.checks = s.checks.filter(
      (c) => !(c.productId === productId && c.sessionId === sessionId)
    );
  });
  return { status: 200, body: { success: true } };
}

function completeCheck(body: unknown): DemoResponse {
  const { sessionId } = (body ?? {}) as { sessionId?: string };
  let session: unknown;
  updateDemoState((s) => {
    const target = s.sessions.find((x) => x.id === sessionId);
    if (target) {
      target.status = "Review";
      session = target;
    }
  });
  // Ukendt session -> 404, så UI'et ikke får success med session: undefined.
  if (!session) {
    return { status: 404, body: { error: "Failed to complete stocktake" } };
  }
  return {
    status: 200,
    body: {
      success: true,
      message: "Stocktake completed successfully",
      session,
    },
  };
}

function reviewData(sessionId: string | null): DemoResponse {
  const state = getDemoState();
  const session = sessionId
    ? state.sessions.find((s) => s.id === sessionId)
    : [...state.sessions]
        .filter((s) => s.status === "Review" || s.status === "Completed")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  if (!session) {
    return { status: 404, body: { error: "No stocktake session found for review" } };
  }

  const checks = state.checks.filter((c) => c.sessionId === session.id);
  const checkResults = checks
    .map((check) => {
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
    })
    .filter((item) => item.variance !== 0);

  const missingItems = checkResults.filter((i) => i.variance < 0).length;
  const totalValueVariance = checkResults.reduce((sum, i) => sum + i.value, 0);
  const file = state.files.find((f) => f.stocktakeSessionId === session.id);
  const location = file?.location ?? "Unknown";

  return {
    status: 200,
    body: {
      session: {
        id: session.id,
        date: session.createdAt.split("T")[0],
        location: locationName(location),
        locationId: location,
        status: session.status,
        name: session.name,
      },
      summary: {
        missingItems,
        totalValueVariance,
        totalDiscrepancies: checkResults.length,
      },
      checkResults,
    },
  };
}

function confirmReview(body: unknown): DemoResponse {
  const { sessionId } = (body ?? {}) as { sessionId?: string };
  if (!sessionId) {
    return { status: 400, body: { error: "Session ID is required" } };
  }
  const state = getDemoState();
  const session = state.sessions.find((s) => s.id === sessionId);
  if (!session) {
    return { status: 404, body: { error: "Session not found" } };
  }
  if (session.status === "Completed") {
    return { status: 400, body: { error: "Session is already completed" } };
  }
  updateDemoState((s) => {
    const target = s.sessions.find((x) => x.id === sessionId);
    if (target) target.status = "Completed";
  });
  return {
    status: 200,
    body: {
      message: "Review confirmed successfully",
      sessionId,
      status: "Completed",
    },
  };
}

function newStocktakeData(state: DemoState) {
  const files = state.files.map((f) => ({
    id: f.id,
    filename: f.filename,
    uploadDate: f.uploadDate,
    location: f.location,
    productCount: f.productCount,
  }));

  // Lokationer udledes af produkter (samme som det rigtige endpoint), så kun
  // lokationer med faktiske varer kan vælges.
  const counts = new Map<string, number>();
  for (const p of state.products) {
    counts.set(p.location, (counts.get(p.location) ?? 0) + 1);
  }
  const locations = [...counts.entries()].map(([id, productCount]) => ({
    id,
    name: locationName(id),
    productCount,
  }));

  return { files, locations };
}

function createSession(body: unknown): DemoResponse {
  const { locations } = (body ?? {}) as { locations?: string[] };
  const selected = locations ?? [];
  const sessionId = `s-${Date.now()}`;
  let linkedFiles = 0;

  updateDemoState((s) => {
    s.sessions.unshift({
      id: sessionId,
      name: `Stocktake - ${DEMO_USER}`,
      status: "In Progress",
      createdAt: new Date().toISOString(),
      createdBy: DEMO_USER,
    });
    // Knyt ledige filer for de valgte lokationer til den nye session.
    for (const file of s.files) {
      if (
        file.stocktakeSessionId === null &&
        selected.includes(file.location)
      ) {
        file.stocktakeSessionId = sessionId;
        linkedFiles += 1;
      }
    }
  });

  return {
    status: 201,
    body: apiSuccess(
      { sessionId, linkedFiles },
      "Stocktake session created successfully"
    ),
  };
}

function uploadFiles(state: DemoState) {
  return state.files.map((f) => ({
    id: f.id,
    filename: f.filename,
    uploadDate: f.uploadDate,
    location: f.location,
    productCount: f.productCount,
  }));
}
