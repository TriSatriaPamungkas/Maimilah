/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/useFeedbackStore.ts (Updated with Activity Logging)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  IFeedback,
  IFeedbackInput,
  FeedbackModel,
  FeedbackStatus,
} from "@/src/models/feedback";
import { logActivity } from "@/src/store/useActivityStore";
import { ActivityType } from "@/src/models/activity";

interface FeedbackState {
  feedbacks: IFeedback[];
  isLoading: boolean;
  error: string | null;

  // Actions
  submitFeedback: (feedback: IFeedbackInput) => Promise<void>;
  fetchFeedbacks: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      feedbacks: [],
      isLoading: false,
      error: null,

      // Submit new feedback
      submitFeedback: async (input: IFeedbackInput) => {
        set({ isLoading: true, error: null });

        // Validate input
        const validation = FeedbackModel.validateInput(input);
        if (!validation.valid) {
          const errorMsg = validation.errors.join(", ");
          set({ error: errorMsg, isLoading: false });
          throw new Error(errorMsg);
        }

        try {
          const response = await fetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to submit feedback");
          }

          const data = await response.json();

          set((state) => ({
            feedbacks: [data.feedback, ...state.feedbacks],
            isLoading: false,
          }));

          // ✅ LOG ACTIVITY
          logActivity(
            ActivityType.FEEDBACK_RECEIVED,
            `Feedback baru dari: ${input.name}`,
            { userName: input.name }
          );
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Fetch all feedbacks (for admin)
      fetchFeedbacks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/feedback");

          if (!response.ok) {
            throw new Error("Failed to fetch feedbacks");
          }

          const data = await response.json();

          set({
            feedbacks: data.feedbacks || [],
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Mark as read
      markAsRead: async (id: string) => {
        // Get feedback before updating
        const feedback = get().feedbacks.find((f) => (f._id || f.id) === id);

        try {
          const response = await fetch(`/api/feedback/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: FeedbackStatus.READ }),
          });

          if (!response.ok) {
            throw new Error("Failed to mark as read");
          }

          set((state) => ({
            feedbacks: state.feedbacks.map((f) =>
              (f._id || f.id) === id ? { ...f, status: FeedbackStatus.READ } : f
            ),
          }));

          // ✅ LOG ACTIVITY
          if (feedback) {
            logActivity(
              ActivityType.FEEDBACK_READ,
              `Feedback dibaca dari: ${feedback.name}`,
              { feedbackId: id, userName: feedback.name }
            );
          }
        } catch (error: any) {
          console.error("Error marking as read:", error);
          throw error;
        }
      },

      // Delete feedback
      deleteFeedback: async (id: string) => {
        // Get feedback before deleting
        const feedback = get().feedbacks.find((f) => (f._id || f.id) === id);

        try {
          const response = await fetch(`/api/feedback/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete feedback");
          }

          set((state) => ({
            feedbacks: state.feedbacks.filter((f) => (f._id || f.id) !== id),
          }));

          // ✅ LOG ACTIVITY
          if (feedback) {
            logActivity(
              ActivityType.FEEDBACK_DELETED,
              `Feedback dihapus dari: ${feedback.name}`,
              { feedbackId: id, userName: feedback.name }
            );
          }
        } catch (error: any) {
          console.error("Error deleting feedback:", error);
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "feedback-storage",
      partialize: (state) => ({ feedbacks: state.feedbacks }),
    }
  )
);
