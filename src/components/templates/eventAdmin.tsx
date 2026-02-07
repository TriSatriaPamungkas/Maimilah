/* eslint-disable @typescript-eslint/no-explicit-any */
// src/templates/EventAdmin.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EventList } from "@/src/components/organism/eventList";
import AddEventModal from "@/src/components/organism/addEventModal";
import { EventSummary, useEventStore } from "@/src/store/useEventStore";

const EventAdmin: React.FC = () => {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ✅ Ambil data dan fungsi dari Store
  const events = useEventStore((state) => state.events);
  const isLoading = useEventStore((state) => state.isLoading);
  const getEventBookedCount = useEventStore(
    (state) => state.getEventBookedCount,
  );
  const fetchEvents = useEventStore((state) => state.fetchEvents);

  // ✅ Pastikan data terbaru dimuat saat mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleViewEventDetails = (event: EventSummary) => {
    const eventId = event._id || event.id;
    if (eventId) {
      router.push(`/admin/dashboard/events/${eventId}`);
    }
  };

  // ✅ Hitung Total Okupansi (Slot Terbooked) menggunakan state terpusat
  // Ini menggantikan useEffect fetch manual yang lambat
  const totalBookedSlots = useMemo(() => {
    return events.reduce((total, event) => {
      const eventId = event._id || event.id;
      return total + (eventId ? getEventBookedCount(eventId) : 0);
    }, 0);
  }, [events, getEventBookedCount]);

  // ✅ Total Partisipan (Jumlah Unik ID di array participants)
  const totalParticipants = useMemo(() => {
    return events.reduce((total, event) => {
      return total + (event.participants?.length || 0);
    }, 0);
  }, [events]);

  // ✅ Hitung Event Aktif (Masih berlaku hari ini atau ke depan)
  const activeEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return events.filter((event) => {
      if (!event.schedule || !event.schedule.type) return false;

      if (event.schedule.type === "range") {
        return event.schedule.endDate && event.schedule.endDate >= today;
      } else if (event.schedule.type === "selected") {
        return event.schedule.schedule?.some((s) => s.date >= today);
      }
      return false;
    });
  }, [events]);

  return (
    <div className="min-h-screen bg-gray-50 p-6" id="Event">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 p-6 rounded-lg mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Manajemen Event
            </h1>
            <p className="text-gray-600">
              Kelola semua event Anda di satu tempat
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-500 hover:bg-green-800 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <span className="text-xl">+</span>
            <span>Tambah Event</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Total Event</h3>
              <p className="text-3xl font-bold text-blue-600">
                {events.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Event Aktif</h3>
              <p className="text-3xl font-bold text-green-600">
                {activeEvents.length}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">
                Total Partisipan
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {totalParticipants}
              </p>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              *Jumlah pendaftar unik
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">
                Slot Terbooked
              </h3>
              {isLoading && totalBookedSlots === 0 ? (
                <p className="text-lg text-gray-400 animate-pulse">...</p>
              ) : (
                <p className="text-3xl font-bold text-orange-600">
                  {totalBookedSlots}
                </p>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              *Akumulasi unit slot harian
            </p>
          </div>
        </div>

        {/* Event List Section */}
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Daftar Semua Event
            </h2>
            <span className="text-sm text-gray-500">
              {events.length} event ditemukan
            </span>
          </div>

          <EventList onViewDetails={handleViewEventDetails} variant="admin" />
        </div>

        {/* Add Event Modal */}
        <AddEventModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default EventAdmin;
