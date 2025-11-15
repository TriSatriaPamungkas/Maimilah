"use client";
import React, { useMemo, useState } from "react";

interface DateQuota {
  date: string; // ISO date e.g. "2025-11-04"
  quota: number; // kuota maksimal partisipan
  registered: number; // jumlah yang sudah daftar
  active: boolean; // apakah tanggal ini aktif
}

interface DataPickerProps {
  availableDates: DateQuota[]; // data tanggal dengan kuota
  selectedDates?: string[];
  onChange?: (selected: string[]) => void;
  maxSelection?: number;
  monthLabel?: string;
  mode?: "monthRange" | "specificDates"; // <--- tambah mode
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });

export const DataPicker: React.FC<DataPickerProps> = ({
  availableDates,
  selectedDates = [],
  onChange,
  maxSelection = Infinity,
  monthLabel,
  mode = "monthRange",
}) => {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedDates);

  const grouped = useMemo(() => {
    if (availableDates.length === 0) return [];

    // kalau mode-nya specificDates, langsung return tanggal aktif aja
    if (mode === "specificDates") {
      return availableDates.filter((d) => d.active);
    }

    // kalau monthRange, generate semua tanggal dalam bulan yang sama
    const sample = new Date(availableDates[0].date);
    const year = sample.getFullYear();
    const month = sample.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: totalDays }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${day}`;
      const found = availableDates.find((d) => d.date === iso);
      return (
        found || {
          date: iso,
          quota: 0,
          registered: 0,
          active: false,
        }
      );
    });
  }, [availableDates, mode]);

  const toggleDate = (iso: string) => {
    const dateData = availableDates.find((d) => d.date === iso);
    if (!dateData?.active || dateData.registered >= dateData.quota) return;

    if (localSelected.includes(iso)) {
      const next = localSelected.filter((s) => s !== iso);
      setLocalSelected(next);
      onChange?.(next);
      return;
    }

    if (localSelected.length >= maxSelection) return;
    const next = [...localSelected, iso];
    setLocalSelected(next);
    onChange?.(next);
  };

  return (
    <div className="w-full">
      {monthLabel && (
        <div className="text-sm font-semibold text-gray-700 mb-3">
          Pilih Tanggal di Bulan {monthLabel}
        </div>
      )}

      <div
        className={`grid ${
          mode === "specificDates"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
            : "grid-cols-4 sm:grid-cols-5 md:grid-cols-7"
        } gap-3`}
      >
        {grouped.map(({ date, quota, registered, active }) => {
          const selected = localSelected.includes(date);
          const isFull = registered >= quota && quota > 0;
          const disabled = !active || isFull;

          return (
            <label
              key={date}
              className={`flex flex-col items-center border rounded-lg py-2 cursor-pointer transition ${
                disabled
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
              }`}
            >
              <input
                type="checkbox"
                disabled={disabled}
                checked={selected}
                onChange={() => toggleDate(date)}
                className="hidden"
              />
              <span className="text-xs">
                {new Date(date).toLocaleDateString("id-ID", {
                  weekday: "short",
                })}
              </span>
              <span className="font-medium">{fmt(date)}</span>
              {quota > 0 && (
                <span
                  className={`text-[10px] mt-1 ${
                    isFull ? "text-red-500" : "text-gray-500"
                  }`}
                >
                  {registered}/{quota} {isFull && "(Penuh)"}
                </span>
              )}
            </label>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        {isFinite(maxSelection) && (
          <p>
            Maksimal {maxSelection} tanggal bisa dipilih •{" "}
            <span className="font-medium">{localSelected.length}</span> dipilih
          </p>
        )}
      </div>
    </div>
  );
};
