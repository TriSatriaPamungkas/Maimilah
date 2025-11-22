"use client";
//src/components/molecules/eventCard.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/src/components/atoms/button";
import { Badge } from "@/src/components/atoms/badge";
import { EventSummary } from "@/src/store/useEventStore";

interface EventCardProps {
  event: EventSummary;
  onViewDetails?: (event: EventSummary) => void;
  onRegister?: (id: string) => void;
  variant?: "user" | "admin";
}

interface ParticipantData {
  _id: string;
  selectedDates?: string[];
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onRegister,
  variant = "user",
}) => {
  const [bookedSlots, setBookedSlots] = useState(0);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // 🆕 Calculate number of days for the event
  const getNumberOfDays = (): number => {
    if (!event.schedule || !event.schedule.type) {
      return 1;
    }

    if (event.schedule.type === "range") {
      const startDate = new Date(event.schedule.startDate);
      const endDate = new Date(event.schedule.endDate);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      return event.schedule.schedule.length;
    }

    return 1;
  };

  const numberOfDays = getNumberOfDays();
  const totalQuota = event.quota * numberOfDays;

  // 🆕 Fetch participant data untuk hitung total booked slots
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!event.participants || event.participants.length === 0) {
        setBookedSlots(0);
        return;
      }

      setIsLoadingSlots(true);
      try {
        // Fetch semua participant data
        const participantPromises = event.participants.map((participantId) =>
          fetch(`/api/participant/${participantId}`)
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null)
        );

        const results = await Promise.all(participantPromises);

        // 🔧 FIX: Hitung total booked slots berdasarkan tanggal yang dipilih setiap participant
        const total = results.reduce((sum, result) => {
          // Jika API gagal atau data tidak ada, skip participant ini
          if (!result || !result.data) {
            console.warn(
              "Participant data tidak ditemukan, skip dari perhitungan"
            );
            return sum;
          }

          const participant: ParticipantData = result.data;

          // Jika ada selectedDates dan berupa array dengan isi, hitung jumlah hari yang diboking
          if (
            participant.selectedDates &&
            Array.isArray(participant.selectedDates) &&
            participant.selectedDates.length > 0
          ) {
            // Setiap tanggal yang dipilih = 1 slot terboking
            return sum + participant.selectedDates.length;
          }

          // Jika selectedDates kosong atau undefined, skip dari perhitungan
          console.warn(
            "selectedDates tidak valid untuk participant, skip dari perhitungan"
          );
          return sum;
        }, 0);

        setBookedSlots(total);
      } catch (error) {
        console.error("Error fetching booked slots:", error);
        // Fallback: set 0 karena tidak bisa menghitung dengan akurat
        setBookedSlots(0);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [event.participants, event._id, event.id, numberOfDays]);

  const remainingQuota = totalQuota - bookedSlots;
  const quotaPercentage = totalQuota > 0 ? (bookedSlots / totalQuota) * 100 : 0;

  // format tanggal ke gaya Indo
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const now = new Date();

  // Fix: Validasi schedule sebelum mengakses propertinya
  const isPast = (() => {
    if (!event.schedule || !event.schedule.type) {
      return false;
    }

    if (event.schedule.type === "range") {
      return event.schedule.endDate
        ? new Date(event.schedule.endDate) < now
        : false;
    } else if (event.schedule.type === "selected") {
      return event.schedule.schedule
        ? event.schedule.schedule.every((s) => new Date(s.date) < now)
        : false;
    }

    return false;
  })();

  const renderSchedule = () => {
    if (!event.schedule || !event.schedule.type) {
      return (
        <span className="text-gray-500 text-sm">Jadwal belum ditentukan</span>
      );
    }

    if (event.schedule.type === "range") {
      const { startDate, endDate, startTime, endTime } = event.schedule;
      return (
        <>
          <span className="font-medium text-gray-700">Tanggal: </span>
          {`${formatDate(startDate)} - ${formatDate(endDate)}`}
          <br />
          <span className="font-medium text-gray-700">Waktu: </span>
          {`${startTime} - ${endTime} WITA`}
        </>
      );
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      return (
        <div className="flex flex-col gap-1">
          {event.schedule.schedule.map((s, i) => (
            <div key={i}>
              <span className="font-medium text-gray-700">
                {formatDate(s.date)}:
              </span>{" "}
              {`${s.startTime} - ${s.endTime} WITA`}
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-500 text-sm">Jadwal tidak valid</span>;
  };

  // Render compact untuk admin
  const renderScheduleCompact = () => {
    if (!event.schedule || !event.schedule.type) {
      return "Jadwal belum ditentukan";
    }

    if (event.schedule.type === "range") {
      const { startDate, endDate, startTime, endTime } = event.schedule;
      return (
        <div className="text-sm text-gray-600">
          <div>{`${formatDate(startDate)} - ${formatDate(endDate)}`}</div>
          <div className="text-xs text-gray-500">{`${startTime} - ${endTime} WITA`}</div>
        </div>
      );
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      const firstSchedule = event.schedule.schedule[0];
      const hasMore = event.schedule.schedule.length > 1;

      return (
        <div className="text-sm text-gray-600">
          <div>
            {formatDate(firstSchedule.date)}:{" "}
            {`${firstSchedule.startTime} - ${firstSchedule.endTime} WITA`}
          </div>
          {hasMore && (
            <div className="text-xs text-gray-500">
              +{event.schedule.schedule.length - 1} tanggal lainnya
            </div>
          )}
        </div>
      );
    }

    return "Jadwal tidak valid";
  };

  // Admin variant - compact design
  if (variant === "admin") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
        {/* Header - Fixed height */}
        <div className="flex items-start justify-between mb-3 min-h-12">
          <h3 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2 flex-1 pr-2">
            {event.title}
          </h3>
          <Badge
            text={isPast ? "Ended" : "Active"}
            variant={isPast ? "error" : "success"}
          />
        </div>

        {/* Deskripsi - Fixed 3 lines */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-15">
          {event.description}
        </p>

        {/* Info Section - Fixed height */}
        <div className="space-y-2 mb-3 grow">
          {/* Lokasi */}
          <div className="text-sm">
            <span className="font-medium text-gray-700">Lokasi: </span>
            <span className="text-gray-600">{event.location}</span>
          </div>

          {/* Tanggal - Compact */}
          <div className="text-sm">
            <span className="font-medium text-gray-700">Tanggal: </span>
            {renderScheduleCompact()}
          </div>
        </div>

        {/* Progress Bar - Fixed height */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1.5">
            <span className="font-medium">
              {isLoadingSlots ? (
                "Memuat..."
              ) : (
                <>
                  Kuota Tersisa: {remainingQuota} dari {totalQuota}
                </>
              )}
            </span>
            <span className="font-medium">{Math.round(quotaPercentage)}%</span>
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
              style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
            ></div>
          </div>
          {!isLoadingSlots && (
            <div className="text-xs text-gray-500 mt-1">
              {bookedSlots} slot terbooked dari {totalQuota} slot tersedia
            </div>
          )}
        </div>

        {/* Button - Fixed at bottom */}
        <div className="mt-auto">
          {onViewDetails && (
            <Button
              onClick={() => onViewDetails(event)}
              variant="primary"
              fullWidth
            >
              Lihat Detail & Partisipan
            </Button>
          )}
        </div>
      </div>
    );
  }

  // User variant - original full design
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 min-h-12">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 leading-snug">
          {event.title}
        </h3>
        <Badge
          text={isPast ? "Ended" : "Active"}
          variant={isPast ? "error" : "success"}
        />
      </div>

      {/* Deskripsi */}
      <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-15">
        {event.description}
      </p>

      {/* Lokasi & jadwal */}
      <div className="space-y-2 mb-3 grow text-sm text-gray-500 ">
        <div>
          <span className="font-medium text-gray-700">Lokasi: </span>
          {event.location}
        </div>
        <div>{renderSchedule()}</div>
      </div>

      {/* Kuota & Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
          <span className="font-medium">
            {isLoadingSlots ? (
              "Memuat kuota..."
            ) : (
              <>
                Kuota Tersisa: {remainingQuota} dari {totalQuota}
              </>
            )}
          </span>
          <span className="font-medium">{Math.round(quotaPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              quotaPercentage >= 80
                ? "bg-red-500"
                : quotaPercentage >= 50
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
          ></div>
        </div>
        {!isLoadingSlots && (
          <div className="text-xs text-gray-500 mt-1">
            {bookedSlots} slot terbooked • {numberOfDays} hari tersedia
          </div>
        )}
      </div>

      {/* Benefit */}
      {event.benefits && event.benefits.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Benefit:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            {event.benefits.slice(0, 2).map((benefit, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                {benefit}
              </li>
            ))}
            {event.benefits.length > 2 && (
              <li className="text-gray-500 text-xs">
                +{event.benefits.length - 2} benefit lainnya
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Buttons */}
      <div className="mt-auto pt-3 space-y-2">
        {onViewDetails && (
          <Button
            onClick={() => onViewDetails(event)}
            variant="primary"
            fullWidth
          >
            Lihat Detail & Partisipan
          </Button>
        )}

        {onRegister && (
          <Button
            onClick={() =>
              (event._id || event.id) && onRegister(event._id || event.id || "")
            }
            variant={isPast ? "secondary" : "primary"}
            fullWidth
            disabled={isPast}
          >
            {isPast ? "Pendaftaran Ditutup" : "Daftar Sekarang"}
          </Button>
        )}
      </div>
    </div>
  );
};
