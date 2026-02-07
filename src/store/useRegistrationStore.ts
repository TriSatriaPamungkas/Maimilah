/* eslint-disable @typescript-eslint/no-explicit-any */
//src/store/useRegistrationStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { EventSummary, EventSchedule } from "./useEventStore";
import { logActivity } from "@/src/store/useActivityStore";
import { ActivityType } from "@/src/models/activity";

// Struktur untuk selected date with shift
export interface SelectedDateShift {
  date: string;
  shiftIndex: number;
}

// Struktur tanggal dengan shift dan kuota per shift
interface ShiftInfo {
  startTime: string;
  endTime: string;
  quota: number;
  booked: number;
}

interface AvailableDate {
  date: string;
  shifts: ShiftInfo[];
}

// Struktur peserta event
interface Participant {
  _id?: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  domisili: string;
  source: string;
  reason: string;
  selectedDates?: string[]; // Legacy
  selectedDateShifts?: SelectedDateShift[]; // New with shifts
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

// Helper function to split quota evenly across shifts
// Contoh: quota=20, shifts=2 → [10, 10]
// Contoh: quota=17, shifts=3 → [5, 5, 7] (sisa 2 ditambahkan ke shift terakhir)
// Contoh: quota=10, shifts=3 → [3, 3, 4] (sisa 1 ditambahkan ke shift terakhir)
const splitQuotaAcrossShifts = (
  totalQuota: number,
  numShifts: number
): number[] => {
  if (numShifts === 0) return [];
  if (numShifts === 1) return [totalQuota];

  const baseQuota = Math.floor(totalQuota / numShifts);
  const remainder = totalQuota % numShifts;

  const quotas = new Array(numShifts).fill(baseQuota);

  // Add remainder to last shift
  if (remainder > 0) {
    quotas[numShifts - 1] += remainder;
  }

  console.log(
    `📊 Split quota: total=${totalQuota}, shifts=${numShifts}, result=${quotas.join(
      ", "
    )}`
  );

  return quotas;
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set, get) => ({
      availableDates: [],
      participants: [],
      isLoading: false,
      error: null,

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
            selectedDateShifts: data.selectedDateShifts,
            // Legacy support
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
            selectedDateShifts: payload.selectedDateShifts,
            registeredAt: result.registeredAt || new Date().toISOString(),
          };

          console.log("✅ Participant saved:", newParticipant);

          // Update booked count untuk setiap shift yang dipilih
          const updatedDates = get().availableDates.map((dateItem) => {
            const shifts = dateItem.shifts.map((shift, shiftIndex) => {
              // Check if this shift was selected
              const isSelected = payload.selectedDateShifts?.some(
                (selected) =>
                  selected.date === dateItem.date &&
                  selected.shiftIndex === shiftIndex
              );

              return isSelected
                ? { ...shift, booked: shift.booked + 1 }
                : shift;
            });

            return { ...dateItem, shifts };
          });

          set((state) => ({
            participants: [...state.participants, newParticipant],
            availableDates: updatedDates,
            isLoading: false,
          }));

          // Log activity
          console.log(
            "📝 [REGISTRATION] Attempting to log activity for participant:",
            payload.name
          );
          try {
            const { useEventStore } = await import("@/src/store/useEventStore");
            const event = useEventStore.getState().getEventById(eventId);

            if (event) {
              console.log(
                "📝 [REGISTRATION] Found event for logging:",
                event.title
              );
              logActivity(
                ActivityType.PARTICIPANT_REGISTERED,
                `${payload.name} telah mendaftar di: ${event.title}`,
                {
                  eventId: eventId,
                  participantName: payload.name,
                }
              );
              console.log(
                "✅ [REGISTRATION] Activity logged successfully for:",
                payload.name
              );
            }
          } catch (logErr) {
            console.error("❌ [REGISTRATION] Failed to log activity:", logErr);
          }
        } catch (err: any) {
          console.error("❌ Error registerParticipant:", err);
          set({ error: err.message, isLoading: false });
          throw err;
        }
      },

      fetchParticipantsByEvent: async (eventId) => {
        try {
          set({ isLoading: true, error: null });
          const res = await fetch(`/api/register?eventId=${eventId}`);
          const result = await res.json();

          if (!res.ok)
            throw new Error(result.error || "Gagal mengambil peserta");

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
              selectedDateShifts: p.selectedDateShifts || [],
              registeredAt: p.registeredAt || new Date().toISOString(),
            })
          );

          console.log("✅ Fetched participants:", participants);

          // Update booked count berdasarkan participants
          const updatedDates = get().availableDates.map((dateItem) => {
            const shifts = dateItem.shifts.map((shift, shiftIndex) => {
              // Count participants for this specific shift
              const bookedCount = participants.filter((p) => {
                // Check new format first
                if (p.selectedDateShifts && p.selectedDateShifts.length > 0) {
                  return p.selectedDateShifts.some(
                    (selected) =>
                      selected.date === dateItem.date &&
                      selected.shiftIndex === shiftIndex
                  );
                }
                // Legacy format - count for all shifts on this date
                return p.selectedDates?.includes(dateItem.date);
              }).length;

              console.log(
                `📅 Date ${dateItem.date} Shift ${shiftIndex}: booked ${bookedCount}/${shift.quota}`
              );

              return { ...shift, booked: bookedCount };
            });

            return { ...dateItem, shifts };
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

      initializeEventDates: (event) => {
        const generatedDates = generateAvailableDates(
          event.schedule,
          event.quota
        );
        console.log("🔧 Initialized available dates:", generatedDates);
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

// Helper generate tanggal dengan shifts dari jadwal event
const generateAvailableDates = (
  schedule: EventSchedule,
  eventQuota: number
): AvailableDate[] => {
  if (schedule.type === "selected") {
    return schedule.schedule.map((session) => {
      // ✅ Split quota evenly across shifts for this date
      const quotaPerShift = splitQuotaAcrossShifts(
        eventQuota,
        session.shifts.length
      );

      return {
        date: session.date,
        shifts: session.shifts.map((shift, index) => ({
          startTime: shift.startTime,
          endTime: shift.endTime,
          quota: quotaPerShift[index], // Use split quota
          booked: 0,
        })),
      };
    });
  } else {
    // Range type
    const dates: AvailableDate[] = [];
    const start = new Date(schedule.startDate);
    const end = new Date(schedule.endDate);

    // ✅ Split quota evenly across shifts (applies to all dates in range)
    const quotaPerShift = splitQuotaAcrossShifts(
      eventQuota,
      schedule.shifts.length
    );

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push({
        date: d.toISOString().split("T")[0],
        shifts: schedule.shifts.map((shift, index) => ({
          startTime: shift.startTime,
          endTime: shift.endTime,
          quota: quotaPerShift[index], // Use split quota
          booked: 0,
        })),
      });
    }
    return dates;
  }
};
