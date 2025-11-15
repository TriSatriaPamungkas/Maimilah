// src/components/molecules/dateCheckboxGrid.tsx
"use client";

import React, { useState, useEffect } from "react";

// Props untuk Admin Mode (Click to view)
interface AdminModeProps {
  mode?: "admin";
  dates: string[];
  selectedDate: string;
  onDateClick: (date: string) => void;
  participantCounts?: { [date: string]: number };
  quotaPerDate?: number;
}

// Props untuk User Mode (Checkbox selection)
interface UserModeProps {
  mode: "user";
  availableDates: { date: string; quota: number; booked: number }[];
  selectedDates?: string[];
  onChange?: (dates: string[]) => void;
}

type DateCheckboxGridProps = AdminModeProps | UserModeProps;

const DateCheckboxGrid: React.FC<DateCheckboxGridProps> = (props) => {
  const [localSelected, setLocalSelected] = useState<string[]>([]);

  // Initialize local selected dates for user mode
  useEffect(() => {
    if (props.mode === "user" && props.selectedDates) {
      setLocalSelected(props.selectedDates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode, props.mode === "user" ? props.selectedDates : undefined]);

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate(),
      dayPadded: date.toLocaleDateString("id-ID", { day: "2-digit" }),
      weekday: date.toLocaleDateString("id-ID", { weekday: "short" }),
      fullDate: dateStr,
    };
  };

  const getDayStatus = (dateStr: string, registered: number, quota: number) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const remaining = quota - registered;
    const isFull = remaining <= 0;
    const percentage = quota > 0 ? (registered / quota) * 100 : 0;

    // Determine fill status
    let fillStatus: "empty" | "low" | "medium" | "high" | "full";
    if (isFull) {
      fillStatus = "full";
    } else if (percentage >= 75) {
      fillStatus = "high";
    } else if (percentage >= 50) {
      fillStatus = "medium";
    } else if (percentage >= 25) {
      fillStatus = "low";
    } else {
      fillStatus = "empty";
    }

    if (date < today) {
      return {
        type: "past" as const,
        remaining,
        registered,
        isFull,
        fillStatus,
      };
    } else if (date.toDateString() === today.toDateString()) {
      return {
        type: "today" as const,
        remaining,
        registered,
        isFull,
        fillStatus,
      };
    } else {
      return {
        type: "upcoming" as const,
        remaining,
        registered,
        isFull,
        fillStatus,
      };
    }
  };

  const getCardStyle = (
    isSelected: boolean,
    isFull: boolean,
    isPast: boolean,
    fillStatus: string,
    mode?: string
  ) => {
    // Admin mode: tidak ada disabled styling untuk past dates
    if (mode === "admin") {
      if (isSelected) {
        return "bg-green-600 text-white border-green-600 shadow-md scale-105";
      }
      if (isFull) {
        return "bg-red-50 text-red-600 border-red-400";
      }
      if (isPast) {
        return "bg-gray-50 text-gray-600 border-gray-300 hover:border-gray-400";
      }

      // Color coding by fill status for admin
      switch (fillStatus) {
        case "high":
          return "bg-orange-50 text-orange-700 border-orange-300 hover:border-orange-400";
        case "medium":
          return "bg-yellow-50 text-yellow-700 border-yellow-300 hover:border-yellow-400";
        case "low":
          return "bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-400";
        default:
          return "bg-white text-gray-800 border-gray-300 hover:border-green-400 hover:shadow-sm";
      }
    }

    // User mode: past dates get disabled styling
    if (isFull && isPast) {
      return "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-60";
    }
    if (isSelected) {
      return "bg-green-600 text-white border-green-600 shadow-md scale-105";
    }
    if (isFull || isPast) {
      return "bg-red-50 text-red-600 border-red-400 cursor-not-allowed";
    }

    // Color coding by fill status
    switch (fillStatus) {
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-300 hover:border-orange-400";
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-300 hover:border-yellow-400";
      case "low":
        return "bg-blue-50 text-blue-700 border-blue-300 hover:border-blue-400";
      default:
        return "bg-white text-gray-800 border-gray-300 hover:border-green-400 hover:shadow-sm";
    }
  };

  // Admin Mode Render
  if (props.mode !== "user") {
    const {
      dates,
      selectedDate,
      onDateClick,
      participantCounts = {},
      quotaPerDate = 0,
    } = props;

    return (
      <div className="w-full">
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
          {dates.map((date) => {
            const { dayPadded, weekday, fullDate } = formatDateShort(date);
            const isSelected = selectedDate === fullDate;
            const registered = participantCounts[fullDate] || 0;
            const { type, remaining, isFull, fillStatus } = getDayStatus(
              fullDate,
              registered,
              quotaPerDate
            );

            return (
              <button
                key={fullDate}
                onClick={() => onDateClick(fullDate)}
                // Admin tidak pernah disabled
                disabled={false}
                className={`
                  relative flex flex-col items-center justify-center border-2 rounded-lg p-2 
                  cursor-pointer transition-all duration-200 min-h-20
                  ${getCardStyle(
                    isSelected,
                    isFull,
                    type === "past",
                    fillStatus,
                    "admin"
                  )}
                `}
              >
                {/* Weekday */}
                <span className={`text-xs ${isSelected ? "text-white" : ""}`}>
                  {weekday}
                </span>

                {/* Day */}
                <span
                  className={`font-bold text-lg my-1 ${
                    isSelected ? "text-white" : ""
                  }`}
                >
                  {dayPadded}
                </span>

                {/* Quota Info */}
                <span
                  className={`text-[10px] font-medium ${
                    isSelected
                      ? "text-white"
                      : isFull
                      ? "text-red-600 font-bold"
                      : ""
                  }`}
                >
                  {type === "past" && isFull
                    ? "SELESAI"
                    : isFull
                    ? "PENUH"
                    : quotaPerDate > 0
                    ? `${remaining} tersisa`
                    : `${registered} terdaftar`}
                </span>

                {/* Today Badge */}
                {type === "today" && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                    HARI INI
                  </span>
                )}

                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <svg
                      className="w-3 h-3 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // User Mode Render
  const { availableDates, onChange } = props;

  const toggleDate = (date: string) => {
    const selected = localSelected.includes(date)
      ? localSelected.filter((d) => d !== date)
      : [...localSelected, date];
    setLocalSelected(selected);
    onChange?.(selected);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-3">
        {availableDates.map(({ date, quota, booked }) => {
          const { dayPadded, weekday, fullDate } = formatDateShort(date);
          const selected = localSelected.includes(fullDate);
          const { type, remaining, isFull, fillStatus } = getDayStatus(
            fullDate,
            booked,
            quota
          );
          // User mode: disabled jika penuh ATAU sudah lewat
          const isDisabled = isFull || type === "past";

          return (
            <label
              key={fullDate}
              className={`
                relative flex flex-col items-center justify-center border-2 rounded-lg p-2 
                transition-all duration-200 min-h-20
                ${getCardStyle(
                  selected,
                  isFull,
                  type === "past",
                  fillStatus,
                  "user"
                )}
                ${isDisabled ? "" : "cursor-pointer"}
              `}
            >
              <input
                type="checkbox"
                disabled={isDisabled}
                checked={selected}
                onChange={() => toggleDate(fullDate)}
                className="hidden"
              />

              {/* Weekday */}
              <span
                className={`text-xs ${
                  selected
                    ? "text-white"
                    : isFull || type === "past"
                    ? "text-red-600"
                    : ""
                }`}
              >
                {weekday}
              </span>

              {/* Day */}
              <span
                className={`font-bold text-lg my-1 ${
                  selected
                    ? "text-white"
                    : isFull || type === "past"
                    ? "text-red-600"
                    : ""
                }`}
              >
                {dayPadded}
              </span>

              {/* Quota Info */}
              <span
                className={`text-[10px] font-medium ${
                  selected
                    ? "text-white"
                    : isFull || type === "past"
                    ? "text-red-600 font-bold"
                    : ""
                }`}
              >
                {type === "past"
                  ? "LEWAT"
                  : isFull
                  ? "PENUH"
                  : `${remaining} tersisa`}
              </span>

              {/* Today Badge */}
              {type === "today" && !selected && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                  HARI INI
                </span>
              )}

              {/* Selected Checkmark */}
              {selected && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <svg
                    className="w-3 h-3 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Disabled overlay - hanya untuk user mode */}
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-50 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    />
                  </svg>
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* Simple info for user - no legend */}
      <div className="mt-3 text-xs text-gray-600">
        <p>
          💡 Pilih tanggal yang Anda ingin hadiri. Tanggal merah menandakan
          kuota sudah penuh atau sudah terlewati.
        </p>
      </div>
    </div>
  );
};

export default DateCheckboxGrid;
export { DateCheckboxGrid };
