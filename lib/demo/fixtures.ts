import { DemoState, DemoProduct } from "./types";

export const DEMO_USER = "Demo-bruger";

// Hjælper til at holde produkt-fixtures kompakte.
function product(
  id: string,
  fileId: string,
  location: string,
  name: string,
  sku: string,
  price: number,
  qty: number
): DemoProduct {
  return {
    id,
    fileId,
    location,
    name,
    sku,
    price,
    quantity: qty,
    expectedQty: qty,
  };
}

// Returnerer et frisk eksempeldatasæt. Kaldes når der ikke findes gemt
// demo-state, og ved nulstilling. Datoer er faste, så demoen er forudsigelig.
export function createInitialDemoState(): DemoState {
  const products: DemoProduct[] = [
    // Ledige filer til "Ny lagerstatus" (ikke knyttet til en session endnu)
    product("p-101-1", "f-101", "101", "Panodil 500 mg, 100 stk", "100001", 38, 24),
    product("p-101-2", "f-101", "101", "Ipren 200 mg, 20 stk", "100002", 42, 30),
    product("p-101-3", "f-101", "101", "Treo 500 mg, 50 stk", "100003", 49, 18),
    product("p-101-4", "f-101", "101", "Kleenex servietter", "100004", 25, 40),
    product("p-103-1", "f-103", "103", "Insulin NovoRapid", "103001", 320, 12),
    product("p-103-2", "f-103", "103", "Øjendråber Systane", "103002", 89, 16),
    product("p-103-3", "f-103", "103", "Probiotika køl", "103003", 129, 9),

    // Igangværende session (delvist talt)
    product("p-102-1", "f-102", "102", "Zyrtec 10 mg, 30 stk", "102001", 79, 20),
    product("p-102-2", "f-102", "102", "Otrivin næsespray", "102002", 55, 25),
    product("p-102-3", "f-102", "102", "Imodium 12 stk", "102003", 64, 15),
    product("p-102-4", "f-102", "102", "Pamol 500 mg, 100 stk", "102004", 36, 28),

    // Session til gennemsyn (alle talt, nogle afvigelser)
    product("p-104-1", "f-104", "104", "L'Oréal dagcreme", "104001", 159, 14),
    product("p-104-2", "f-104", "104", "Eucerin solcreme SPF50", "104002", 189, 10),
    product("p-104-3", "f-104", "104", "Apoteket håndcreme", "104003", 49, 22),
    product("p-104-4", "f-104", "104", "Cetaphil rensegel", "104004", 119, 12),

    // Gennemført session (til arkivet)
    product("p-101b-1", "f-101b", "101", "Panodil 1 g, 100 stk", "100101", 58, 26),
    product("p-101b-2", "f-101b", "101", "Ipren 400 mg, 30 stk", "100102", 69, 19),
    product("p-101b-3", "f-101b", "101", "Voltaren gel 100 g", "100103", 109, 11),
  ];

  const state: DemoState = {
    sessions: [
      {
        id: "s-active",
        name: `Stocktake - ${DEMO_USER}`,
        status: "In Progress",
        createdAt: "2026-06-12T08:30:00.000Z",
        createdBy: DEMO_USER,
      },
      {
        id: "s-review",
        name: `Stocktake - ${DEMO_USER}`,
        status: "Review",
        createdAt: "2026-06-05T09:15:00.000Z",
        createdBy: DEMO_USER,
      },
      {
        id: "s-done",
        name: `Stocktake - ${DEMO_USER}`,
        status: "Completed",
        createdAt: "2026-05-20T10:00:00.000Z",
        createdBy: DEMO_USER,
      },
    ],
    files: [
      { id: "f-101", filename: "lager_hovedetage", uploadDate: "2026-06-10T07:00:00.000Z", location: "101", productCount: 4, stocktakeSessionId: null },
      { id: "f-103", filename: "lager_koleskab", uploadDate: "2026-06-10T07:05:00.000Z", location: "103", productCount: 3, stocktakeSessionId: null },
      { id: "f-102", filename: "lager_baglager", uploadDate: "2026-06-12T08:00:00.000Z", location: "102", productCount: 4, stocktakeSessionId: "s-active" },
      { id: "f-104", filename: "lager_maerkevarer", uploadDate: "2026-06-05T09:00:00.000Z", location: "104", productCount: 4, stocktakeSessionId: "s-review" },
      { id: "f-101b", filename: "lager_hovedetage_maj", uploadDate: "2026-05-20T09:30:00.000Z", location: "101", productCount: 3, stocktakeSessionId: "s-done" },
    ],
    products,
    checks: [
      // Igangværende: 2 af 4 talt, ingen afvigelse endnu
      { id: "c-1", productId: "p-102-1", sessionId: "s-active", expectedQty: 20, countedQty: 20, variance: 0, checkedAt: "2026-06-12T08:35:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: null },
      { id: "c-2", productId: "p-102-2", sessionId: "s-active", expectedQty: 25, countedQty: 23, variance: -2, checkedAt: "2026-06-12T08:36:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: "shrinkage" },

      // Til gennemsyn: alle talt, nogle afvigelser
      { id: "c-3", productId: "p-104-1", sessionId: "s-review", expectedQty: 14, countedQty: 14, variance: 0, checkedAt: "2026-06-05T09:20:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: null },
      { id: "c-4", productId: "p-104-2", sessionId: "s-review", expectedQty: 10, countedQty: 8, variance: -2, checkedAt: "2026-06-05T09:21:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: "disposal" },
      { id: "c-5", productId: "p-104-3", sessionId: "s-review", expectedQty: 22, countedQty: 24, variance: 2, checkedAt: "2026-06-05T09:22:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: "registration_error" },
      { id: "c-6", productId: "p-104-4", sessionId: "s-review", expectedQty: 12, countedQty: 12, variance: 0, checkedAt: "2026-06-05T09:23:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: null },

      // Gennemført: alle talt, én afvigelse (vises i arkiv)
      { id: "c-7", productId: "p-101b-1", sessionId: "s-done", expectedQty: 26, countedQty: 26, variance: 0, checkedAt: "2026-05-20T10:05:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: null },
      { id: "c-8", productId: "p-101b-2", sessionId: "s-done", expectedQty: 19, countedQty: 17, variance: -2, checkedAt: "2026-05-20T10:06:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: "shrinkage" },
      { id: "c-9", productId: "p-101b-3", sessionId: "s-done", expectedQty: 11, countedQty: 11, variance: 0, checkedAt: "2026-05-20T10:07:00.000Z", checkedBy: DEMO_USER, status: "Completed", reason: null },
    ],
  };

  return state;
}
