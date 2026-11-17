import { type NextRequest, NextResponse } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

// Optimistic check only: pages and server actions call requireAdmin() too.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const email = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET);

  if (pathname === "/admin/login") {
    return email ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }
  if (!email) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
