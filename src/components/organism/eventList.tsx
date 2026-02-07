// src/components/organisms/EventList.tsx
"use client";

import { useEffect, useState } from "react";
import { useEventStore } from "@/src/store/useEventStore";
import { EventCard } from "@/src/components/molecules/eventCard";

interface EventListProps {
  onRegister?: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewDetails?: (event: any) => void;
  variant?: "user" | "admin";
}

export const EventList: React.FC<EventListProps> = ({
  onRegister,
  onViewDetails,
  variant = "user",
}) => {
  const { events, isLoading, error, fetchEvents } = useEventStore();
  const [refreshKey, setRefreshKey] = useState(0);

  // 🔹 Fetch data saat komponen pertama kali dimount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 🔹 Auto-refresh untuk admin variant setiap 30 detik
  useEffect(() => {
    if (variant === "admin") {
      const interval = setInterval(() => {
        fetchEvents();
        setRefreshKey((prev) => prev + 1);
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [variant, fetchEvents]);

  if (isLoading && events.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 animate-pulse">
        Loading event...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Gagal memuat data event 😢
        <p className="text-gray-400 text-sm mt-2">{error}</p>
        <button
          onClick={() => fetchEvents()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {variant === "admin"
            ? "Belum ada event yang dibuat."
            : "Belum ada event yang tersedia."}
        </p>
        <p className="text-gray-400 text-sm mt-2">
          {variant === "admin"
            ? "Klik tombol 'Tambah Event' untuk membuat event pertama Anda."
            : "Silakan cek kembali nanti untuk event-event menarik."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Admin Info Bar */}
      {variant === "admin" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Data booking diperbarui otomatis setiap 30 detik</span>
          </div>
          <button
            onClick={() => {
              fetchEvents();
              setRefreshKey((prev) => prev + 1);
            }}
            className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh Sekarang
          </button>
        </div>
      )}

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, idx) => (
          <EventCard
            key={`${event._id || event.id || `event-${idx}`}-${refreshKey}`}
            event={event}
            onRegister={onRegister}
            onViewDetails={onViewDetails}
            variant={variant}
          />
        ))}
      </div>

      {/* Loading Overlay when refreshing */}
      {isLoading && events.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 border border-gray-200 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
          <span className="text-sm text-gray-600">Memperbarui data...</span>
        </div>
      )}
    </div>
  );
};
