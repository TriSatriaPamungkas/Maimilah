// src/components/molecules/ParticipantDetailModal.tsx
import React from "react";
import { X, User, Mail, Phone, MapPin, Info, Calendar } from "lucide-react";

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

interface ParticipantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant | null;
}

export const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
  isOpen,
  onClose,
  participant,
}) => {
  if (!isOpen || !participant) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Detail Partisipan
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Informasi lengkap peserta event
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="space-y-4">
            {/* Nama */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 bg-green-100 p-2 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Nama Lengkap
                </label>
                <p className="text-sm font-semibold text-gray-800">
                  {participant.name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 bg-blue-100 p-2 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-sm text-gray-800">{participant.email}</p>
              </div>
            </div>

            {/* Telepon */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 bg-purple-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  No. Telepon/WhatsApp
                </label>
                <p className="text-sm text-gray-800">
                  {participant.phone || "-"}
                </p>
              </div>
            </div>

            {/* Domisili */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 bg-orange-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Domisili
                </label>
                <p className="text-sm text-gray-800">
                  {participant.domisili || "-"}
                </p>
              </div>
            </div>

            {/* Sumber Info */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 bg-indigo-100 p-2 rounded-lg">
                <Info className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Mendapatkan Info Melalui
                </label>
                <p className="text-sm text-gray-800 capitalize">
                  {participant.source || "-"}
                </p>
              </div>
            </div>

            {/* Alasan */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Alasan Mengikuti Event
              </label>
              <p className="text-sm text-gray-800 leading-relaxed">
                {participant.reason || "-"}
              </p>
            </div>

            {/* Tanggal Kehadiran */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <div className="shrink-0 bg-teal-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Tanggal Kehadiran Terpilih
                </label>
                {participant.selectedDates &&
                participant.selectedDates.length > 0 ? (
                  <div className="space-y-1">
                    {participant.selectedDates.map((date, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-800 bg-white px-3 py-2 rounded border border-gray-200"
                      >
                        {formatDate(date)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Tidak ada tanggal terpilih
                  </p>
                )}
              </div>
            </div>

            {/* Waktu Registrasi */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Waktu Registrasi
              </label>
              <p className="text-sm text-gray-800">
                {formatDateTime(participant.registeredAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-green-50 px-6 py-4 flex justify-end"></div>
      </div>
    </div>
  );
};
