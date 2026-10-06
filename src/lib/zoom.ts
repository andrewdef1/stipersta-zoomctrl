import type {
  ZoomTokenResponse,
  ZoomMeeting,
  ZoomListResponse,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  ZoomPastMeeting,
  ZoomPastMeetingParticipant,
  ZoomUser,
  ZoomMeetingRecording,
  ZoomWebinar,
  ZoomDailyUsageReport,
} from "@/types/zoom";
import crypto from "node:crypto";
import { db } from "./db";

// ─── Config ───────────────────────────────────────────────────────────────────
const ZOOM_BASE_URL = "https://api.zoom.us/v2";
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";

const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID ?? "";
const CLIENT_ID = process.env.ZOOM_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET ?? "";
export const ZOOM_HOST_EMAIL = process.env.ZOOM_USER_ID ?? process.env.ZOOM_HOST_EMAIL ?? "stipersta@gmail.com";
export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE ?? "Asia/Jayapura";

// ─── In-Memory Token Cache ────────────────────────────────────────────────────
interface TokenCache {
  token: string;
  expiresAt: number; // Unix ms
}

let tokenCache: TokenCache | null = null;

export function isZoomConfigured(): boolean {
  return Boolean(ACCOUNT_ID && CLIENT_ID && CLIENT_SECRET);
}

/**
 * Retrieves a valid Zoom Server-to-Server OAuth access token.
 * Automatically refreshes the token 60 seconds before expiry.
 */
export async function getZoomAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  if (!isZoomConfigured()) {
    throw new Error(
      "Zoom integration is not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in .env.local"
    );
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const res = await fetch(
    `${ZOOM_TOKEN_URL}?grant_type=account_credentials&account_id=${ACCOUNT_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Zoom access token (${res.status}): ${text}`);
  }

  const data: ZoomTokenResponse = await res.json();

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

// ─── HTTP Client with 429 Exponential Backoff ─────────────────────────────────

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Authenticated HTTP client for Zoom API.
 * Automatically handles Bearer tokens and exponential backoff on 429 rate limit.
 */
export async function zoomFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
  retries = 3
): Promise<T> {
  const token = await getZoomAccessToken();
  const { body, headers = {}, ...rest } = options;

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const res = await fetch(`${ZOOM_BASE_URL}${path}`, {
        ...rest,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(headers as Record<string, string>),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
      });

      // Handle 429 Rate Limit
      if (res.status === 429 && attempt < retries) {
        attempt++;
        const retryAfter = Number(res.headers.get("Retry-After")) || Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }

      if (res.status === 204) {
        return undefined as T;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          `Zoom API error ${res.status}: ${(data as any).message ?? JSON.stringify(data)}`
        );
      }

      return data as T;
    } catch (err: any) {
      if (attempt >= retries || !err.message?.includes("429")) {
        throw err;
      }
      attempt++;
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
    }
  }

  throw new Error("Zoom API request failed after retry limit.");
}

// ─── User & Account API ───────────────────────────────────────────────────────

export async function getHostUser(): Promise<ZoomUser> {
  return zoomFetch<ZoomUser>(`/users/${encodeURIComponent(ZOOM_HOST_EMAIL)}`);
}

export async function listUsers(): Promise<ZoomUser[]> {
  try {
    const data = await zoomFetch<ZoomListResponse<ZoomUser>>("/users?page_size=100&status=active");
    return data.users ?? [];
  } catch {
    // If listUsers is restricted to admin scope, fallback to single host user
    try {
      const host = await getHostUser();
      return [host];
    } catch {
      return [];
    }
  }
}

// ─── Meetings API ─────────────────────────────────────────────────────────────

export async function listMeetings(
  type: "scheduled" | "live" | "upcoming" | "previous_meetings" = "upcoming"
): Promise<ZoomMeeting[]> {
  const data = await zoomFetch<ZoomListResponse<ZoomMeeting>>(
    `/users/${encodeURIComponent(ZOOM_HOST_EMAIL)}/meetings?type=${type}&page_size=100`
  );
  return data.meetings ?? [];
}

export async function getMeeting(meetingId: number | string): Promise<ZoomMeeting> {
  return zoomFetch<ZoomMeeting>(`/meetings/${meetingId}`);
}

export async function createMeeting(data: CreateMeetingRequest): Promise<ZoomMeeting> {
  return zoomFetch<ZoomMeeting>(`/users/${encodeURIComponent(ZOOM_HOST_EMAIL)}/meetings`, {
    method: "POST",
    body: {
      ...data,
      timezone: data.timezone || DEFAULT_TIMEZONE,
    },
  });
}

