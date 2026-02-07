/* eslint-disable react-hooks/purity */
// src/components/organism/addEventModal.tsx
import React, { useState } from "react";
import {
  EventSummary,
  EventSchedule,
  TimeShift,
  ScheduleItem,
  useEventStore,
} from "@/src/store/useEventStore";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose }) => {
  const addEvent = useEventStore((state) => state.addEvent);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    quota: 10,
    scheduleType: "selected" as "selected" | "range",
    benefits: [""],
  });

  const [selectedDates, setSelectedDates] = useState<ScheduleItem[]>([
    { date: "", shifts: [{ startTime: "09:00", endTime: "17:00" }] },
  ]);

  const [rangeData, setRangeData] = useState({
    startDate: "",
    endDate: "",
    shifts: [{ startTime: "09:00", endTime: "17:00" }] as TimeShift[],
  });

  const handleAddBenefit = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, ""],
    });
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleRemoveBenefit = (index: number) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleAddDate = () => {
    setSelectedDates([
      ...selectedDates,
      { date: "", shifts: [{ startTime: "09:00", endTime: "17:00" }] },
    ]);
  };

  const handleDateChange = (index: number, value: string) => {
    const newDates = [...selectedDates];
    newDates[index] = { ...newDates[index], date: value };
    setSelectedDates(newDates);
  };

  const handleRemoveDate = (index: number) => {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
  };

  const handleAddShift = (dateIndex: number) => {
    const newDates = [...selectedDates];
    newDates[dateIndex].shifts.push({ startTime: "09:00", endTime: "17:00" });
    setSelectedDates(newDates);
  };

  const handleShiftChange = (
    dateIndex: number,
    shiftIndex: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newDates = [...selectedDates];
    newDates[dateIndex].shifts[shiftIndex][field] = value;
    setSelectedDates(newDates);
  };

  const handleRemoveShift = (dateIndex: number, shiftIndex: number) => {
    const newDates = [...selectedDates];
    newDates[dateIndex].shifts = newDates[dateIndex].shifts.filter(
      (_, i) => i !== shiftIndex
    );
    setSelectedDates(newDates);
  };

  const handleAddRangeShift = () => {
    setRangeData({
      ...rangeData,
      shifts: [...rangeData.shifts, { startTime: "09:00", endTime: "17:00" }],
    });
  };

  const handleRangeShiftChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const newShifts = [...rangeData.shifts];
    newShifts[index][field] = value;
    setRangeData({ ...rangeData, shifts: newShifts });
  };

  const handleRemoveRangeShift = (index: number) => {
    setRangeData({
      ...rangeData,
      shifts: rangeData.shifts.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let schedule: EventSchedule;

    if (formData.scheduleType === "selected") {
      const filteredDates = selectedDates.filter((date) => date.date !== "");

      if (filteredDates.length === 0) {
        alert("Minimal harus ada satu tanggal yang dipilih");
        return;
      }

      // Validasi setiap tanggal harus punya minimal 1 shift
      for (const date of filteredDates) {
        if (!date.shifts || date.shifts.length === 0) {
          alert("Setiap tanggal harus memiliki minimal 1 shift waktu");
          return;
        }
      }

      schedule = {
        type: "selected" as const,
        schedule: filteredDates,
      };
    } else {
      if (!rangeData.startDate || !rangeData.endDate) {
        alert("Tanggal mulai dan selesai harus diisi");
        return;
      }

      if (rangeData.shifts.length === 0) {
        alert("Minimal harus ada satu shift waktu");
        return;
      }

      schedule = {
        type: "range" as const,
        startDate: rangeData.startDate,
        endDate: rangeData.endDate,
        shifts: rangeData.shifts,
      };
    }

    const newEvent: EventSummary = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      location: formData.location,
      quota: formData.quota,
      schedule,
      benefits: formData.benefits.filter((benefit) => benefit.trim() !== ""),
      participants: [],
    };

    try {
      await addEvent(newEvent);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding event:", error);
      alert("Gagal menambahkan event. Silakan coba lagi.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      quota: 10,
      scheduleType: "selected",
      benefits: [""],
    });
    setSelectedDates([
      { date: "", shifts: [{ startTime: "09:00", endTime: "17:00" }] },
    ]);
    setRangeData({
      startDate: "",
      endDate: "",
      shifts: [{ startTime: "09:00", endTime: "17:00" }],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Tambah Event Baru
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Lengkapi informasi event yang akan dibuat
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full p-2 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Event <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Masukkan nama event"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deskripsi Event <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                placeholder="Deskripsi lengkap tentang event"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Lokasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Tempat pelaksanaan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kuota Peserta <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quota}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      quota: value === "" ? 1 : parseInt(value) || 1,
                    });
                  }}
                  className="w-full px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Max peserta"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tipe Jadwal
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="selected"
                    checked={formData.scheduleType === "selected"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleType: e.target.value as "selected" | "range",
                      })
                    }
                    className="mr-2 w-4 h-4 text-green-500 accent-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">
                    Tanggal Terpilih
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="range"
                    checked={formData.scheduleType === "range"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleType: e.target.value as "selected" | "range",
                      })
                    }
                    className="mr-2 w-4 h-4 text-green-500 accent-green-500 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Rentang Tanggal</span>
                </label>
              </div>
            </div>

            {formData.scheduleType === "selected" ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tanggal & Waktu Shift
                </label>
                <div className="space-y-4">
                  {selectedDates.map((dateItem, dateIndex) => (
                    <div
                      key={dateIndex}
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="date"
                          required
                          value={dateItem.date}
                          onChange={(e) =>
                            handleDateChange(dateIndex, e.target.value)
                          }
                          className="flex-1 px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {selectedDates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDate(dateIndex)}
                            className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 ml-4">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Shift Waktu:
                        </p>
                        {dateItem.shifts.map((shift, shiftIndex) => (
                          <div
                            key={shiftIndex}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="time"
                              value={shift.startTime}
                              onChange={(e) =>
                                handleShiftChange(
                                  dateIndex,
                                  shiftIndex,
                                  "startTime",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <span className="text-gray-500">—</span>
                            <input
                              type="time"
                              value={shift.endTime}
                              onChange={(e) =>
                                handleShiftChange(
                                  dateIndex,
                                  shiftIndex,
                                  "endTime",
                                  e.target.value
                                )
                              }
                              className="px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {dateItem.shifts.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveShift(dateIndex, shiftIndex)
                                }
                                className="px-2 py-1 text-red-500 hover:text-red-700 text-sm"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => handleAddShift(dateIndex)}
                          className="text-green-600 hover:text-green-700 text-xs font-medium"
                        >
                          + Tambah Shift
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddDate}
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <span>+</span>
                    <span>Tambah Tanggal Lain</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={rangeData.startDate}
                      onChange={(e) =>
                        setRangeData({
                          ...rangeData,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={rangeData.endDate}
                      onChange={(e) =>
                        setRangeData({ ...rangeData, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    Shift Waktu (berlaku untuk semua hari)
                  </p>
                  <div className="space-y-2">
                    {rangeData.shifts.map((shift, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="time"
                          required
                          value={shift.startTime}
                          onChange={(e) =>
                            handleRangeShiftChange(
                              index,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <span className="text-gray-500">—</span>
                        <input
                          type="time"
                          required
                          value={shift.endTime}
                          onChange={(e) =>
                            handleRangeShiftChange(
                              index,
                              "endTime",
                              e.target.value
                            )
                          }
                          className="px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {rangeData.shifts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRangeShift(index)}
                            className="px-2 py-1 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddRangeShift}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      + Tambah Shift
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Benefit Event <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      required
                      value={benefit}
                      onChange={(e) =>
                        handleBenefitChange(index, e.target.value)
                      }
                      className="flex-1 px-4 py-2.5 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Contoh: Sertifikat, Modul pembelajaran"
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBenefit(index)}
                        className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>+</span>
                  <span>Tambah Benefit Lain</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all"
          >
            Simpan Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
