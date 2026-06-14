import { NextRequest, NextResponse } from "next/server";
import { DEMO_COOKIE, DEMO_COOKIE_VALUE } from "@/lib/demo/is-demo";

// Sætter demo-cookien og sender brugeren ind i appen. Cookien er bevidst
// IKKE httpOnly, så interceptoren på klienten kan læse den via document.cookie.
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(DEMO_COOKIE, DEMO_COOKIE_VALUE, {
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 timer
  });
  // Undgå at en mellemliggende cache gemmer redirecten uden Set-Cookie.
  response.headers.set("Cache-Control", "no-store");
  return response;
}
