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
 * Get end date dari event schedule
 */
export function getScheduleEndDate(schedule: EventSchedule): Date {
  if (schedule.type === "range") {
    return new Date(schedule.endDate);
  } else {
    // Untuk tipe 'selected', cari tanggal terakhir
    const sortedDates = [...schedule.schedule].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return sortedDates.length > 0 ? new Date(sortedDates[0].date) : new Date();
  }
}

/**
 * Get start date dari event schedule
 */
export function getScheduleStartDate(schedule: EventSchedule): Date {
  if (schedule.type === "range") {
    return new Date(schedule.startDate);
  } else {
    // Untuk tipe 'selected', cari tanggal pertama
    const sortedDates = [...schedule.schedule].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    return sortedDates.length > 0 ? new Date(sortedDates[0].date) : new Date();
  }
}

/**
 * Check apakah event sudah lewat
 */
export function isEventPast(schedule: EventSchedule): boolean {
  const endDate = getScheduleEndDate(schedule);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Reset ke awal hari untuk perbandingan tanggal saja
  return endDate < now;
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
 * FIX PERUBAHAN DISINI:
 * Get schedule summary text untuk display
 */
export function getScheduleSummary(schedule: EventSchedule): string {
  if (schedule.type === "range") {
    const start = formatDate(schedule.startDate);
    const end = formatDate(schedule.endDate);

    // Karena data waktu ada di dalam array 'shifts', kita ambil index pertama
    const firstShift =
      schedule.shifts && schedule.shifts.length > 0 ? schedule.shifts[0] : null;

    if (firstShift) {
      const time = formatTimeRange(firstShift.startTime, firstShift.endTime);
      return `${start} - ${end}, ${time}`;
    }

    return `${start} - ${end}`;
  } else {
    // Untuk tipe 'selected'
    const datesCount = schedule.schedule.length;
    return `${datesCount} pertemuan`;
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
