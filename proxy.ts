import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/token";

const protectedPrefixes = [
  "/dashboard",
  "/work-plans",
  "/calendar",
  "/employee-finance",
  "/employees",
  "/reports",
  "/settings",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith("/login") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtectedRoute = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
