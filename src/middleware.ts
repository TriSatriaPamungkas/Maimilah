// src/middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Public routes yang tidak perlu authentication
  const publicRoutes = ["/admin/login", "/api/auth"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Jika public route, lanjutkan
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ✅ Check if token exists and is valid
  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute) {
    if (!token || !token.id) {
      // Token tidak ada atau invalid, redirect ke login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ✅ Check token expiration (4 hours)
    const now = Math.floor(Date.now() / 1000);
    const tokenIssuedAt = token.iat || now;
    const fourHours = 4 * 60 * 60; // 4 hours in seconds

    if (now - tokenIssuedAt > fourHours) {
      // Session expired, redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("error", "SessionExpired");
      loginUrl.searchParams.set(
        "message",
        "Sesi Anda telah berakhir setelah 4 jam tidak aktif"
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  // Jika sudah login dan akses login page, redirect ke dashboard
  if (pathname === "/admin/login" && token && token.id) {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
