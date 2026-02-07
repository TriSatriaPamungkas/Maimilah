/* eslint-disable @typescript-eslint/no-explicit-any */
// app/admin/dashboard/participants/page.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventStore } from "@/src/store/useEventStore";

const ParticipantsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventFilter = searchParams.get("event");

  // ✅ Mengambil data terbaru dari store
  const { events, fetchEvents, getEventBookedCount, isLoading } =
    useEventStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ✅ Hitung total booked slots dari semua event menggunakan useMemo
  const totalBookedSlots = useMemo(() => {
    return events.reduce((sum, event) => {
      const eventId = event._id || event.id;
      return sum + (eventId ? getEventBookedCount(eventId) : 0);
    }, 0);
  }, [events, getEventBookedCount]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const renderScheduleCompact = (event: any) => {
    if (!event.schedule || !event.schedule.type) {
      return "Jadwal belum ditentukan";
    }

    if (event.schedule.type === "range") {
      return `${formatDate(event.schedule.startDate)} - ${formatDate(
        event.schedule.endDate,
      )}`;
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      const firstDate = event.schedule.schedule[0];
      return firstDate ? formatDate(firstDate.date) : "Jadwal tidak valid";
    }

    return "Jadwal tidak valid";
  };

  const filteredEvents = eventFilter
    ? events.filter((e) => e._id === eventFilter || e.id === eventFilter)
    : events;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Manajemen Partisipan
          </h1>
          <p className="text-gray-600">
            Kelola seluruh data volunteer dari semua event
          </p>
        </div>

        {/* Stats Card */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">
                Total Slot Terbooked (Seluruh Event)
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {isLoading && totalBookedSlots === 0 ? "..." : totalBookedSlots}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Akumulasi pendaftaran harian/shift dari {events.length} event
            </p>
          </div>
        </div>

        {/* Event List */}
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Daftar Semua Event
                </h2>
              </div>
              {eventFilter && (
                <button
                  onClick={() => router.push("/admin/dashboard/participants")}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  ← Lihat Semua Event
                </button>
              )}
            </div>
          </div>

          {/* Event Grid */}
          {filteredEvents.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Belum ada event tersedia</p>
              <button
                onClick={() => router.push("/admin/dashboard/events")}
                className="text-green-600 text-sm underline mt-2"
              >
                Buat event sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, idx) => {
                const eventId = event._id || event.id;

                // ✅ Menggunakan booked slot
                const bookedCount = eventId ? getEventBookedCount(eventId) : 0;

                // Hitung total kapasitas: Quota harian * jumlah hari
                const getDays = () => {
                  if (event.schedule.type === "range") {
                    const d1 = new Date(event.schedule.startDate);
                    const d2 = new Date(event.schedule.endDate);
                    return (
                      Math.ceil(
                        Math.abs(d2.getTime() - d1.getTime()) /
                          (1000 * 60 * 60 * 24),
                      ) + 1
                    );
                  }
                  return event.schedule.schedule?.length || 1;
                };

                const totalCapacity = event.quota * getDays();
                const occupancyPercentage =
                  totalCapacity > 0 ? (bookedCount / totalCapacity) * 100 : 0;

                return (
                  <div
                    key={eventId || `event-${idx}`}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                  >
                    <h1 className="text-base font-semibold text-gray-800 leading-tight mb-3 min-h-12 line-clamp-2">
                      {event.title}
                    </h1>

                    <div className="space-y-2 mb-4 grow">
                      <div className="text-sm flex justify-between">
                        <span className="text-gray-500">Lokasi:</span>
                        <span className="text-gray-800 font-medium">
                          {event.location}
                        </span>
                      </div>

                      <div className="text-sm flex justify-between">
                        <span className="text-gray-500">Jadwal:</span>
                        <span className="text-gray-800 font-medium">
                          {renderScheduleCompact(event)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar booked slot */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-600 font-medium">
                          Terisi: {bookedCount} / {totalCapacity} Slot
                        </span>
                        <span
                          className={`font-bold ${occupancyPercentage >= 90 ? "text-red-600" : "text-green-600"}`}
                        >
                          {Math.round(occupancyPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            occupancyPercentage >= 90
                              ? "bg-red-500"
                              : occupancyPercentage >= 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(occupancyPercentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        eventId &&
                        router.push(`/admin/dashboard/participants/${eventId}`)
                      }
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      Detail Partisipan & Shift
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPage;
