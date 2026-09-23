import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow login API route unconditionally
  if (pathname === "/api/admin/auth/login") {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyAdminSession(sessionCookie);

  // 2. Protect Admin API routes
  if (pathname.startsWith("/api/admin")) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 3. Protect Admin page subroutes (/admin/products/*, /admin/orders, /admin/help, etc.)
  // Note: /admin itself is allowed so unauthenticated users see the centered login form.
  if (pathname.startsWith("/admin/") && pathname !== "/admin") {
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
