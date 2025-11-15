// src/lib/scheduleUtils.ts
import { EventSchedule } from "@/src/store/useEventStore";

/**
 * Format tanggal ke format Indonesia
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format tanggal ke format panjang Indonesia
 */
export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format waktu dengan zona WITA
 */
export function formatTime(time: string): string {
  return `${time} WITA`;
}

/**
 * Format range waktu
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

/**
 * Get end date dari event schedule (untuk sorting & filtering)
 */
export function getScheduleEndDate(schedule: EventSchedule): Date {
  if (schedule.type === "range") {
    return new Date(schedule.endDate);
  } else {
    const sortedDates = [...schedule.schedule].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return new Date(sortedDates[0].date);
  }
}

/**
 * Get start date dari event schedule
 */
export function getScheduleStartDate(schedule: EventSchedule): Date {
  if (schedule.type === "range") {
    return new Date(schedule.startDate);
  } else {
    const sortedDates = [...schedule.schedule].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return new Date(sortedDates[0].date);
  }
}

/**
 * Check apakah event sudah lewat
 */
export function isEventPast(schedule: EventSchedule): boolean {
  const endDate = getScheduleEndDate(schedule);
  return endDate < new Date();
}

/**
 * Check apakah event sedang berlangsung
 */
export function isEventOngoing(schedule: EventSchedule): boolean {
  const startDate = getScheduleStartDate(schedule);
  const endDate = getScheduleEndDate(schedule);
  const now = new Date();
  return startDate <= now && now <= endDate;
}

/**
 * Get schedule summary text untuk display
 */
export function getScheduleSummary(schedule: EventSchedule): string {
  if (schedule.type === "range") {
    const start = formatDate(schedule.startDate);
    const end = formatDate(schedule.endDate);
    const time = formatTimeRange(schedule.startTime, schedule.endTime);
    return `${start} - ${end}, ${time}`;
  } else {
    const dates = schedule.schedule.length;
    return `${dates} pertemuan`;
  }
}

/**
 * Calculate days until event starts
 */
export function getDaysUntilEvent(schedule: EventSchedule): number {
  const startDate = getScheduleStartDate(schedule);
  const now = new Date();
  const diffTime = startDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
