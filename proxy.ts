import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { DEMO_COOKIE, DEMO_COOKIE_VALUE } from "@/lib/demo/is-demo";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Expose the current pathname to server components (the root layout hides
  // the header on the login page).
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname);
  const next = () => NextResponse.next({ request: { headers } });

  // Always allow the auth endpoints, the demo start/stop routes and the
  // login page through. Listed explicitly so future /api/demo/* routes are
  // not silently exposed without auth.
  if (
    pathname.startsWith("/api/auth") ||
    pathname === "/api/demo/start" ||
    pathname === "/api/demo/stop" ||
    pathname === "/login"
  ) {
    return next();
  }

  // Demo visitors have no auth session but carry the demo cookie.
  const isDemo = req.cookies.get(DEMO_COOKIE)?.value === DEMO_COOKIE_VALUE;
  if (isDemo) {
    return next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return next();
});

export const config = {
  // Run on everything except Next internals and common static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|jpg|jpeg|webp)$).*)"],
};
