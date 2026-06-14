import { handleDemoRequest } from "./api";

let installed = false;

// Wrapper om window.fetch. I demo-tilstand besvares /api/*-kald lokalt fra
// demo-lageret; alt andet (statiske assets, RSC, /api/demo, /api/auth) går
// uændret videre til det oprindelige fetch.
export function installDemoFetch(): void {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method = (
      init?.method ??
      (typeof input === "object" && "method" in input ? input.method : "GET") ??
      "GET"
    ).toUpperCase();

    const isApi = url.includes("/api/");
    const isPassthrough =
      url.includes("/api/auth") || url.includes("/api/demo");

    if (isApi && !isPassthrough) {
      let body: unknown;
      const rawBody = init?.body;
      // Kun JSON-bodies parses. Ikke-string-bodies (fx FormData ved upload)
      // efterlades undefined — de demo-handlers der modtager dem bruger dem
      // ikke (upload er deaktiveret i demoen).
      if (typeof rawBody === "string") {
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = undefined;
        }
      }

      const result = handleDemoRequest(url, method, body);
      if (result) {
        return new Response(JSON.stringify(result.body), {
          status: result.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Ingen demo-handler matchede: kaldet ville ramme den rigtige server.
      // Advar i udvikling, så manglende demo-ruter opdages tidligt.
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[demo] Uhåndteret API-kald falder igennem til serveren: ${method} ${url}`);
      }
    }

    return originalFetch(input, init);
  };
}
