// src/store/useActivityStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IActivity, ActivityType } from "@/src/models/activity";

interface ActivityState {
  activities: IActivity[];
  isLoading: boolean;
  lastClearDate: string; // ✅ Track last clear date

  // Actions
  addActivity: (activity: Omit<IActivity, "_id" | "createdAt">) => void;
  fetchActivities: () => Promise<void>;
  clearActivities: () => void;
  checkAndClearDaily: () => void; // ✅ New method
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      isLoading: false,
      lastClearDate: new Date().toDateString(), // ✅ Initialize with today

      // ✅ Check and clear activities at midnight
      checkAndClearDaily: () => {
        const today = new Date().toDateString();
        const lastClear = get().lastClearDate;

        // If date has changed (past midnight), clear activities
        if (today !== lastClear) {
          console.log("🔄 Daily reset: Clearing activities");
          set({
            activities: [],
            lastClearDate: today,
          });
        }
      },

      // Add new activity (local only for now)
      addActivity: (activity) => {
        // ✅ Check if we need to clear before adding
        get().checkAndClearDaily();

        const newActivity: IActivity = {
          ...activity,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 50), // Keep last 50
        }));
      },

      // Fetch activities (placeholder - implement API later)
      fetchActivities: async () => {
        set({ isLoading: true });
        try {
          // ✅ Check daily clear before fetching
          get().checkAndClearDaily();

          // TODO: Implement API call
          // For now, just use local storage
          set({ isLoading: false });
        } catch (error) {
          console.error("Error fetching activities:", error);
          set({ isLoading: false });
        }
      },

      // Clear all activities
      clearActivities: () =>
        set({
          activities: [],
          lastClearDate: new Date().toDateString(),
        }),
    }),
    {
      name: "activity-storage",
    }
  )
);

// Helper function to log activities
export const logActivity = (
  type: ActivityType,
  description: string,
  metadata?: IActivity["metadata"]
) => {
  useActivityStore.getState().addActivity({
    type,
    description,
    metadata,
  });
};
