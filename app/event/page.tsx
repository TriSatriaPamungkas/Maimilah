"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, CheckCircle, Search, ArrowLeft } from "lucide-react";
import { useEventStore, EventSummary } from "@/src/store/useEventStore";
import { EventCard } from "@/src/components/molecules/eventCard";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 🧠 Persisted UI State
interface UIState {
  searchQuery: string;
  filter: "all" | "active" | "past";
  setSearchQuery: (q: string) => void;
  setFilter: (f: "all" | "active" | "past") => void;
}

const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      searchQuery: "",
      filter: "all",
      setSearchQuery: (q) => set({ searchQuery: q }),
      setFilter: (f) => set({ filter: f }),
    }),
    { name: "event-ui-storage" }
  )
);

export default function EventPage() {
  const router = useRouter();
  const { events, isLoading, error, fetchEvents } = useEventStore();
  const { searchQuery, filter, setSearchQuery, setFilter } = useUIStore();

  // ✅ Fetch events sekali saat mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 🔍 Helper: Get event end date
  const getEventEndDate = (event: EventSummary): Date => {
    if (event.schedule.type === "range") {
      return new Date(event.schedule.endDate);
    } else {
      const lastSchedule =
        event.schedule.schedule[event.schedule.schedule.length - 1];
      return new Date(lastSchedule.date);
    }
  };

  // 🧩 Filter & Search Logic
  const filteredEvents = useMemo(() => {
    let filtered = events;
    const now = new Date();

    // Filter by status
    if (filter === "active") {
      filtered = filtered.filter((event) => {
        const endDate = getEventEndDate(event);
        const isFull = (event.participants?.length || 0) >= event.quota;
        return endDate >= now && !isFull;
      });
    } else if (filter === "past") {
      filtered = filtered.filter((event) => {
        const endDate = getEventEndDate(event);
        return endDate < now;
      });
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          event.location.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [events, filter, searchQuery]);

  const handleRegister = (id: string) => {
    router.push(`/event/${id}`);
  };

  // Stats
  const totalEvents = events.length;
  const uniqueLocations = new Set(events.map((e) => e.location)).size;
  const now = new Date();
  const availableEvents = events.filter((event) => {
    const endDate = getEventEndDate(event);
    const isFull = (event.participants?.length || 0) >= event.quota;
    return endDate >= now && !isFull;
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => fetchEvents()}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Fixed Home Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 z-50 bg-white/10  hover:bg-white/20 text-white flex p-3 rounded-md shadow-lg transition-all "
      >
        <ArrowLeft />
        Kembali
      </button>

      {/* 🟢 Hero Section */}
      <section className="bg-linear-to-br from-green-600 to-green-800 text-white py-23 md:py-26 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            Event Maimilah
          </h1>
          <p className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto px-4">
            Temukan dan ikuti berbagai event menarik yang kami selenggarakan.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 px-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{totalEvents}</div>
              <div className="text-green-100">Total Event</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{availableEvents}</div>
              <div className="text-green-100">Event Tersedia</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center hover:bg-white/20 transition-all">
              <MapPin className="w-8 h-8 mx-auto mb-2" />
              <div className="text-3xl font-bold mb-1">{uniqueLocations}</div>
              <div className="text-green-100">Lokasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🧭 Search & Filter Section */}
      <section className="py-3 md:py-5 px-4 bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari event berdasarkan judul, deskripsi, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(["all", "active", "past"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`px-4 md:px-6 py-2.5 md:py-3  rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                  filter === t
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t === "all" ? "Semua" : t === "active" ? "Aktif" : "Selesai"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 🧩 Event Grid */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {searchQuery ? "Tidak Ada Hasil" : "Belum Ada Event"}
              </h3>
              <p className="text-gray-600">
                {searchQuery
                  ? "Coba ubah kata kunci pencarian Anda"
                  : "Coming Soon!"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-green-600 hover:text-green-700 font-medium"
                >
                  Reset Pencarian
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {filter === "all" && `Semua Event (${filteredEvents.length})`}
                  {filter === "active" &&
                    `Event Aktif (${filteredEvents.length})`}
                  {filter === "past" &&
                    `Event Selesai (${filteredEvents.length})`}
                </h2>
                {searchQuery && (
                  <p className="text-gray-600 mt-2">
                    Hasil pencarian untuk:{" "}
                    <span className="font-semibold">{searchQuery}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event._id || event.id}
                    event={event}
                    onRegister={handleRegister}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
