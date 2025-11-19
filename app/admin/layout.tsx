"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/src/components/organism/adminSidebar";
import { SessionTimeoutHandler } from "@/src/components/molecules/SessionTimeoutHandler";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";

  // Redirect logic - HANYA jika bukan login page
  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.replace(
        `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`
      );
    }
  }, [status, pathname, isLoginPage, router]);

  // Halaman login: render tanpa sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Authenticated: render dengan sidebar
  if (status === "authenticated") {
    return (
      <>
        <div className="flex min-h-screen bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 ml-60 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
        <SessionTimeoutHandler />
      </>
    );
  }

  // Fallback saat redirect (unauthenticated & bukan login page)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Mengalihkan...</p>
      </div>
    </div>
  );
}
