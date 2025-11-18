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

  // Redirect jika belum auth dan bukan di halaman login
  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      // redirect ke halaman login dengan callbackUrl current page
      router.replace(
        `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`
      );
    }
  }, [status, pathname, router]);

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

  // Halaman login tetap tanpa sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

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

  // state fallback saat redirect sedang berlangsung
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
