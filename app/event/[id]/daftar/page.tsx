"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEventStore } from "@/src/store/useEventStore";
import { useRegistrationStore } from "@/src/store/useRegistrationStore";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { RegistrationForm } from "@/src/components/molecules/registrationForm";

const EventRegistrationPage = () => {
  const params = useParams();
  const router = useRouter();
  const { getEventById } = useEventStore();
  const { initializeEventDates, getAvailableDatesByEvent } =
    useRegistrationStore();

  const eventId = params.id as string;
  const event = getEventById(eventId);

  // 🔄 Inisialisasi tanggal dan kuota event
  useEffect(() => {
    if (event) {
      initializeEventDates(event);
    }
  }, [event, initializeEventDates]);

  const eventDates = getAvailableDatesByEvent(eventId);

  const handleBack = () => {
    router.back();
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-4xl mx-auto mt-15 px-4">
        {/* Header Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2  "
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Detail Event</span>
          </button>
        </div>

        {/* Event Info Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Pendaftaran {event.title}
          </h1>
          <p className="text-gray-600 mb-4">
            Lengkapi form di bawah ini untuk mendaftar ke event ini
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-green-600" />
              <span className="text-gray-700">
                {event.schedule.type === "selected"
                  ? `${event.schedule.schedule.length} Sesi`
                  : `${new Date(event.schedule.startDate).toLocaleDateString(
                      "id-ID"
                    )} - ${new Date(event.schedule.endDate).toLocaleDateString(
                      "id-ID"
                    )}`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-green-600" />
              <span className="text-gray-700">{event.location}</span>
            </div>

            {/* ✅ Kuota per tanggal */}
            <div className="flex items-center gap-2">
              <Users size={16} className="text-green-600" />
              {eventDates.length > 0 ? (
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">
                    Total kuota: {event.quota * eventDates.length} peserta
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">Memuat kuota...</span>
              )}
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <RegistrationForm event={event} />
      </div>
    </div>
  );
};

export default EventRegistrationPage;
