"use client";
import { Calendar, MapPin, Clock, ArrowLeft } from "lucide-react";
import React from "react";
import { useRouter } from "next/navigation";
import { useEventStore } from "@/src/store/useEventStore";

const EventDetail = () => {
  const { selectedEvent } = useEventStore();
  const router = useRouter();

  if (!selectedEvent)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Event tidak ditemukan</p>
      </div>
    );

  const { title, description, location, schedule, id } = selectedEvent;

  // Format dates based on schedule type
  const formatEventDates = () => {
    if (schedule.type === "selected") {
      if (schedule.schedule.length === 0) return "Tanggal belum ditentukan";

      const dates = schedule.schedule.map((s) => s.date);
      const startDate = new Date(dates[0]);

      if (dates.length === 1) {
        return startDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      const endDate = new Date(dates[dates.length - 1]);
      return `${startDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })} - ${endDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
    } else {
      // range type
      const startDate = new Date(schedule.startDate);
      const endDate = new Date(schedule.endDate);

      if (schedule.startDate === schedule.endDate) {
        return startDate.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }

      return `${startDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })} - ${endDate.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;
    }
  };

  // Format time based on schedule type
  const formatEventTime = () => {
    if (schedule.type === "selected") {
      if (schedule.schedule.length === 0) return "Waktu belum ditentukan";

      const firstSession = schedule.schedule[0];
      return `${firstSession.startTime} - ${firstSession.endTime}`;
    } else {
      // range type
      return `${schedule.startTime} - ${schedule.endTime}`;
    }
  };

  const formattedDates = formatEventDates();
  const formattedTime = formatEventTime();

  const handleBack = () => {
    router.push("/event");
  };

  const handleRegister = () => {
    router.push(`/event/${id}/daftar`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative w-full h-64 md:h-80 lg:h-96 bg-linear-to-t from-green-900 via-green-500 to-transparent flex items-end">
        {/* Back Button - Hidden on mobile, visible on desktop */}
        <button
          onClick={handleBack}
          className="absolute top-10 left-6 hidden md:flex items-center gap-2 text-gray-700 bg-black/10 hover:bg-green-600/50 hover:text-white rounded-lg px-4 py-3 transition-all backdrop-blur-sm z-40 border border-white/20"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Kembali</span>
        </button>

        <div className="text-white p-6 md:p-10 w-full">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-green-100">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{formattedDates}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Mobile Back Button - Only visible on mobile */}
        <div className="md:hidden mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors p-3 rounded-lg hover:bg-green-500 border border-green-200 w-full justify-center "
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Kembali ke Daftar Event</span>
          </button>
        </div>

        <section className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-10">
          {/* Grid dua kolom dengan proporsi yang lebih seimbang */}
          <div className="grid md:grid-cols-4 gap-8">
            {/* Kiri: Deskripsi - sekarang lebih kecil */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-semibold mb-6 text-green-700">
                Tentang Event Ini
              </h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {description}
              </p>

              {/* Benefits section */}
              {selectedEvent.benefits && selectedEvent.benefits.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-green-700">
                    Benefit Mengikuti Event
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    {selectedEvent.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Kanan: Info event - sekarang lebih lebar */}
            <div className="md:col-span-2 bg-gray-50 rounded-xl p-6 shadow-inner border border-gray-200 flex flex-col gap-6">
              <div className="flex flex-col gap-4 text-gray-700">
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  Informasi Event
                </h3>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                  <Calendar size={20} className="text-green-700 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">
                      {formattedDates}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                  <Clock size={20} className="text-green-700 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">
                      {formattedTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                  <MapPin size={20} className="text-green-700 shrink-0" />
                  <div>
                    <span className="font-medium text-gray-900">
                      {location}
                    </span>
                  </div>
                </div>

                {/* Schedule details for selected type */}
                {schedule.type === "selected" &&
                  schedule.schedule.length > 0 && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-green-700 mb-3">
                        Jadwal Sesi:
                      </h4>
                      <div className="space-y-3">
                        {schedule.schedule.map((session, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="font-medium">
                              {new Date(session.date).toLocaleDateString(
                                "id-ID",
                                {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </span>
                            <span className="text-gray-600">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <button
                onClick={handleRegister}
                className="w-full bg-green-600 text-white px-6 py-4  text-lg font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg mt-4"
              >
                Daftar Sekarang
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventDetail;
