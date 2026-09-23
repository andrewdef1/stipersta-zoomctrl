import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isFuture, isPast } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format ISO date to readable Indonesian datetime string */
export function formatDateTime(isoString: string): string {
  return format(new Date(isoString), "EEEE, d MMMM yyyy · HH:mm", {
    locale: localeId,
  });
}

/** Format ISO date to short date (e.g. "22 Sep 2026") */
export function formatDate(isoString: string): string {
  return format(new Date(isoString), "d MMM yyyy", { locale: localeId });
}

/** Format ISO date to time only (e.g. "14:30") */
export function formatTime(isoString: string): string {
  return format(new Date(isoString), "HH:mm");
}

/** Format duration in minutes to human readable string */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} jam ${m} menit` : `${h} jam`;
}

/** Compute meeting status: upcoming, live, or finished */
export function getMeetingStatus(
  startTime: string,
  durationMinutes: number
): "upcoming" | "live" | "finished" {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();

  if (isPast(end)) return "finished";
  if (isFuture(start)) return "upcoming";
  return "live";
}

/** Check if a meeting happens today */
export function isMeetingToday(startTime: string): boolean {
  return isToday(new Date(startTime));
}

/** Time until meeting starts */
export function timeUntil(isoString: string): string {
  return formatDistanceToNow(new Date(isoString), {
    addSuffix: true,
    locale: localeId,
  });
}

/** Generate a random 6-digit passcode */
export function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Build formatted WhatsApp/Email invitation text */
export function buildInvitationText(meeting: {
  topic: string;
  start_time: string;
  duration: number;
  timezone: string;
  id: number;
  password?: string;
  join_url: string;
}): string {
  const startDate = formatDateTime(meeting.start_time);
  const duration = formatDuration(meeting.duration);

  return `*Undangan Rapat Zoom*
━━━━━━━━━━━━━━━━━━━━━━
📋 *Topik:* ${meeting.topic}
📅 *Waktu:* ${startDate} WIT
⏱️ *Durasi:* ${duration}
━━━━━━━━━━━━━━━━━━━━━━
🔗 *Link Bergabung:*
${meeting.join_url}

📌 *Meeting ID:* ${meeting.id}
${meeting.password ? `🔑 *Passcode:* ${meeting.password}` : ""}
━━━━━━━━━━━━━━━━━━━━━━
Harap bergabung 5 menit sebelum acara dimulai.

Salam,
*STIPER STA*`;
}

/** Truncate long text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
