// app/admin/dashboard/feedback/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useFeedbackStore } from "@/src/store/useFeedbackStore";
import { FeedbackModel, FeedbackStatus } from "@/src/models/feedback";
import {
  Mail,
  Trash2,
  Eye,
  Calendar,
  Search,
  MessageSquare,
} from "lucide-react";

const AdminFeedbackPage: React.FC = () => {
  const { feedbacks, isLoading, fetchFeedbacks, markAsRead, deleteFeedback } =
    useFeedbackStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "read">(
    "all"
  );

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Error marking as read:", error);
      alert("Gagal menandai sebagai sudah dibaca");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus feedback ini?")) return;

    try {
      await deleteFeedback(id);
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Gagal menghapus feedback");
    }
  };

  // Filter feedbacks with useMemo
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback) => {
      const matchesSearch =
        feedback.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feedback.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || feedback.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [feedbacks, searchQuery, filterStatus]);

  // Calculate stats with useMemo to prevent infinite loop
  const stats = useMemo(() => {
    return FeedbackModel.getStats(feedbacks);
  }, [feedbacks]);

  if (isLoading && feedbacks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Feedback & Pesan
              </h1>
              <p className="text-gray-600">
                Kelola feedback dan pesan dari pengunjung website
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.unread}
            </div>
            <div className="text-sm text-gray-600">Belum Dibaca</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.read}
            </div>
            <div className="text-sm text-gray-600">Sudah Dibaca</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {stats.today}
            </div>
            <div className="text-sm text-gray-600">Hari Ini</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.thisWeek}
            </div>
            <div className="text-sm text-gray-600">Minggu Ini</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 active:text-gray-600  w-5 h-5" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, atau pesan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filter Status */}
            <div className="flex gap-2">
              {(["all", "unread", "read"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    filterStatus === status
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status === "all"
                    ? "Semua"
                    : status === "unread"
                    ? "Belum Dibaca"
                    : "Sudah Dibaca"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedbacks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchQuery || filterStatus !== "all"
                  ? "Tidak Ada Hasil"
                  : "Belum Ada Feedback"}
              </h3>
              <p className="text-gray-500">
                {searchQuery || filterStatus !== "all"
                  ? "Coba ubah filter atau kata kunci pencarian"
                  : "Feedback dari pengunjung akan muncul di sini"}
              </p>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div
                key={feedback._id || feedback.id}
                className={`bg-white rounded-lg shadow-sm p-6 transition-all hover:shadow-md border-l-4 ${
                  feedback.status === FeedbackStatus.UNREAD
                    ? "border-l-green-500"
                    : "border-l-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {feedback.name}
                      </h3>
                      {feedback.status === FeedbackStatus.UNREAD && (
                        <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                          BARU
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${feedback.email}`}
                      className="text-green-600 hover:text-green-700 text-sm flex items-center gap-2"
                    >
                      <Mail size={16} />
                      {feedback.email}
                    </a>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={14} />
                      {FeedbackModel.formatDate(feedback.createdAt)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {FeedbackModel.getRelativeTime(feedback.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {feedback.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  {feedback.status === FeedbackStatus.UNREAD && (
                    <button
                      onClick={() =>
                        handleMarkAsRead(feedback._id || feedback.id || "")
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Eye size={16} />
                      Tandai Sudah Dibaca
                    </button>
                  )}

                  <button
                    onClick={() =>
                      handleDelete(feedback._id || feedback.id || "")
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        {filteredFeedbacks.length > 0 && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-center text-sm text-gray-600">
              Menampilkan {filteredFeedbacks.length} dari {feedbacks.length}{" "}
              feedback
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedbackPage;
