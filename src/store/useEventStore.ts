/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/useEventStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logActivity } from "@/src/store/useActivityStore";
import { ActivityType } from "@/src/models/activity";

export interface TimeShift {
  startTime: string;
  endTime: string;
}

export interface ScheduleItem {
  date: string;
  shifts: TimeShift[];
}

export type EventSchedule =
  | {
      type: "selected";
      schedule: ScheduleItem[];
    }
  | {
      type: "range";
      startDate: string;
      endDate: string;
      shifts: TimeShift[];
    };

export interface EventSummary {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  location: string;
  quota: number;
  schedule: EventSchedule;
  benefits?: string[];
  participants?: string[];
}

interface EventStore {
  [x: string]: any;
  events: EventSummary[];
  bookedSlots: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  selectedEvent: EventSummary | null;

  fetchEvents: () => Promise<void>;
  fetchBookedSlots: (eventId: string) => Promise<void>; // Menghitung okupansi riil
  addEvent: (event: EventSummary) => Promise<void>;
  updateEvent: (id: string, event: Partial<EventSummary>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  getEventById: (id: string) => EventSummary | undefined;
  getEventBookedCount: (eventId: string) => number; // Menggantikan getParticipantsCount
  selectEvent: (event: EventSummary) => void;
  clearSelectedEvent: () => void;
}

const FALLBACK_EVENTS: EventSummary[] = [];

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      bookedSlots: {}, // State baru untuk tracking okupansi
      isLoading: false,
      error: null,
      selectedEvent: null,

      fetchEvents: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/event");
          if (!res.ok) {
            set({ events: FALLBACK_EVENTS, isLoading: false });
            return;
          }
          const json = await res.json();
          const eventsData = json.data || [];
          set({ events: eventsData, isLoading: false });

          // ✅ Otomatis sinkronisasi slot untuk setiap event yang dimuat
          eventsData.forEach((event: EventSummary) => {
            get().fetchBookedSlots(event._id || event.id || "");
          });
        } catch (err: any) {
          set({ events: FALLBACK_EVENTS, isLoading: false });
        }
      },

      // ✅ Fungsi Baru: Mengambil data registrasi riil dari API
      fetchBookedSlots: async (eventId: string) => {
        if (!eventId) return;
        try {
          const res = await fetch(`/api/register?eventId=${eventId}`);
          const result = await res.json();
          if (result.success && result.data) {
            // Hitung total slot (1 pendaftar bisa ambil >1 hari/shift)
            const totalUnits = result.data.reduce((sum: number, reg: any) => {
              return sum + (reg.selectedDateShifts?.length || 0);
            }, 0);

            set((state) => ({
              bookedSlots: { ...state.bookedSlots, [eventId]: totalUnits },
            }));
          }
        } catch (err) {
          console.error("❌ [STORE] Failed to fetch booked slots:", err);
        }
      },

      addEvent: async (event) => {
        try {
          const res = await fetch("/api/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event),
          });

          if (!res.ok) throw new Error(`Failed to add event`);
          const json = await res.json();
          const newEvent = json.data || json;

          set((state) => ({ events: [...state.events, newEvent] }));

          // Log Activity
          try {
            logActivity(
              ActivityType.EVENT_CREATED,
              `Event baru: ${event.title}`,
              {
                eventId: newEvent._id || newEvent.id,
                eventTitle: event.title,
              },
            );
          } catch (logErr) {
            console.error(logErr);
          }
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      updateEvent: async (id, updatedEvent) => {
        try {
          const res = await fetch(`/api/event/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEvent),
          });
          if (!res.ok) throw new Error(`Failed to update event`);
          const json = await res.json();
          const updated = json.data || json;

          set((state) => ({
            events: state.events.map((e) =>
              e._id === id || e.id === id ? { ...e, ...updated } : e,
            ),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      deleteEvent: async (id) => {
        try {
          const res = await fetch(`/api/event/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Failed to delete`);
          set((state) => ({
            events: state.events.filter((e) => e._id !== id && e.id !== id),
          }));
        } catch (err: any) {
          set({ error: err.message });
          throw err;
        }
      },

      getEventById: (id) =>
        get().events.find((e) => e._id === id || e.id === id),

      // ✅ Selector Baru: Mengambil angka okupansi dari state terpusat
      getEventBookedCount: (eventId) => get().bookedSlots[eventId] || 0,

      selectEvent: (event) => set({ selectedEvent: event }),
      clearSelectedEvent: () => set({ selectedEvent: null }),
    }),
    { name: "event-storage" },
  ),
);
