// src/components/organisms/EventList.tsx
"use client";

import { useEffect } from "react";
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

  // 🔹 Fetch data saat komponen pertama kali dimount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (isLoading) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, idx) => (
        <EventCard
          key={event._id || event.id || `event-${idx}`}
          event={event}
          onRegister={onRegister}
          onViewDetails={onViewDetails}
          variant={variant}
        />
      ))}
    </div>
  );
};
