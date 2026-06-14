import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo/is-demo";

// Sætter demo-cookien og sender brugeren ind i appen. Cookien er bevidst
// IKKE httpOnly, så interceptoren på klienten kan læse den via document.cookie.
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(DEMO_COOKIE, "1", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 timer
  });
  return response;
}