export async function updateMeeting(
  meetingId: number | string,
  data: UpdateMeetingRequest
): Promise<void> {
  return zoomFetch<void>(`/meetings/${meetingId}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteMeeting(meetingId: number | string): Promise<void> {
  return zoomFetch<void>(`/meetings/${meetingId}`, {
    method: "DELETE",
  });
}

// ─── Past Meetings & Participants ─────────────────────────────────────────────

export async function listPastMeetings(): Promise<ZoomMeeting[]> {
  const data = await zoomFetch<ZoomListResponse<ZoomMeeting>>(
    `/users/${encodeURIComponent(ZOOM_HOST_EMAIL)}/meetings?type=previous_meetings&page_size=100`
  );
  return data.meetings ?? [];
}

export async function getPastMeetingDetails(
  meetingId: number | string
): Promise<ZoomPastMeeting> {
  return zoomFetch<ZoomPastMeeting>(`/past_meetings/${meetingId}`);
}

export async function getPastMeetingParticipants(
  meetingId: number | string
): Promise<ZoomPastMeetingParticipant[]> {
  const data = await zoomFetch<ZoomListResponse<ZoomPastMeetingParticipant>>(
    `/past_meetings/${meetingId}/participants?page_size=300`
  );
  return data.participants ?? [];
}

// ─── Cloud Recordings ─────────────────────────────────────────────────────────

export async function listRecordings(): Promise<ZoomMeetingRecording[]> {
  try {
    const data = await zoomFetch<ZoomListResponse<ZoomMeetingRecording>>(
      `/users/${encodeURIComponent(ZOOM_HOST_EMAIL)}/recordings?page_size=100`
    );
    return data.meetings ?? [];
  } catch {
    return [];
  }
}

export async function deleteRecording(
  meetingId: number | string,
  action: "trash" | "delete" = "trash"
): Promise<void> {
  return zoomFetch<void>(`/meetings/${meetingId}/recordings?action=${action}`, {
    method: "DELETE",
  });
}

// ─── Webinars API ─────────────────────────────────────────────────────────────

export async function listWebinars(): Promise<ZoomWebinar[]> {
  const data = await zoomFetch<ZoomListResponse<ZoomWebinar>>(
    `/users/${encodeURIComponent(ZOOM_HOST_EMAIL)}/webinars?page_size=100`
  );
  return data.webinars ?? [];
}

export async function createWebinar(data: {
  topic: string;
  start_time: string;
  duration: number;
  timezone?: string;
  agenda?: string;
}): Promise<ZoomWebinar> {
  return zoomFetch<ZoomWebinar>(`/users/${encodeURIComponent(ZOOM_HOST_EMAIL)}/webinars`, {
    method: "POST",
    body: {
      ...data,
      timezone: data.timezone || DEFAULT_TIMEZONE,
    },
  });
}

export async function deleteWebinar(webinarId: number | string): Promise<void> {
  return zoomFetch<void>(`/webinars/${webinarId}`, {
    method: "DELETE",
  });
}

// ─── Reports API ──────────────────────────────────────────────────────────────

export async function getDailyUsageReports(
  year: number,
  month: number
): Promise<ZoomDailyUsageReport> {
  try {
    return await zoomFetch<ZoomDailyUsageReport>(
      `/report/daily?year=${year}&month=${month}`
    );
  } catch {
    return { dates: [] };
  }
}

// ─── Full Data Sync ───────────────────────────────────────────────────────────

export async function syncWithZoom(): Promise<{
  meetingsSynced: number;
  participantsSynced: number;
  recordingsSynced: number;
}> {
  const [upcomingMeetings, pastMeetings, recordings] = await Promise.all([
    listMeetings("upcoming").catch(() => []),
    listPastMeetings().catch(() => []),
    listRecordings().catch(() => []),
  ]);

  let totalParticipants = 0;

  // Sync past meeting participants
  for (const past of pastMeetings.slice(0, 5)) {
    try {
      const participants = await getPastMeetingParticipants(past.id);
      if (participants.length > 0) {
        await db.saveParticipants(
          String(past.id),
          participants.map((p) => ({
            name: p.name,
            email: p.user_email,
            joinTime: p.join_time,
            leaveTime: p.leave_time,
            duration: p.duration,
          }))
        );
        totalParticipants += participants.length;
      }
    } catch {
      // Continue next meeting
    }
  }

  // Sync recordings
  if (recordings.length > 0) {
    const flattened: any[] = [];
    for (const rec of recordings) {
      for (const file of rec.recording_files || []) {
        flattened.push({
          zoomMeetingId: String(rec.id),
          recordingId: file.id,
          topic: rec.topic,
          startTime: rec.start_time,
          duration: rec.duration,
          fileType: file.file_type,
          fileSize: file.file_size,
          downloadUrl: file.download_url,
          playUrl: file.play_url,
        });
      }
    }
    if (flattened.length > 0) {
      await db.saveRecordings(flattened);
    }
  }

  await db.logActivity({
    action: "Sync with Zoom",
    entity: "System",
    description: `Sinkronisasi data berhasil: ${upcomingMeetings.length + pastMeetings.length} rapat, ${totalParticipants} peserta, ${recordings.length} rekaman`,
  });

  return {
    meetingsSynced: upcomingMeetings.length + pastMeetings.length,
    participantsSynced: totalParticipants,
    recordingsSynced: recordings.length,
  };
}

// ─── Webhook Validation ───────────────────────────────────────────────────────

export function verifyZoomWebhook(
  signature: string,
  timestamp: string,
  payload: string,
  secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN ?? ""
): boolean {
  if (!secretToken) return true; // ponytail: fallback when webhook token not configured in dev
  const message = `v0:${timestamp}:${payload}`;
  const hmac = crypto.createHmac("sha256", secretToken).update(message).digest("hex");
  const expected = `v0=${hmac}`;
  return signature === expected;
}
