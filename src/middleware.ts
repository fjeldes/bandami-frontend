import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE_MODE = true;
const MAINTENANCE_PATH = "/maintenance";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/", "/auth/callback", "/pricing", "/privacy", "/terms", "/refund", "/resources", "/resources/writing", "/resources/writing/connectors", "/resources/writing/essay-structure", "/resources/writing/task-1-tips", "/resources/writing/band-7-strategies", "/resources/writing/general-training-task-1", "/resources/writing/vocabulary-for-writing", "/resources/writing/grammar-for-ielts", "/resources/writing/time-management", "/resources/speaking", "/resources/band-scores"];

const STATIC_FILE_PATTERN = /\.(?:avif|bmp|css|csv|eot|gif|ico|jpeg|jpg|js|json|map|mjs|mp3|mp4|ogg|otf|pdf|png|svg|ttf|txt|webmanifest|webp|woff|woff2|xml|zip)$/i;

function isPublic(pathname: string) {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) || pathname.startsWith("/register/");
}

function isMaintenanceRoute(pathname: string) {
  return pathname === MAINTENANCE_PATH || pathname.startsWith(`${MAINTENANCE_PATH}/`);
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    STATIC_FILE_PATTERN.test(pathname)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isMaintenanceRoute(pathname) || isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  if (MAINTENANCE_MODE) {
    const url = request.nextUrl.clone();
    url.pathname = MAINTENANCE_PATH;
    url.search = "";
    return NextResponse.redirect(url, 307);
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
