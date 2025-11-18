// src/models/activity.ts

/**
 * Activity Type Enum
 */
export enum ActivityType {
  // Event activities
  EVENT_CREATED = "event_created",
  EVENT_UPDATED = "event_updated",
  EVENT_DELETED = "event_deleted",

  // Registration activities
  PARTICIPANT_REGISTERED = "participant_registered",

  // Feedback activities
  FEEDBACK_RECEIVED = "feedback_received",
  FEEDBACK_READ = "feedback_read",
  FEEDBACK_DELETED = "feedback_deleted",
}

/**
 * Activity Interface
 */
export interface IActivity {
  _id?: string;
  type: ActivityType;
  description: string;
  metadata?: {
    eventId?: string;
    eventTitle?: string;
    participantName?: string;
    feedbackId?: string;
    userName?: string;
  };
  createdAt: string;
}

/**
 * Activity Model Class
 */
export class ActivityModel {
  /**
   * Get activity icon based on type
   */
  static getActivityIcon(type: ActivityType): string {
    switch (type) {
      case ActivityType.EVENT_CREATED:
        return "🎉";
      case ActivityType.EVENT_UPDATED:
        return "✏️";
      case ActivityType.EVENT_DELETED:
        return "🗑️";
      case ActivityType.PARTICIPANT_REGISTERED:
        return "👤";
      case ActivityType.FEEDBACK_RECEIVED:
        return "💬";
      case ActivityType.FEEDBACK_READ:
        return "✅";
      case ActivityType.FEEDBACK_DELETED:
        return "🗑️";
      default:
        return "📌";
    }
  }

  /**
   * Get activity color based on type
   */
  static getActivityColor(type: ActivityType): string {
    switch (type) {
      case ActivityType.EVENT_CREATED:
        return "text-green-600 bg-green-50";
      case ActivityType.EVENT_UPDATED:
        return "text-blue-600 bg-blue-50";
      case ActivityType.EVENT_DELETED:
        return "text-red-600 bg-red-50";
      case ActivityType.PARTICIPANT_REGISTERED:
        return "text-purple-600 bg-purple-50";
      case ActivityType.FEEDBACK_RECEIVED:
        return "text-orange-600 bg-orange-50";
      case ActivityType.FEEDBACK_READ:
        return "text-green-600 bg-green-50";
      case ActivityType.FEEDBACK_DELETED:
        return "text-gray-600 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  }

  /**
   * Format relative time
   */
  static getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}
