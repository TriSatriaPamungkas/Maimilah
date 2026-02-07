// src/components/molecules/dateCheckboxGrid.tsx
"use client";
import React from "react";
import { SelectedDateShift } from "@/src/store/useRegistrationStore";

interface ShiftInfo {
  startTime: string;
  endTime: string;
  quota: number;
  booked: number;
}

interface AvailableDate {
  date: string;
  shifts: ShiftInfo[];
}

interface DateCheckboxGridProps {
  mode: "user" | "admin";
  availableDates: AvailableDate[];
  selectedDateShifts?: SelectedDateShift[];
  onChange?: (selections: SelectedDateShift[]) => void;
  // Legacy support
  selectedDates?: string[];
  onLegacyChange?: (dates: string[]) => void;
}

export const DateCheckboxGrid: React.FC<DateCheckboxGridProps> = ({
  availableDates,
  selectedDateShifts = [],
  onChange,
}) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isShiftSelected = (date: string, shiftIndex: number): boolean => {
    return selectedDateShifts.some(
      (sel) => sel.date === date && sel.shiftIndex === shiftIndex
    );
  };

  const handleShiftToggle = (date: string, shiftIndex: number) => {
    if (!onChange) return;

    const isSelected = isShiftSelected(date, shiftIndex);

    if (isSelected) {
      // Remove this shift
      const updated = selectedDateShifts.filter(
        (sel) => !(sel.date === date && sel.shiftIndex === shiftIndex)
      );
      onChange(updated);
    } else {
      // Add this shift
      const updated = [...selectedDateShifts, { date, shiftIndex }];
      onChange(updated);
    }
  };

  const isShiftFull = (shift: ShiftInfo): boolean => {
    return shift.booked >= shift.quota;
  };

  const getShiftStatus = (
    shift: ShiftInfo
  ): {
    text: string;
    colorClass: string;
  } => {
    const remaining = shift.quota - shift.booked;
    const percentage = (shift.booked / shift.quota) * 100;

    if (remaining === 0) {
      return { text: "PENUH", colorClass: "bg-red-100 text-red-700" };
    } else if (percentage >= 80) {
      return {
        text: `${remaining} slot`,
        colorClass: "bg-yellow-100 text-yellow-700",
      };
    } else {
      return {
        text: `${remaining} slot`,
        colorClass: "bg-green-100 text-green-700",
      };
    }
  };

  if (availableDates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Tidak ada tanggal tersedia</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availableDates.map((dateItem, dateIndex) => (
        <div
          key={dateIndex}
          className="border border-gray-200 rounded-lg p-4 bg-white"
        >
          {/* Date Header */}
          <div className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
            <span>{formatDate(dateItem.date)}</span>
            <span className="text-xs text-gray-500">
              {dateItem.shifts.length} shift tersedia
            </span>
          </div>

          {/* Shifts Grid */}
          <div className="space-y-2">
            {dateItem.shifts.map((shift, shiftIndex) => {
              const selected = isShiftSelected(dateItem.date, shiftIndex);
              const full = isShiftFull(shift);
              const status = getShiftStatus(shift);

              return (
                <label
                  key={shiftIndex}
                  className={`
                    flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${
                      selected
                        ? "border-green-500 bg-green-50"
                        : full
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() =>
                        handleShiftToggle(dateItem.date, shiftIndex)
                      }
                      disabled={full && !selected}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:cursor-not-allowed"
                    />

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1">
                      <span className="font-medium text-gray-700">
                        Shift {shiftIndex + 1}
                      </span>
                      <span className="text-sm text-gray-600">
                        {shift.startTime} - {shift.endTime} WITA
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${status.colorClass}`}
                  >
                    {status.text}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Quota Summary */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Total kuota hari ini:</span>
              <span>
                {dateItem.shifts.reduce((sum, s) => sum + s.booked, 0)} /{" "}
                {dateItem.shifts.reduce((sum, s) => sum + s.quota, 0)} peserta
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
