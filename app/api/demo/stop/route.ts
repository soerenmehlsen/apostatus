import { NextResponse } from "next/server";
import { DEMO_COOKIE } from "@/lib/demo/is-demo";

// Rydder demo-cookien og sender tilbage til login. Klient-lageret
// (sessionStorage) ryddes af "Afslut demo"-knappen inden dette kald.
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
