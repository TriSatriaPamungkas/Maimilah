/* eslint-disable react-hooks/set-state-in-effect */
// src/components/organism/editEventModal.tsx
import React, { useState, useEffect } from "react";
import {
  EventSummary,
  EventSchedule,
  useEventStore,
} from "@/src/store/useEventStore";
import { CheckCircle } from "lucide-react"; // ✅ Import icon

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventSummary;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const updateEvent = useEventStore((state) => state.updateEvent);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    quota: 10,
    scheduleType: "selected" as "selected" | "range",
    benefits: [""],
  });

  const [selectedDates, setSelectedDates] = useState<
    { date: string; startTime: string; endTime: string }[]
  >([{ date: "", startTime: "09:00", endTime: "17:00" }]);

  const [rangeData, setRangeData] = useState({
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // ✅ Toast state

  // Load data event saat modal dibuka
  useEffect(() => {
    if (isOpen && event) {
      setFormData({
        title: event.title,
        description: event.description,
        location: event.location,
        quota: event.quota,
        scheduleType: event.schedule?.type === "range" ? "range" : "selected",
        benefits:
          event.benefits && event.benefits.length > 0 ? event.benefits : [""],
      });

      if (event.schedule?.type === "selected" && event.schedule.schedule) {
        setSelectedDates(event.schedule.schedule);
      } else if (event.schedule?.type === "range") {
        setRangeData({
          startDate: event.schedule.startDate,
          endDate: event.schedule.endDate,
          startTime: event.schedule.startTime,
          endTime: event.schedule.endTime,
        });
      }
    }
  }, [isOpen, event]);

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
      { date: "", startTime: "09:00", endTime: "17:00" },
    ]);
  };

  const handleDateChange = (index: number, field: string, value: string) => {
    const newDates = [...selectedDates];
    newDates[index] = { ...newDates[index], [field]: value };
    setSelectedDates(newDates);
  };

  const handleRemoveDate = (index: number) => {
    setSelectedDates(selectedDates.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      let schedule: EventSchedule;

      if (formData.scheduleType === "selected") {
        const filteredDates = selectedDates.filter((date) => date.date !== "");

        if (filteredDates.length === 0) {
          alert("Minimal harus ada satu tanggal yang dipilih");
          setIsSubmitting(false);
          return;
        }

        schedule = {
          type: "selected" as const,
          schedule: filteredDates.map((date) => ({
            date: date.date,
            startTime: date.startTime,
            endTime: date.endTime,
          })),
        };
      } else {
        schedule = {
          type: "range" as const,
          startDate: rangeData.startDate,
          endDate: rangeData.endDate,
          startTime: rangeData.startTime,
          endTime: rangeData.endTime,
        };
      }

      const updatedEvent: Partial<EventSummary> = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        quota: formData.quota,
        schedule,
        benefits: formData.benefits.filter((benefit) => benefit.trim() !== ""),
      };

      // Get event ID - prioritas _id dari MongoDB
      const eventId = event._id || event.id;

      if (!eventId) {
        alert("Event ID tidak ditemukan");
        setIsSubmitting(false);
        return;
      }

      console.log("Updating event with ID:", eventId);
      console.log("Update data:", updatedEvent);

      await updateEvent(eventId, updatedEvent);

      // ✅ Show success toast instead of alert
      setShowSuccess(true);

      // ✅ Close modal after 1.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Gagal mengupdate event. Silakan coba lagi.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* ✅ Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-[9999] animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-white" />
            <div>
              <p className="font-semibold">Event Berhasil Diupdate!</p>
              <p className="text-sm text-green-100">Perubahan telah disimpan</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-green-50 px-6 py-4 border-b border-green-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Edit Event</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update informasi event yang sudah ada
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full p-2 transition-colors disabled:opacity-50"
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

          {/* Form Content - Scrollable */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama Event */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Event <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100"
                  placeholder="Masukkan nama event"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi Event <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  disabled={isSubmitting}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none disabled:bg-gray-100"
                  placeholder="Deskripsi lengkap tentang event"
                />
              </div>

              {/* Lokasi & Kuota */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100"
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
                    disabled={isSubmitting}
                    min="1"
                    value={formData.quota}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        quota: value === "" ? 1 : parseInt(value) || 1,
                      });
                    }}
                    onBlur={(e) => {
                      if (!e.target.value || parseInt(e.target.value) < 1) {
                        setFormData({ ...formData, quota: 1 });
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100"
                    placeholder="Max peserta"
                  />
                </div>
              </div>

              {/* Tipe Jadwal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipe Jadwal
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      value="selected"
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                      checked={formData.scheduleType === "range"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scheduleType: e.target.value as "selected" | "range",
                        })
                      }
                      className="mr-2 w-4 h-4 text-green-500 accent-green-500 focus:ring-green-600"
                    />
                    <span className="text-sm text-gray-700">
                      Rentang Tanggal
                    </span>
                  </label>
                </div>
              </div>

              {/* Schedule Fields */}
              {formData.scheduleType === "selected" ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Tanggal & Waktu Terpilih{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {selectedDates.map((date, index) => (
                      <div
                        key={index}
                        className="flex space-x-2 items-start bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <input
                          type="date"
                          required
                          disabled={isSubmitting}
                          value={date.date}
                          onChange={(e) =>
                            handleDateChange(index, "date", e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                        <input
                          type="time"
                          disabled={isSubmitting}
                          value={date.startTime}
                          onChange={(e) =>
                            handleDateChange(index, "startTime", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                        <span className="py-2 text-gray-500">—</span>
                        <input
                          type="time"
                          disabled={isSubmitting}
                          value={date.endTime}
                          onChange={(e) =>
                            handleDateChange(index, "endTime", e.target.value)
                          }
                          className="px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        />
                        {selectedDates.length > 1 && (
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleRemoveDate(index)}
                            className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleAddDate}
                      className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                    >
                      <span>+</span>
                      <span>Tambah Tanggal Lain</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      disabled={isSubmitting}
                      value={rangeData.startDate}
                      onChange={(e) =>
                        setRangeData({
                          ...rangeData,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tanggal Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      disabled={isSubmitting}
                      value={rangeData.endDate}
                      onChange={(e) =>
                        setRangeData({ ...rangeData, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Waktu Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      disabled={isSubmitting}
                      value={rangeData.startTime}
                      onChange={(e) =>
                        setRangeData({
                          ...rangeData,
                          startTime: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Waktu Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      disabled={isSubmitting}
                      value={rangeData.endTime}
                      onChange={(e) =>
                        setRangeData({ ...rangeData, endTime: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Benefit Event <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        disabled={isSubmitting}
                        value={benefit}
                        onChange={(e) =>
                          handleBenefitChange(index, e.target.value)
                        }
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:bg-gray-100"
                        placeholder="Contoh: Sertifikat, Modul pembelajaran"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleRemoveBenefit(index)}
                          className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleAddBenefit}
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                  >
                    <span>+</span>
                    <span>Tambah Benefit Lain</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-gray-700 hover:text-gray-900 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditEventModal;
