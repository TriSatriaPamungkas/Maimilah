/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
//src/components/molecules/eventCard.tsx
import React from "react";
import { Button } from "@/src/components/atoms/button";
import { Badge } from "@/src/components/atoms/badge";
import { EventSummary, useEventStore } from "@/src/store/useEventStore";

interface EventCardProps {
  event: EventSummary;
  onViewDetails?: (event: EventSummary) => void;
  onRegister?: (id: string) => void;
  variant?: "user" | "admin";
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onViewDetails,
  onRegister,
  variant = "user",
}) => {
  // 🔹 Ambil data dan status loading terpusat dari Store
  const getEventBookedCount = useEventStore(
    (state) => state.getEventBookedCount,
  );
  const isLoadingSlots = useEventStore((state) => state.isLoading);

  const eventId = event._id || event.id;
  const bookedSlots = eventId ? getEventBookedCount(eventId) : 0;

  // 🔹 Calculate number of days for the event
  const getNumberOfDays = (): number => {
    if (!event.schedule || !event.schedule.type) {
      return 1;
    }

    if (event.schedule.type === "range") {
      const startDate = new Date(event.schedule.startDate!);
      const endDate = new Date(event.schedule.endDate!);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      return event.schedule.schedule.length;
    }

    return 1;
  };

  const numberOfDays = getNumberOfDays();
  const quotaPerDay = event.quota;

  // Total slots available = quota × number of days
  const totalSlots = quotaPerDay * numberOfDays;

  const availableSlots = totalSlots - bookedSlots;
  const bookedPercentage =
    totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

  // 🔹 Format date to Indonesian locale
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const now = new Date();

  // 🔹 Check if event has ended
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

  // 🔹 Format shifts untuk ditampilkan
  const formatShifts = (
    shifts: Array<{ startTime: string; endTime: string }> | undefined,
  ) => {
    if (!shifts || shifts.length === 0) return "Waktu belum ditentukan";

    if (shifts.length === 1) {
      return `${shifts[0].startTime} - ${shifts[0].endTime} WITA`;
    }

    return `${shifts.length} shift tersedia`;
  };

  // 🔹 Render full schedule (for user variant)
  const renderSchedule = () => {
    if (!event.schedule || !event.schedule.type) {
      return (
        <span className="text-gray-500 text-sm">Jadwal belum ditentukan</span>
      );
    }

    if (event.schedule.type === "range") {
      const { startDate, endDate, shifts } = event.schedule;
      return (
        <>
          <span className="font-medium text-gray-700">Tanggal: </span>
          {`${formatDate(startDate!)} - ${formatDate(endDate!)}`}
          <br />
          <span className="font-medium text-gray-700">Waktu: </span>
          {formatShifts(shifts)}
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
              {formatShifts(s.shifts)}
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-500 text-sm">Jadwal tidak valid</span>;
  };

  // 🔹 Render compact schedule (for admin variant)
  const renderScheduleCompact = () => {
    if (!event.schedule || !event.schedule.type) {
      return "Jadwal belum ditentukan";
    }

    if (event.schedule.type === "range") {
      const { startDate, endDate, shifts } = event.schedule;
      return (
        <div className="text-sm text-gray-600">
          <div>{`${formatDate(startDate!)} - ${formatDate(endDate!)}`}</div>
          <div className="text-xs text-gray-500">{formatShifts(shifts)}</div>
        </div>
      );
    } else if (event.schedule.type === "selected" && event.schedule.schedule) {
      const firstSchedule = event.schedule.schedule[0];
      const hasMore = event.schedule.schedule.length > 1;

      return (
        <div className="text-sm text-gray-600">
          <div>
            {formatDate(firstSchedule.date)}:{" "}
            {formatShifts(firstSchedule.shifts)}
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

  // ========================================
  // 🎨 ADMIN VARIANT - Compact Design
  // ========================================
  if (variant === "admin") {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 min-h-12">
          <h3 className="text-base font-semibold text-gray-800 leading-tight line-clamp-2 flex-1 pr-2">
            {event.title}
          </h3>
          <Badge
            text={isPast ? "Ended" : "Active"}
            variant={isPast ? "error" : "success"}
          />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-15">
          {event.description}
        </p>

        {/* Info Section */}
        <div className="space-y-2 mb-3 grow">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Lokasi: </span>
            <span className="text-gray-600">{event.location}</span>
          </div>

          <div className="text-sm">
            <span className="font-medium text-gray-700">Tanggal: </span>
            {renderScheduleCompact()}
          </div>
        </div>

        {/* Progress Bar - Booked Slots */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1.5">
            <span className="font-medium">
              {isLoadingSlots ? (
                <span className="animate-pulse">Memuat data...</span>
              ) : (
                <>
                  Terbooked: {bookedSlots} / {totalSlots} slot
                </>
              )}
            </span>
            <span className="font-medium">{Math.round(bookedPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-300 ${
                bookedPercentage >= 80
                  ? "bg-red-500"
                  : bookedPercentage >= 50
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              style={{ width: `${Math.min(bookedPercentage, 100)}%` }}
            ></div>
          </div>
          {!isLoadingSlots && (
            <div className="text-xs text-gray-500 mt-1.5">
              {availableSlots} slot tersisa • {numberOfDays} hari tersedia
            </div>
          )}
        </div>

        {/* Action Button */}
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

  // ========================================
  // 🎨 USER VARIANT - Full Design
  // ========================================
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

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-3 mb-3 min-h-15">
        {event.description}
      </p>

      {/* Location & Schedule */}
      <div className="space-y-2 mb-3 grow text-sm text-gray-500">
        <div>
          <span className="font-medium text-gray-700">Lokasi: </span>
          {event.location}
        </div>
        <div>{renderSchedule()}</div>
      </div>

      {/* Quota & Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
          <span className="font-medium">
            {isLoadingSlots ? (
              <span className="animate-pulse">Memuat...</span>
            ) : (
              <>
                Slot Tersisa: {availableSlots} dari {totalSlots}
              </>
            )}
          </span>
          <span className="font-medium">{Math.round(bookedPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              bookedPercentage >= 80
                ? "bg-red-500"
                : bookedPercentage >= 50
                  ? "bg-yellow-500"
                  : "bg-green-500"
            }`}
            style={{ width: `${Math.min(bookedPercentage, 100)}%` }}
          ></div>
        </div>
        {!isLoadingSlots && (
          <div className="text-xs text-gray-500 mt-1">
            {bookedSlots} slot sudah dibooked • {numberOfDays} hari tersedia
          </div>
        )}
      </div>

      {/* Benefits */}
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

      {/* Action Buttons */}
      <div className="mt-auto pt-3 space-y-2">
        {onViewDetails && (
          <Button
            onClick={() => onViewDetails(event)}
            variant="secondary"
            fullWidth
          >
            Lihat Detail
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
