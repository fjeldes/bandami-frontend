import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/", "/auth/callback", "/pricing", "/privacy", "/terms", "/refund", "/resources", "/resources/writing", "/resources/speaking", "/resources/band-scores"];

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) || pathname.startsWith("/register/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const hasCookie = request.cookies.has("auth_token");

  if (!hasCookie && !isPublic(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
