/* eslint-disable @typescript-eslint/no-explicit-any */
//src/store/useRegistrationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EventSummary, EventSchedule } from "./useEventStore";
import { logActivity } from "@/src/store/useActivityStore"; // ✅ Import
import { ActivityType } from "@/src/models/activity"; // ✅ Import

// 🔹 Struktur tanggal dan kuota
interface AvailableDate {
  date: string;
  quota: number;
  booked: number;
  sessionInfo?: {
    startTime: string;
    endTime: string;
  };
}

// 🔹 Struktur peserta event
interface Participant {
  _id?: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  domisili: string;
  source: string;
  reason: string;
  selectedDates: string[];
  registeredAt: string;
}

interface RegistrationState {
  availableDates: AvailableDate[];
  participants: Participant[];
  isLoading: boolean;
  error: string | null;

  registerParticipant: (
    eventId: string,
    data: Omit<Participant, "_id" | "eventId" | "registeredAt">
  ) => Promise<void>;

  initializeEventDates: (event: EventSummary) => void;
  fetchParticipantsByEvent: (eventId: string) => Promise<void>;
  getParticipantsByEvent: (eventId: string) => Participant[];
  getAvailableDatesByEvent: (eventId: string) => AvailableDate[];
}

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      availableDates: [],
      participants: [],
      isLoading: false,
      error: null,

      // 🔹 Register ke event (sinkron ke API) - UPDATED WITH ACTIVITY LOG
      registerParticipant: async (eventId, data) => {
        try {
          set({ isLoading: true, error: null });

          const payload = {
            eventId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            domisili: data.domisili,
            source: data.source,
            reason: data.reason,
            selectedDates: data.selectedDates,
          };

          console.log("📤 Sending registration payload:", payload);

          const res = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const result = await res.json();

          console.log("📥 Registration response:", result);

          if (!res.ok) throw new Error(result.error || "Gagal daftar event");

          // 🔹 Normalisasi response
          const newParticipant: Participant = {
            _id: result._id || `temp-${Date.now()}`,
            eventId,
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            domisili: payload.domisili,
            source: payload.source,
            reason: payload.reason,
            selectedDates: payload.selectedDates,
            registeredAt: result.registeredAt || new Date().toISOString(),
          };

          console.log("✅ Participant saved:", newParticipant);

          // 🔹 Update local store - update booked count
          const updatedDates = get().availableDates.map((date) =>
            payload.selectedDates.includes(date.date)
              ? { ...date, booked: date.booked + 1 }
              : date
          );

          set((state) => ({
            participants: [...state.participants, newParticipant],
            availableDates: updatedDates,
            isLoading: false,
          }));

          // ✅ LOG ACTIVITY - Ambil event title dari useEventStore - Added debugging
          console.log(
            "📝 [REGISTRATION] Attempting to log activity for participant:",
            payload.name
          );
          try {
            // Dynamic import untuk menghindari circular dependency
            const { useEventStore } = await import("@/src/store/useEventStore");
            const event = useEventStore.getState().getEventById(eventId);

            if (event) {
              console.log(
                "📝 [REGISTRATION] Found event for logging:",
                event.title
              );
              logActivity(
                ActivityType.PARTICIPANT_REGISTERED,
                `Seseorang telah mendaftar di: ${event.title}`,
                {
                  eventId: eventId,
                  participantName: payload.name,
                }
              );
              console.log(
                "✅ [REGISTRATION] Activity logged successfully for:",
                payload.name
              );
            } else {
              console.warn(
                "⚠️ [REGISTRATION] Event not found, cannot log activity"
              );
            }
          } catch (logErr) {
            console.error("❌ [REGISTRATION] Failed to log activity:", logErr);
            // Don't throw, activity logging is not critical
          }
        } catch (err: any) {
          console.error("❌ Error registerParticipant:", err);
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      // 🔹 Ambil data peserta dari backend
      fetchParticipantsByEvent: async (eventId) => {
        try {
          set({ isLoading: true, error: null });
          const res = await fetch(`/api/register?eventId=${eventId}`);
          const result = await res.json();

          if (!res.ok)
            throw new Error(result.error || "Gagal mengambil peserta");

          // 🔹 Pastikan struktur datanya sama
          const participants: Participant[] = (result.data || result).map(
            (p: any) => ({
              _id: p._id,
              eventId: p.eventId,
              name: p.name,
              email: p.email,
              phone: p.phone || "",
              domisili: p.domisili || "",
              source: p.source || "",
              reason: p.reason || "",
              selectedDates: p.selectedDates || [],
              registeredAt: p.registeredAt || new Date().toISOString(),
            })
          );

          console.log("✅ Fetched participants:", participants);
          console.log(
            "📊 Current availableDates before update:",
            get().availableDates
          );

          // 🔹 Update booked count berdasarkan participants yang ada
          const updatedDates = get().availableDates.map((date) => {
            const bookedCount = participants.filter((p) =>
              p.selectedDates.includes(date.date)
            ).length;

            console.log(
              `📅 Date ${date.date}: booked ${bookedCount}/${date.quota}`
            );

            return { ...date, booked: bookedCount };
          });

          console.log("📊 Updated availableDates:", updatedDates);

          set({
            participants,
            availableDates: updatedDates,
            isLoading: false,
          });
        } catch (err: any) {
          console.error("❌ Error fetchParticipantsByEvent:", err);
          set({ error: err.message, isLoading: false });
        }
      },

      // 🔹 Inisialisasi tanggal event (buat kuota per tanggal)
      initializeEventDates: (event) => {
        const generatedDates = generateAvailableDates(
          event.schedule,
          event.quota
        );
        set({ availableDates: generatedDates });
      },

      getParticipantsByEvent: (eventId) => {
        return get().participants.filter((p) => p.eventId === eventId);
      },

      getAvailableDatesByEvent: () => {
        return get().availableDates;
      },
    }),
    { name: "registration-storage" }
  )
);

// 🔹 Helper generate tanggal dari jadwal event
const generateAvailableDates = (
  schedule: EventSchedule,
  eventQuota: number
): AvailableDate[] => {
  if (schedule.type === "selected") {
    return schedule.schedule.map((session) => ({
      date: session.date,
      quota: eventQuota,
      booked: 0,
      sessionInfo: {
        startTime: session.startTime,
        endTime: session.endTime,
      },
    }));
  } else {
    const dates: AvailableDate[] = [];
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push({
        date: d.toISOString().split("T")[0],
        quota: eventQuota,
        booked: 0,
        sessionInfo: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        },
      });
    }
    return dates;
  }
};
