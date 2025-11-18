// src/models/feedback.ts

/**
 * Feedback Status Enum
 */
export enum FeedbackStatus {
  UNREAD = "unread",
  READ = "read",
}

/**
 * Feedback Interface (Frontend)
 */
export interface IFeedback {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
}

/**
 * Feedback Input DTO (Data Transfer Object)
 * Used when creating new feedback
 */
export interface IFeedbackInput {
  name: string;
  email: string;
  message: string;
}

/**
 * Feedback Update DTO
 * Used when updating feedback status
 */
export interface IFeedbackUpdate {
  status?: FeedbackStatus;
}

/**
 * Feedback Response DTO
 * API response format
 */
export interface IFeedbackResponse {
  success: boolean;
  message?: string;
  feedback?: IFeedback;
  feedbacks?: IFeedback[];
}

/**
 * Feedback Statistics
 */
export interface IFeedbackStats {
  total: number;
  unread: number;
  read: number;
  today: number;
  thisWeek: number;
}

/**
 * Feedback Model Class
 * Helper methods for data transformation
 */
export class FeedbackModel {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate feedback input
   */
  static validateInput(input: IFeedbackInput): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Name validation
    if (!input.name || input.name.trim().length === 0) {
      errors.push("Nama harus diisi");
    } else if (input.name.trim().length < 3) {
      errors.push("Nama minimal 3 karakter");
    } else if (input.name.trim().length > 100) {
      errors.push("Nama maksimal 100 karakter");
    }

    // Email validation
    if (!input.email || input.email.trim().length === 0) {
      errors.push("Email harus diisi");
    } else if (!this.isValidEmail(input.email)) {
      errors.push("Format email tidak valid");
    }

    // Message validation
    if (!input.message || input.message.trim().length === 0) {
      errors.push("Pesan harus diisi");
    } else if (input.message.trim().length < 10) {
      errors.push("Pesan minimal 10 karakter");
    } else if (input.message.trim().length > 1000) {
      errors.push("Pesan maksimal 1000 karakter");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format date to Indonesian locale
   */
  static formatDate(dateStr: string | Date): string {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;

    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Get relative time (e.g., "2 jam yang lalu")
   */
  static getRelativeTime(dateStr: string | Date): string {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return this.formatDate(date);
  }

  /**
   * Get feedback statistics
   */
  static getStats(feedbacks: IFeedback[]): IFeedbackStats {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: feedbacks.length,
      unread: feedbacks.filter((f) => f.status === FeedbackStatus.UNREAD)
        .length,
      read: feedbacks.filter((f) => f.status === FeedbackStatus.READ).length,
      today: feedbacks.filter((f) => new Date(f.createdAt) >= todayStart)
        .length,
      thisWeek: feedbacks.filter((f) => new Date(f.createdAt) >= weekStart)
        .length,
    };
  }
}
