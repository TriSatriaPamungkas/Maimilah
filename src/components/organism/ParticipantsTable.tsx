// src/components/organisms/ParticipantsTable.tsx
import React, { useState } from "react";
import { ParticipantDetailModal } from "@/src/components/molecules/participantDetailModal";
import { Eye, ChevronDown } from "lucide-react";

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

interface ParticipantsTableProps {
  participants: Participant[];
  isLoading?: boolean;
  selectedDate?: string;
}

export const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  isLoading = false,
  selectedDate,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Limit to 5 participants
  const displayLimit = 5;
  const displayedParticipants = showAll
    ? participants
    : participants.slice(0, displayLimit);
  const remainingCount = Math.max(0, participants.length - displayLimit);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleViewDetail = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedParticipant(null);
  };

  if (!selectedDate) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">Pilih tanggal terlebih dahulu</p>
        <p className="text-sm">
          Klik salah satu tanggal di atas untuk melihat daftar partisipan
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mb-3"></div>
        <p>Memuat data partisipan...</p>
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Belum ada partisipan terdaftar</p>
        <p className="text-sm">untuk tanggal {formatDate(selectedDate)}</p>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-16">
                No
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Nama Partisipan
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                Telepon
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 w-24">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayedParticipants.map((participant, index) => (
              <tr
                key={participant._id || participant.id || index}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                  {participant.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {participant.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {participant.phone || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleViewDetail(participant)}
                    className="inline-flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Detail</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show More Button */}
      {!showAll && remainingCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAll(true)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="font-medium">
              +{remainingCount} more participant{remainingCount > 1 ? "s" : ""}
            </span>
          </button>
        </div>
      )}

      {/* Show Less Button */}
      {showAll && participants.length > displayLimit && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAll(false)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
            <span className="font-medium">Show less</span>
          </button>
        </div>
      )}

      {/* Participant Detail Modal */}
      <ParticipantDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        participant={selectedParticipant}
      />
    </>
  );
};
