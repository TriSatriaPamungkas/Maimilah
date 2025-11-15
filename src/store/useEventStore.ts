/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/useEventStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

      // 🔹 Add event - FIXED
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
        } catch (err: any) {
          console.error("Error addEvent:", err);
          set({ error: err.message });
          throw err; // Re-throw untuk error handling di modal
        }
      },

      // 🔹 Update event (bisa ubah kuota juga)
      updateEvent: async (id, updatedEvent) => {
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
        } catch (err: any) {
          console.error("Error updateEvent:", err);
          set({ error: err.message });
          throw err;
        }
      },

      // 🔹 Delete event
      deleteEvent: async (id) => {
        try {
          const res = await fetch(`/api/event/${id}`, { method: "DELETE" });
          if (!res.ok) throw new Error(`Failed to delete event: ${res.status}`);

          set((state) => ({
            events: state.events.filter((e) => e._id !== id && e.id !== id),
          }));
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
