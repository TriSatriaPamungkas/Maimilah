/* eslint-disable react-hooks/exhaustive-deps */
// app/admin/dashboard/participants/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEventStore } from "@/src/store/useEventStore";
import { useRegistrationStore } from "@/src/store/useRegistrationStore";
import { ParticipantsTable } from "@/src/components/organism/ParticipantsTable";
import { ArrowLeft, Download } from "lucide-react";

interface SelectedDateShift {
  date: string;
  shiftIndex: number;
}

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
  selectedDateShifts?: SelectedDateShift[];
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
    initializeEventDates,
    getAvailableDatesByEvent,
  } = useRegistrationStore();

  const event = getEventById(eventId);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const availableDates = getAvailableDatesByEvent(eventId);

  // Format tanggal ke bahasa Indonesia
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get shift time
  const getShiftTime = (date: string, shiftIndex: number) => {
    const dateInfo = availableDates.find((d) => d.date === date);
    if (dateInfo && dateInfo.shifts[shiftIndex]) {
      const shift = dateInfo.shifts[shiftIndex];
      return `${shift.startTime} - ${shift.endTime}`;
    }
    return "";
  };

  // Fetch participants untuk tanggal dan shift tertentu
  const fetchParticipantsByDateShift = (
    date: string,
    shiftIndex: number | null
  ) => {
    setIsLoading(true);

    try {
      const allParticipants = getParticipantsByEvent(eventId);

      // Filter partisipan berdasarkan date dan shift
      const filtered = allParticipants.filter((p) => {
        if (p.selectedDateShifts && p.selectedDateShifts.length > 0) {
          // New format with shifts
          return p.selectedDateShifts.some(
            (sel) =>
              sel.date === date &&
              (shiftIndex === null || sel.shiftIndex === shiftIndex)
          );
        } else if (p.selectedDates && p.selectedDates.length > 0) {
          // Legacy format
          return p.selectedDates.includes(date);
        }
        return false;
      });

      setParticipants(filtered);
    } catch (error) {
      console.error("Error fetching participants:", error);
      setParticipants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date click
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setSelectedShift(null); // Reset shift selection
    fetchParticipantsByDateShift(date, null);
  };

  // Handle shift click
  const handleShiftClick = (date: string, shiftIndex: number) => {
    setSelectedDate(date);
    setSelectedShift(shiftIndex);
    fetchParticipantsByDateShift(date, shiftIndex);
  };

  // Export to CSV dengan data real
  const handleExportCSV = () => {
    if (!event) return;

    const allParticipants = getParticipantsByEvent(eventId);
    let csvContent = "";

    // Loop untuk setiap tanggal dan shift
    availableDates.forEach((dateInfo, idx) => {
      dateInfo.shifts.forEach((shift, shiftIndex) => {
        // Filter partisipan untuk tanggal dan shift ini
        const dateShiftParticipants = allParticipants.filter((p) => {
          if (p.selectedDateShifts && p.selectedDateShifts.length > 0) {
            return p.selectedDateShifts.some(
              (sel) =>
                sel.date === dateInfo.date && sel.shiftIndex === shiftIndex
            );
          }
          // Legacy: count for all shifts on this date
          return p.selectedDates?.includes(dateInfo.date);
        });

        // Header tanggal dan shift
        csvContent += `Tanggal,${formatDate(dateInfo.date)} - Shift ${
          shift.startTime
        } - ${shift.endTime}\n`;

        // Header tabel
        csvContent += "No,Nama Partisipan,Email,Telepon,Domisili\n";

        // Add participants to CSV
        if (dateShiftParticipants.length === 0) {
          csvContent += "Belum ada partisipan terdaftar\n";
        } else {
          dateShiftParticipants.forEach((p, i) => {
            csvContent += `${i + 1},"${p.name}","${p.email}","wa.me/${
              p.phone || "-"
            }","${p.domisili || "-"}"\n`;
          });
        }

        // Tambah spacing
        csvContent += "\n";
      });
    });

    // Generate filename dengan tanggal
    const now = new Date();
    const dateString = now.toISOString().split("T")[0];
    const eventName = event.title
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "");
    const filename = `participants_${eventName}_${dateString}.csv`;

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
        {/* Back Button */}
        <button
          onClick={() => router.push("/admin/dashboard/participants")}
          className="text-gray-600 hover:text-gray-800 mb-3 flex items-center space-x-1 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
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
                Pilih tanggal dan shift untuk melihat daftar partisipan
              </p>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-sm font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Section 1: Date & Shift Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Jadwal Pelaksanaan
          </h2>

          {availableDates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Tidak ada jadwal tersedia untuk event ini
            </p>
          ) : (
            <div className="space-y-4">
              {availableDates.map((dateInfo) => (
                <div
                  key={dateInfo.date}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {/* Date Header */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {formatDate(dateInfo.date)}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {dateInfo.shifts.length} shift tersedia
                    </p>
                  </div>

                  {/* Shifts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dateInfo.shifts.map((shift, shiftIndex) => {
                      const isSelected =
                        selectedDate === dateInfo.date &&
                        selectedShift === shiftIndex;
                      const bookedPercentage =
                        shift.quota > 0
                          ? (shift.booked / shift.quota) * 100
                          : 0;

                      return (
                        <button
                          key={shiftIndex}
                          onClick={() =>
                            handleShiftClick(dateInfo.date, shiftIndex)
                          }
                          className={`p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 hover:border-green-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-800">
                              {shift.startTime} - {shift.endTime}
                            </span>
                            {isSelected && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            {shift.booked} / {shift.quota} peserta
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                bookedPercentage >= 80
                                  ? "bg-red-500"
                                  : bookedPercentage >= 50
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(bookedPercentage, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Participants Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedDate && selectedShift !== null
                ? `Partisipan - ${formatDate(selectedDate)} (${getShiftTime(
                    selectedDate,
                    selectedShift
                  )})`
                : selectedDate
                ? `Partisipan - ${formatDate(selectedDate)} (Semua Shift)`
                : "Daftar Partisipan"}
            </h2>
            {selectedDate && participants.length > 0 && (
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Total: {participants.length} peserta
              </span>
            )}
          </div>

          {/* ✅ Use ParticipantsTable Component */}
          <ParticipantsTable
            participants={participants}
            isLoading={isLoading}
            selectedDate={selectedDate}
            selectedShift={selectedShift}
            eventSchedule={event.schedule}
          />
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetailPage;
