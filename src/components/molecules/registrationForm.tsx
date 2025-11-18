"use client";
import React, { useState, useEffect } from "react";
import { Select } from "@/src/components/atoms/select";
import { DateCheckboxGrid } from "@/src/components/molecules/dateCheckboxGrid";
import { useRegistrationStore } from "@/src/store/useRegistrationStore";
import { EventSummary } from "@/src/store/useEventStore";
import { Calendar, MapPin, Users, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface RegistrationFormProps {
  event: EventSummary;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  event,
}) => {
  const {
    registerParticipant,
    availableDates,
    initializeEventDates,
    getParticipantsByEvent,
    fetchParticipantsByEvent,
  } = useRegistrationStore();

  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "", // ✅ Tambah field phone
    domisili: "",
    source: "",
    reason: "",
    selectedDates: [] as string[],
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuota, setIsLoadingQuota] = useState(true);

  // Initialize available dates dan fetch real participant counts
  useEffect(() => {
    const initializeData = async () => {
      if (!event?.id) return;

      setIsLoadingQuota(true);

      // Initialize dates first
      initializeEventDates(event);

      // Then fetch participants to update booked counts
      await fetchParticipantsByEvent(event.id);

      setIsLoadingQuota(false);
    };

    initializeData();
  }, [event, event?.id, initializeEventDates, fetchParticipantsByEvent]);

  // Debug: Monitor availableDates changes
  useEffect(() => {
    if (availableDates.length > 0) {
      console.log("🔄 AvailableDates updated:", availableDates);
    }
  }, [availableDates]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const eventParticipants = event?.id ? getParticipantsByEvent(event.id) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate phone
    if (!form.phone || form.phone.length < 10 || form.phone.length > 13) {
      alert("Nomor telepon harus 10-13 digit!");
      setIsSubmitting(false);
      return;
    }

    if (form.selectedDates.length === 0) {
      alert("Pilih minimal satu tanggal kehadiran!");
      setIsSubmitting(false);
      return;
    }

    // Cek kuota untuk setiap tanggal yang dipilih
    const exceededQuotaDates = form.selectedDates.filter((date) => {
      const dateInfo = availableDates.find((d) => d.date === date);
      return dateInfo && dateInfo.booked >= dateInfo.quota;
    });

    if (exceededQuotaDates.length > 0) {
      const formattedDates = exceededQuotaDates.map((date) =>
        new Date(date).toLocaleDateString("id-ID")
      );
      alert(`Kuota untuk tanggal ${formattedDates.join(", ")} sudah penuh!`);
      setIsSubmitting(false);
      return;
    }

    try {
      if (!event?.id) {
        alert("Event belum dimuat dengan benar. Silakan coba lagi nanti.");
        setIsSubmitting(false);
        return;
      }

      const registrationData = {
        name: form.fullName,
        email: form.email,
        phone: form.phone,
        domisili: form.domisili,
        source: form.source,
        reason: form.reason,
        selectedDates: form.selectedDates,
      };

      console.log("📤 Submitting registration with data:", registrationData);
      console.log("📱 Phone value:", form.phone, "Length:", form.phone.length);

      await registerParticipant(event.id, registrationData);

      console.log("✅ Registration successful");

      // Show success toast
      setShowSuccess(true);

      // Reset form
      setForm({
        fullName: "",
        email: "",
        phone: "",
        domisili: "",
        source: "",
        reason: "",
        selectedDates: [],
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/event");
      }, 2000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Registration error:", error);
      alert(
        `Terjadi kesalahan saat mendaftar: ${
          error.message || "Silakan coba lagi"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatEventSchedule = () => {
    if (event.schedule.type === "selected") {
      return event.schedule.schedule.map(
        (session) =>
          `${new Date(session.date).toLocaleDateString("id-ID")} (${
            session.startTime
          } - ${session.endTime})`
      );
    } else {
      return [
        `${new Date(event.schedule.startDate).toLocaleDateString(
          "id-ID"
        )} - ${new Date(event.schedule.endDate).toLocaleDateString("id-ID")} (${
          event.schedule.startTime
        } - ${event.schedule.endTime})`,
      ];
    }
  };

  const getTotalQuota = () => {
    return availableDates.reduce((total, date) => total + date.quota, 0);
  };

  const getTotalBooked = () => {
    return availableDates.reduce((total, date) => total + date.booked, 0);
  };

  return (
    <div className="space-y-6 relative">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-8 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-white" />
            <div>
              <p className="font-semibold">Pendaftaran Berhasil!</p>
              <p className="text-sm text-green-100">
                Mengalihkan ke halaman event...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Event Information */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-green-700 mb-3">Informasi Event</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <Calendar size={16} className="text-green-600 mt-0.5 shrink-0" />
            <div>
              {formatEventSchedule().map((schedule, index) => (
                <div key={index} className="text-gray-700">
                  {schedule}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-green-600 mt-0.5 shrink-0" />
            <span className="text-gray-700">{event.location}</span>
          </div>
          <div className="flex items-start gap-2">
            <Users size={16} className="text-green-600 mt-0.5 shrink-0" />
            <span className="text-gray-700">
              {getTotalBooked()} / {getTotalQuota()} peserta terdaftar
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-black">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Masukkan email aktif"
          />
        </div>

        {/* Phone - NEW */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            No. Telepon/WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => {
              // Remove non-numeric characters
              const phoneValue = e.target.value.replace(/\D/g, "");
              setForm({ ...form, phone: phoneValue });
            }}
            required
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Contoh: 6281234567890"
            minLength={11}
            maxLength={15}
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: 11-15 digit angka tanpa + (contoh: 6281234567890)
          </p>
          {form.phone && (form.phone.length < 10 || form.phone.length > 13) && (
            <p className="text-xs text-red-500 mt-1">
              Nomor telepon harus 11-15 digit
            </p>
          )}
        </div>

        {/* Domisili */}
        <Select
          label="Domisili"
          options={[
            { value: "denpasar", label: "Kota Denpasar" },
            { value: "gianyar", label: "Kabupaten Gianyar" },
            { value: "badung", label: "Kabupaten Badung" },
            { value: "tabanan", label: "Kabupaten Tabanan" },
            { value: "bangli", label: "Kabupaten Bangli" },
            { value: "klungkung", label: "Kabupaten Klungkung" },
            { value: "karangasem", label: "Kabupaten Karangasem" },
            { value: "buleleng", label: "Kabupaten Buleleng" },
            { value: "jembrana", label: "Kabupaten Jembrana" },
            { value: "lainnya", label: "Lainnya" },
          ]}
          value={form.domisili}
          onChange={(v) => setForm({ ...form, domisili: v })}
          required
        />

        {/* Sumber Info */}
        <Select
          label="Mendapatkan info melalui"
          options={[
            { value: "instagram", label: "Instagram" },
            { value: "teman", label: "Teman/Kolega" },
            { value: "ads", label: "Ads/Iklan" },
            { value: "website", label: "Website" },
            { value: "lainnya", label: "Lainnya" },
          ]}
          value={form.source}
          onChange={(v) => setForm({ ...form, source: v })}
          required
        />

        {/* Alasan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alasan Mengikuti <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            required
            disabled={isSubmitting}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Ceritakan alasan Anda ingin mengikuti event ini..."
          />
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pilih Tanggal Kehadiran <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">
              ({form.selectedDates.length} tanggal dipilih)
            </span>
          </label>

          {isLoadingQuota ? (
            <div className="text-center py-8 text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"></div>
              <p className="mt-2 text-sm">Memuat ketersediaan tanggal...</p>
            </div>
          ) : (
            <DateCheckboxGrid
              mode="user"
              availableDates={availableDates}
              selectedDates={form.selectedDates}
              onChange={(dates: string[]) =>
                setForm({ ...form, selectedDates: dates })
              }
            />
          )}

          {form.selectedDates.length === 0 &&
            availableDates.length > 0 &&
            !isLoadingQuota && (
              <p className="text-red-500 text-xs mt-2">
                Pilih minimal satu tanggal
              </p>
            )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white font-semibold  py-3 hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Mendaftarkan...</span>
            </>
          ) : (
            <span>Daftar Sekarang</span>
          )}
        </button>
      </form>
    </div>
  );
};
