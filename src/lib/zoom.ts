import type {
  ZoomTokenResponse,
  ZoomMeeting,
  ZoomListResponse,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  ZoomPastMeeting,
  ZoomPastMeetingParticipant,
  ZoomUser,
} from "@/types/zoom";

// ─── Config ───────────────────────────────────────────────────────────────────
const ZOOM_BASE_URL = "https://api.zoom.us/v2";
const ZOOM_TOKEN_URL = "https://zoom.us/oauth/token";

const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID!;
const CLIENT_ID = process.env.ZOOM_CLIENT_ID!;
const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET!;
export const ZOOM_HOST_EMAIL = process.env.ZOOM_HOST_EMAIL ?? "me";
export const DEFAULT_TIMEZONE =
  process.env.DEFAULT_TIMEZONE ?? "Asia/Jayapura";

// ─── In-Memory Token Cache ────────────────────────────────────────────────────
interface TokenCache {
  token: string;
  expiresAt: number; // Unix ms
}

let tokenCache: TokenCache | null = null;

/**
 * Retrieves a valid Zoom Server-to-Server OAuth access token.
 * Automatically refreshes the token 60 seconds before expiry.
 */
export async function getZoomAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  if (!ACCOUNT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "Zoom credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in .env.local"
    );
  }

  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  );

  const res = await fetch(
    `${ZOOM_TOKEN_URL}?grant_type=account_credentials&account_id=${ACCOUNT_ID}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      // Prevent Next.js from caching this fetch
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Zoom access token: ${res.status} ${text}`);
  }

  const data: ZoomTokenResponse = await res.json();

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

// ─── HTTP Client ──────────────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Authenticated HTTP client for Zoom API.
 * Automatically injects the Bearer token and handles JSON.
 */
export async function zoomFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = await getZoomAccessToken();

  const { body, headers = {}, ...rest } = options;

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

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Zoom API error ${res.status}: ${data.message ?? JSON.stringify(data)}`
    );
  }

  return data as T;
}

// ─── Meetings API ─────────────────────────────────────────────────────────────

export async function listMeetings(
  type: "scheduled" | "live" | "upcoming" | "previous_meetings" = "upcoming"
): Promise<ZoomMeeting[]> {
  const data = await zoomFetch<ZoomListResponse<ZoomMeeting>>(
    `/users/${ZOOM_HOST_EMAIL}/meetings?type=${type}&page_size=100`
  );
  return data.meetings ?? [];
}

export async function getMeeting(meetingId: number | string): Promise<ZoomMeeting> {
  return zoomFetch<ZoomMeeting>(`/meetings/${meetingId}`);
}

export async function createMeeting(
  data: CreateMeetingRequest
): Promise<ZoomMeeting> {
  return zoomFetch<ZoomMeeting>(`/users/${ZOOM_HOST_EMAIL}/meetings`, {
    method: "POST",
    body: data,
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

export async function listPastMeetings(): Promise<ZoomMeeting[]> {
  const data = await zoomFetch<ZoomListResponse<ZoomMeeting>>(
    `/users/${ZOOM_HOST_EMAIL}/meetings?type=previous_meetings&page_size=100`
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
    `/past_meetings/${meetingId}/participants`
  );
  return data.participants ?? [];
}

export async function getHostUser(): Promise<ZoomUser> {
  return zoomFetch<ZoomUser>(`/users/${ZOOM_HOST_EMAIL}`);
}
