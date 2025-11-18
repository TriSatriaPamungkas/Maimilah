/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/useEventStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logActivity } from "@/src/store/useActivityStore";
import { ActivityType } from "@/src/models/activity";

export type EventSchedule =
  | {
      type: "selected";
      schedule: {
        date: string;
        startTime: string;
        endTime: string;
      }[];
    }
  | {
      type: "range";
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
    };

export interface EventSummary {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  location: string;
  quota: number; // quota per hari
  schedule: EventSchedule;
  benefits?: string[];
  participants?: string[];
}

interface EventStore {
  events: EventSummary[];
  isLoading: boolean;
  error: string | null;
  selectedEvent: EventSummary | null;

  fetchEvents: () => Promise<void>;
  addEvent: (event: EventSummary) => Promise<void>;
  updateEvent: (id: string, event: Partial<EventSummary>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  getEventById: (id: string) => EventSummary | undefined;
  selectEvent: (event: EventSummary) => void;
  clearSelectedEvent: () => void;

  addParticipant: (eventId: string, participantId: string) => Promise<void>;
  removeParticipant: (eventId: string, participantId: string) => Promise<void>;
  getParticipantsCount: (eventId: string) => number;
}

// fallback data
const FALLBACK_EVENTS: EventSummary[] = [];

// 🔹 Helper buat generate tanggal range (buat mode "range")
function generateDateRange(start: string, end: string) {
  const dates: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      events: [],
      isLoading: false,
      error: null,
      selectedEvent: null,

      // 🔹 Fetch
      fetchEvents: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch("/api/event");
          if (!res.ok) {
            console.warn(`API returned ${res.status}, using fallback data`);
            set({ events: FALLBACK_EVENTS, isLoading: false });
            return;
          }
          const json = await res.json();
          set({ events: json.data || [], isLoading: false });
        } catch (err: any) {
          console.error("Error fetchEvents:", err);
          set({ events: FALLBACK_EVENTS, isLoading: false });
        }
      },

      // 🔹 Add event - FIXED with Activity Logging
      addEvent: async (event) => {
        try {
          // Simpan event as-is tanpa modifikasi schedule type
          // Backend atau logic lain yang akan handle quota per tanggal
          const payload = { ...event };

          const res = await fetch("/api/event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) throw new Error(`Failed to add event: ${res.status}`);

          const json = await res.json();
          const newEvent = json.data || json;

          set((state) => ({ events: [...state.events, newEvent] }));

          // ✅ LOG ACTIVITY
          logActivity(
            ActivityType.EVENT_CREATED,
            `Event baru dibuat: ${event.title}`,
            {
              eventId: newEvent._id || newEvent.id,
              eventTitle: event.title,
            }
          );
        } catch (err: any) {
          console.error("Error addEvent:", err);
          set({ error: err.message });
          throw err; // Re-throw untuk error handling di modal
        }
      },

      // 🔹 Update event (bisa ubah kuota juga) with Activity Logging
      updateEvent: async (id, updatedEvent) => {
        // Get current event for title
        const currentEvent = get().events.find(
          (e) => e._id === id || e.id === id
        );

        try {
          const res = await fetch(`/api/event/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEvent),
          });
          if (!res.ok) throw new Error(`Failed to update event: ${res.status}`);

          const json = await res.json();
          const updated = json.data || json;

          set((state) => ({
            events: state.events.map((e) =>
              e._id === id || e.id === id ? { ...e, ...updated } : e
            ),
          }));

          // ✅ LOG ACTIVITY
          const eventTitle =
            updatedEvent.title || currentEvent?.title || "Unknown";
          logActivity(
            ActivityType.EVENT_UPDATED,
            `Event diperbarui: ${eventTitle}`,
            {
              eventId: id,
              eventTitle: eventTitle,
            }
          );
        } catch (err: any) {
          console.error("Error updateEvent:", err);
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Delete event with Activity Logging
      deleteEvent: async (id) => {
        // Get event before deleting
        const event = get().events.find((e) => e._id === id || e.id === id);

        try {
          const res = await fetch(`/api/event/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Failed to delete event: ${res.status}`);

          set((state) => ({
            events: state.events.filter((e) => e._id !== id && e.id !== id),
          }));

          // ✅ LOG ACTIVITY
          if (event) {
            logActivity(
              ActivityType.EVENT_DELETED,
              `Event dihapus: ${event.title}`,
              {
                eventId: id,
                eventTitle: event.title,
              }
            );
          }
        } catch (err: any) {
          console.error("Error deleteEvent:", err);
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Get event by ID
      getEventById: (id) =>
        get().events.find((e) => e._id === id || e.id === id),

      // 🔹 Participant logic
      addParticipant: async (eventId, participantId) => {
        // Get event data untuk ambil nama event
        const event = get().events.find(
          (e) => e._id === eventId || e.id === eventId
        );

        try {
          const res = await fetch(`/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId, participantId }),
          });

          if (!res.ok) throw new Error(`Failed to add participant`);

          set((state) => ({
            events: state.events.map((event) =>
              event._id === eventId || event.id === eventId
                ? {
                    ...event,
                    participants: [
                      ...(event.participants || []),
                      participantId,
                    ],
                  }
                : event
            ),
          }));

          // ✅ LOG ACTIVITY
          if (event) {
            logActivity(
              ActivityType.PARTICIPANT_REGISTERED,
              `Seseorang telah mendaftar di: ${event.title}`,
              {
                eventId: eventId,
                eventTitle: event.title,
                participantName: participantId, // atau bisa diganti dengan nama participant jika ada
              }
            );
          }
        } catch (err: any) {
          console.error("Error addParticipant:", err);
          set({ error: err.message });
          throw err;
        }
      },

      removeParticipant: async (eventId, participantId) => {
        set((state) => ({
          events: state.events.map((event) =>
            event._id === eventId || event.id === eventId
              ? {
                  ...event,
                  participants: (event.participants || []).filter(
                    (id) => id !== participantId
                  ),
                }
              : event
          ),
        }));
      },

      getParticipantsCount: (eventId) => {
        const event = get().events.find(
          (e) => e._id === eventId || e.id === eventId
        );
        return event?.participants?.length || 0;
      },

      // 🔹 Select
      selectEvent: (event) => set({ selectedEvent: event }),
      clearSelectedEvent: () => set({ selectedEvent: null }),
    }),
    { name: "event-storage" }
  )
);
