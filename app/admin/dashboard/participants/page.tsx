/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// app/admin/dashboard/participants/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventStore } from "@/src/store/useEventStore";

const ParticipantsPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventFilter = searchParams.get("event");

  const { events, fetchEvents, getParticipantsCount } = useEventStore();
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    // Hitung total partisipan dari semua event
    const total = events.reduce((sum, event) => {
      const eventId = event._id || event.id;
      return sum + (eventId ? getParticipantsCount(eventId) : 0);
    }, 0);
    setTotalParticipants(total);
  }, [events, getParticipantsCount]);

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
        event.schedule.endDate
      )}`;
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      const firstDate = event.schedule.schedule[0];
      return formatDate(firstDate.date);
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
            Kelola dan pantau partisipan dari semua event
          </p>
        </div>

        {/* Stats Card */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">
                Total Seluruh Partisipan
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {totalParticipants}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Dari {events.length} event yang tersedia
            </p>
          </div>
        </div>

        {/* Event List */}
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Daftar Event & Partisipan
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Kelola dan lihat partisipan dari setiap event
                </p>
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
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Belum ada event tersedia</p>
              <p className="text-gray-400 text-sm mt-2">
                Buat event terlebih dahulu di menu Event
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, idx) => {
                const eventId = event._id || event.id;
                const participantsCount = eventId
                  ? getParticipantsCount(eventId)
                  : 0;
                const quotaPercentage =
                  event.quota > 0 ? (participantsCount / event.quota) * 100 : 0;

                return (
                  <div
                    key={eventId || `event-${idx}`}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                  >
                    {/* Title - Fixed height */}
                    <h1 className="text-base font-semibold text-gray-800 leading-tight mb-3 min-h-12 line-clamp-2">
                      {event.title}
                    </h1>

                    {/* Info Section - Flexible */}
                    <div className="space-y-2 mb-3 grow">
                      {/* Lokasi */}
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Lokasi:{" "}
                        </span>
                        <span className="text-gray-600">{event.location}</span>
                      </div>

                      {/* Tanggal - Compact */}
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">
                          Tanggal:{" "}
                        </span>
                        <span className="text-gray-600">
                          {renderScheduleCompact(event)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar - Fixed */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                        <span>
                          Partisipan: {participantsCount} / {event.quota}
                        </span>
                        <span className="font-medium">
                          {Math.round(quotaPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            quotaPercentage >= 80
                              ? "bg-red-500"
                              : quotaPercentage >= 50
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(quotaPercentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Button - Fixed at bottom */}
                    <button
                      onClick={() =>
                        eventId &&
                        router.push(`/admin/dashboard/participants/${eventId}`)
                      }
                      className="w-full bg-green-500 hover:bg-green-700 text-white py-2.5 px-4  font-medium transition-colors text-sm flex items-center justify-center gap-2 mt-auto"
                    >
                      Lihat Detail Partisipan
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
