"use client";
// app/admin/layout.tsx
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/src/components/organism/adminSidebar";
import { SessionTimeoutHandler } from "@/src/components/molecules/SessionTimeoutHandler";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();

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

  // Jika di login page, render tanpa sidebar (login page handle sendiri)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Jika authenticated dan bukan login page, show sidebar + content + session handler
  if (status === "authenticated") {
    return (
      <>
        <div className="flex min-h-screen bg-gray-50">
          <AdminSidebar />
          <main className="flex-1 ml-60 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
        {/* ✅ Session Timeout Handler - only show when authenticated */}
        <SessionTimeoutHandler />
      </>
    );
  }

  // Fallback: unauthenticated di non-login page (middleware akan redirect)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
