// app/admin/dashboard/events/[id]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEventStore } from "@/src/store/useEventStore";
import EditEventModal from "@/src/components/organism/editEventModal";
import DeleteConfirmModal from "@/src/components/organism/deleteConfirmModal";
import { ArrowLeft, Clock } from "lucide-react";

const EventDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  // ✅ Mengambil state terpusat dari store
  const { getEventById, getEventBookedCount, deleteEvent, isLoading } =
    useEventStore();
  const event = getEventById(eventId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 🔹 Calculate number of days for the event
  const numberOfDays = useMemo(() => {
    if (!event?.schedule || !event.schedule.type) return 1;

    if (event.schedule.type === "range") {
      const startDate = new Date(event.schedule.startDate);
      const endDate = new Date(event.schedule.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      return event.schedule.schedule.length;
    }
    return 1;
  }, [event]);

  // ✅ Single Source of Truth untuk kuota dan booked slots
  const quotaPerDay = event?.quota || 0;
  const totalSlots = quotaPerDay * numberOfDays;
  const bookedSlots = getEventBookedCount(eventId);

  const availableSlots = totalSlots - bookedSlots;
  const bookedPercentage =
    totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

  useEffect(() => {
    if (!event && !isLoading) {
      router.push("/admin/dashboard/events");
    }
  }, [event, router, isLoading]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg">Memuat detail event...</p>
        </div>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const formatTime = (t: string) => `${t} WITA`;

  const renderSchedule = () => {
    if (!event.schedule || !event.schedule.type) {
      return <p className="text-gray-500">Jadwal belum ditentukan</p>;
    }

    if (event.schedule.type === "range") {
      return (
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
              <div className="font-semibold text-gray-700">Tanggal Mulai</div>
              <div className="text-gray-600">
                : {formatDate(event.schedule.startDate!)}
              </div>
              <div className="font-semibold text-gray-700">Tanggal Selesai</div>
              <div className="text-gray-600">
                : {formatDate(event.schedule.endDate!)}
              </div>
            </div>

            {event.schedule.shifts && event.schedule.shifts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Shift Tersedia (Berlaku Setiap Hari)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event.schedule.shifts.map((shift, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        Shift {index + 1}
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        {formatTime(shift.startTime)} -{" "}
                        {formatTime(shift.endTime)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      return (
        <div className="space-y-3">
          {event.schedule.schedule.map((session, i) => (
            <div
              key={i}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
            >
              <div className="font-semibold text-gray-700 mb-3">
                {formatDate(session.date)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {session.shifts.map((shift, shiftIndex) => (
                  <div
                    key={shiftIndex}
                    className="bg-white p-3 rounded border border-gray-200"
                  >
                    <p className="text-xs text-gray-500">
                      Shift {shiftIndex + 1}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      {formatTime(shift.startTime)} -{" "}
                      {formatTime(shift.endTime)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <p className="text-gray-500">Format jadwal tidak valid</p>;
  };

  const handleDelete = async () => {
    const idToDelete = event._id || event.id;
    if (idToDelete) {
      await deleteEvent(idToDelete);
      router.push("/admin/dashboard/events");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/admin/dashboard/events")}
          className="text-gray-600 hover:text-gray-900 mb-6 flex items-center space-x-2 text-sm"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Daftar Event</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                {event.title}
              </h1>
              <p className="text-gray-500 text-sm">ID Event: {eventId}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-green-500 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
              >
                Edit Event
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-500 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm"
              >
                Hapus Event
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Kuota / Hari
            </h3>
            <p className="text-3xl font-bold text-blue-600">{quotaPerDay}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Kapasitas Total
            </h3>
            <p className="text-3xl font-bold text-green-600">{totalSlots}</p>
            <p className="text-xs text-gray-500 mt-1">
              {numberOfDays} Hari Pelaksanaan
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Slot Terisi
            </h3>
            <p className="text-3xl font-bold text-orange-600">{bookedSlots}</p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(bookedPercentage)}% Okupansi
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              Slot Tersisa
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {availableSlots}
            </p>
            <p className="text-xs text-gray-500 mt-1">Sisa Slot Global</p>
          </div>
        </div>

        {/* Detail Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Deskripsi Event
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {event.description}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Lokasi</h2>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {event.location}
              </span>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Jadwal & Shift
            </h2>
            {renderSchedule()}
          </section>
        </div>

        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          event={event}
        />
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          eventTitle={event.title}
        />
      </div>
    </div>
  );
};

export default EventDetailPage;
