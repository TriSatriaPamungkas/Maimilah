// app/admin/dashboard/events/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEventStore } from "@/src/store/useEventStore";
import EditEventModal from "@/src/components/organism/editEventModal";
import DeleteConfirmModal from "@/src/components/organism/deleteConfirmModal";
import { ArrowLeft, ArrowRight } from "lucide-react";

const EventDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { getEventById, getParticipantsCount, deleteEvent } = useEventStore();
  const event = getEventById(eventId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!event) {
      router.push("/admin/dashboard/events");
    }
  }, [event, router]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Event tidak ditemukan</p>
          <button
            onClick={() => router.push("/admin/dashboard/events")}
            className="mt-4 text-blue-500 hover:text-blue-700"
          >
            Kembali ke Daftar Event
          </button>
        </div>
      </div>
    );
  }

  const participantsCount = getParticipantsCount(eventId);

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
      // Grid layout untuk alignment yang rapi
      return (
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2">
              <div className="font-semibold text-gray-700">Tanggal Mulai</div>
              <div className="text-gray-600">
                : {formatDate(event.schedule.startDate)}
              </div>

              <div className="font-semibold text-gray-700">Tanggal Selesai</div>
              <div className="text-gray-600">
                : {formatDate(event.schedule.endDate)}
              </div>

              <div className="font-semibold text-gray-700">Waktu</div>
              <div className="text-gray-600">
                : {formatTime(event.schedule.startTime)} -{" "}
                {formatTime(event.schedule.endTime)}
              </div>
            </div>
          </div>
        </div>
      );
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      return (
        <div className="space-y-3">
          {event.schedule.schedule.map((s, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg">
              <div className="font-semibold text-gray-700 mb-1">
                {formatDate(s.date)}
              </div>
              <div className="text-gray-600">
                {formatTime(s.startTime)} - {formatTime(s.endTime)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <p className="text-gray-500">Format jadwal tidak valid</p>;
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const idToDelete = event._id || event.id;

      if (!idToDelete) {
        throw new Error("Event ID not found");
      }

      console.log("Deleting event with ID:", idToDelete);
      await deleteEvent(idToDelete);

      router.push("/admin/dashboard/events");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting event:", error);

      if (error.message.includes("404")) {
        alert("Event tidak ditemukan. Mungkin sudah dihapus sebelumnya.");
      } else {
        alert(`Gagal menghapus event: ${error.message}`);
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/dashboard/events")}
          className="text-gray-600 hover:text-gray-900 mb-6 flex items-center space-x-2 text-sm"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Daftar Event</span>
        </button>

        {/* Header - Horizontal Layout seperti Events Page */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                {event.title}
              </h1>
              <p className="text-gray-500 text-sm">
                Detail lengkap informasi event
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-green-500 hover:bg-green-700 text-white px-5 py-2.5  font-medium transition-colors shadow-sm"
              >
                Edit Event
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-red-500 hover:bg-red-700 text-white px-5 py-2.5  font-medium transition-colors shadow-sm"
              >
                Hapus Event
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mx-4">
              <h3 className="text-sm font-medium text-gray-600">Total Kuota</h3>
              <p className="text-3xl font-bold text-green-600">{event.quota}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mx-4">
              <h3 className="text-sm font-medium text-gray-600">
                peserta Terdaftar
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {participantsCount}
              </p>
            </div>
          </div>
        </div>

        {/* Detail Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Deskripsi */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Deskripsi Event
            </h2>
            <p className="text-gray-700 leading-relaxed">{event.description}</p>
          </div>

          {/* Lokasi */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Lokasi</h2>
            <p className="text-gray-700">{event.location}</p>
          </div>

          {/* Jadwal */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Jadwal Pelaksanaan
            </h2>
            {renderSchedule()}
          </div>

          {/* Benefits */}
          {event.benefits && event.benefits.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Benefit untuk Peserta
              </h2>
              <ul className="space-y-2">
                {event.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-0.5 font-bold">
                      ✓
                    </span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Participants */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Informasi Partisipan
            </h2>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800 font-medium text-lg">
                    Total Partisipan:{" "}
                    <span className="text-green-600 font-bold">
                      {participantsCount}
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    Sisa Kuota: {event.quota - participantsCount}
                  </p>
                </div>
                <button
                  onClick={() =>
                    router.push(
                      `/admin/dashboard/participants?event=${eventId}`
                    )
                  }
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  Lihat Daftar Partisipan
                  <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <EditEventModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          event={event}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          isLoading={isDeleting}
          eventTitle={event.title}
        />
      </div>
    </div>
  );
};

export default EventDetailPage;
