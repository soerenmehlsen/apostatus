import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo/is-demo";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Always allow the auth endpoints, the demo start/stop routes and the
  // login page through.
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/demo") ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // Demo visitors have no auth session but carry the demo cookie.
  const isDemo = req.cookies.get(DEMO_COOKIE)?.value === "1";
  if (isDemo) {
    return NextResponse.next();
  }

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except Next internals and common static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|ico|jpg|jpeg|webp)$).*)"],
};
