/* eslint-disable react-hooks/exhaustive-deps */
// app/admin/dashboard/participants/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEventStore } from "@/src/store/useEventStore";
import { useRegistrationStore } from "@/src/store/useRegistrationStore";
import DateCheckboxGrid from "@/src/components/molecules/dateCheckboxGrid";
import { ArrowLeft } from "lucide-react";

interface Participant {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  domisili?: string;
  source?: string;
  reason?: string;
  selectedDates?: string[];
  registeredAt?: string;
}

const ParticipantDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { getEventById } = useEventStore();
  const {
    fetchParticipantsByEvent,
    getParticipantsByEvent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAvailableDatesByEvent,
    initializeEventDates,
  } = useRegistrationStore();

  const event = getEventById(eventId);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [participantCounts, setParticipantCounts] = useState<{
    [date: string]: number;
  }>({});

  // Generate list tanggal dari event
  const getEventDates = () => {
    if (!event || !event.schedule) return [];

    if (event.schedule.type === "range") {
      const dates: string[] = [];
      const start = new Date(event.schedule.startDate);
      const end = new Date(event.schedule.endDate);

      while (start <= end) {
        dates.push(start.toISOString().split("T")[0]);
        start.setDate(start.getDate() + 1);
      }
      return dates;
    } else if (event.schedule.type === "selected") {
      return event.schedule.schedule.map((s) => s.date);
    }

    return [];
  };

  const eventDates = getEventDates();

  // Initialize event dates saat pertama load
  useEffect(() => {
    if (event) {
      initializeEventDates(event);
    }
  }, [event, initializeEventDates]);

  // Fetch participants dari store saat pertama load
  useEffect(() => {
    const loadParticipants = async () => {
      if (!eventId) return;

      setIsLoading(true);
      try {
        await fetchParticipantsByEvent(eventId);
      } catch (error) {
        console.error("Error loading participants:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParticipants();
  }, [eventId, fetchParticipantsByEvent]);

  // Calculate participant counts dari data real
  useEffect(() => {
    if (!eventId || eventDates.length === 0) return;

    const allParticipants = getParticipantsByEvent(eventId);
    const counts: { [date: string]: number } = {};

    // Hitung berapa banyak partisipan per tanggal
    eventDates.forEach((date) => {
      const count = allParticipants.filter((p) =>
        p.selectedDates?.includes(date)
      ).length;
      counts[date] = count;
    });

    // Only update if counts actually changed
    setParticipantCounts((prev) => {
      const hasChanged = eventDates.some((date) => prev[date] !== counts[date]);
      return hasChanged ? counts : prev;
    });
  }, [eventId, eventDates.length]); // Remove getParticipantsByEvent from deps

  // Format tanggal ke bahasa Indonesia
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Fetch participants untuk tanggal tertentu dari data real
  const fetchParticipantsByDate = (date: string) => {
    setIsLoading(true);

    try {
      const allParticipants = getParticipantsByEvent(eventId);

      // Filter partisipan yang mendaftar di tanggal ini
      const filtered = allParticipants.filter((p) =>
        p.selectedDates?.includes(date)
      );

      setParticipants(filtered);
    } catch (error) {
      console.error("Error fetching participants by date:", error);
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date click
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    fetchParticipantsByDate(date);
  };

  // Export to CSV dengan data real
  const handleExportCSV = () => {
    if (!event) return;

    const allParticipants = getParticipantsByEvent(eventId);
    let csvContent = "";

    // Loop untuk setiap tanggal
    eventDates.forEach((date, idx) => {
      // Filter partisipan untuk tanggal ini
      const dateParticipants = allParticipants.filter((p) =>
        p.selectedDates?.includes(date)
      );

      // Header tanggal
      csvContent += `Tanggal,${formatDate(date)}\n`;

      // Header tabel
      csvContent += "No,Nama Partisipan,Email,Telepon,Domisili\n";

      // Add participants to CSV
      if (dateParticipants.length === 0) {
        csvContent += "Belum ada partisipan terdaftar\n";
      } else {
        dateParticipants.forEach((p, i) => {
          csvContent += `${i + 1},"${p.name}","${p.email}","${
            p.phone || "-"
          }","${p.domisili || "-"}"\n`;
        });
      }

      // Tambah spacing antar tanggal
      if (idx < eventDates.length - 1) {
        csvContent += "\n";
      }
    });

    // Generate filename dengan tanggal
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dateString = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    const eventName = event.title
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const filename = `participants_${eventName}_.csv`;

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log(`✅ CSV exported: ${filename}`);
  };

  useEffect(() => {
    if (!event) {
      router.push("/admin/dashboard/participants");
    }
  }, [event, router]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Event tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push("/admin/dashboard/participants")}
          className="text-gray-600 hover:text-gray-800 mb-3 flex items-center space-x-1 text-sm"
        >
          <ArrowLeft />
          <span>Kembali ke Daftar Event</span>
        </button>
        {/* Header */}
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Partisipan: {event.title}
              </h1>
              <p className="text-gray-600">
                Pilih tanggal untuk melihat daftar partisipan
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-green-500 hover:bg-green-800 text-white px-6 py-2.5  flex items-center space-x-2 transition-colors shadow-sm"
            >
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Section 1: Date Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Jadwal Pelaksanaan
          </h2>

          {eventDates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Tidak ada jadwal tersedia untuk event ini
            </p>
          ) : (
            <DateCheckboxGrid
              mode="admin"
              dates={eventDates}
              selectedDate={selectedDate}
              onDateClick={handleDateClick}
              participantCounts={participantCounts}
              quotaPerDate={event.quota}
            />
          )}
        </div>

        {/* Section 2: Participants Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedDate
                ? `Partisipan - ${formatDate(selectedDate)}`
                : "Daftar Partisipan"}
            </h2>
            {selectedDate && (
              <span className="text-sm text-gray-600">
                Total: {participants.length} peserta
              </span>
            )}
          </div>

          {!selectedDate ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Pilih tanggal terlebih dahulu</p>
              <p className="text-sm">
                Klik salah satu tanggal di atas untuk melihat daftar partisipan
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12 text-gray-500 animate-pulse">
              Loading partisipan...
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Belum ada partisipan terdaftar</p>
              <p className="text-sm">
                untuk tanggal {formatDate(selectedDate)}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-16">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Nama Partisipan
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Telepon
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {participants.map((participant, index) => (
                    <tr
                      key={participant._id || participant.id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {participant.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {participant.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {participant.phone || "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            alert(
                              `Detail Partisipan:\n\n` +
                                `Nama: ${participant.name}\n` +
                                `Email: ${participant.email}\n` +
                                `Telepon: ${participant.phone || "-"}\n` +
                                `Domisili: ${participant.domisili || "-"}\n` +
                                `Sumber Info: ${participant.source || "-"}\n` +
                                `Alasan: ${participant.reason || "-"}\n` +
                                `Tanggal Terdaftar: ${
                                  participant.selectedDates?.join(", ") || "-"
                                }`
                            );
                          }}
                          className="text-green-500 hover:text-green-700 text-sm font-medium"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetailPage;
