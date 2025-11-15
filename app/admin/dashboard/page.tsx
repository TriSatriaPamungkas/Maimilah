// app/admin/dashboard/page.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect jika belum login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Tidak authenticated
  if (!session) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Selamat datang,{" "}
          <span className="font-semibold text-green-600">
            {session.user?.name || session.user?.username}
          </span>
          !
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Total Events
          </h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">Active events</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Total Participants
          </h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">Registered users</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase">
            Upcoming Events
          </h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
          <p className="text-sm text-gray-500 mt-1">In the next 30 days</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-600">
              New registration for Workshop Photography
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-600">Event Brand Audit updated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
