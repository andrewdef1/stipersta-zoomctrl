// ─── Zoom API TypeScript Interfaces ──────────────────────────────────────────

export type ZoomMeetingType = 1 | 2 | 3 | 8;
// 1 = instant, 2 = scheduled, 3 = recurring no fixed time, 8 = recurring fixed time

export type ZoomMeetingStatus = "waiting" | "started" | "finished";

export type ZoomAutoRecording = "local" | "cloud" | "none";

export interface ZoomTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface ZoomMeetingSettings {
  host_video?: boolean;
  participant_video?: boolean;
  cn_meeting?: boolean;
  in_meeting?: boolean;
  join_before_host?: boolean;
  mute_upon_entry?: boolean;
  watermark?: boolean;
  use_pmi?: boolean;
  approval_type?: 0 | 1 | 2;
  audio?: "both" | "telephony" | "voip";
  auto_recording?: ZoomAutoRecording;
  waiting_room?: boolean;
  allow_multiple_devices?: boolean;
  password?: string;
  meeting_authentication?: boolean;
  authentication_option?: string;
}

export interface ZoomMeeting {
  uuid?: string;
  id: number;
  host_id?: string;
  host_email?: string;
  topic: string;
  type: ZoomMeetingType;
  status?: ZoomMeetingStatus;
  start_time: string; // ISO 8601
  duration: number; // minutes
  timezone: string;
  agenda?: string;
  created_at?: string;
  start_url?: string;
  join_url: string;
  password?: string;
  settings?: ZoomMeetingSettings;
}

export interface ZoomListResponse<T> {
  page_count?: number;
  page_number?: number;
  page_size?: number;
  total_records?: number;
  next_page_token?: string;
  meetings?: T[];
  participants?: T[];
}

export interface CreateMeetingRequest {
  topic: string;
  type?: ZoomMeetingType;
  start_time: string; // ISO 8601
  duration: number;
  timezone?: string;
  agenda?: string;
  password?: string;
  settings?: ZoomMeetingSettings;
}

export interface UpdateMeetingRequest {
  topic?: string;
  type?: ZoomMeetingType;
  start_time?: string;
  duration?: number;
  timezone?: string;
  agenda?: string;
  password?: string;
  settings?: ZoomMeetingSettings;
}

export interface ZoomUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: number;
  status: string;
  pmi: number;
  timezone: string;
  verified: number;
  dept: string;
  created_at: string;
  last_login_time: string;
}

export interface ZoomPastMeeting {
  uuid: string;
  id: number;
  host_id: string;
  topic: string;
  type: number;
  user_name: string;
  user_email: string;
  start_time: string;
  end_time: string;
  duration: number;
  total_minutes: number;
  participants_count: number;
  source: string;
}

export interface ZoomPastMeetingParticipant {
  id?: string;
  user_id?: string;
  name: string;
  user_email?: string;
  join_time: string;
  leave_time: string;
  duration: number;
  attentiveness_score?: string;
}

export interface ZoomApiError {
  code: number;
  message: string;
}

// ─── Internal App Types ───────────────────────────────────────────────────────

export interface MeetingFormData {
  topic: string;
  agenda?: string;
  start_time: string;
  duration: number;
  timezone: string;
  password?: string;
  waiting_room: boolean;
  require_auth: boolean;
  host_video: boolean;
  participant_video: boolean;
  mute_upon_entry: boolean;
  auto_recording: ZoomAutoRecording;
}

export interface MeetingWithStatus extends ZoomMeeting {
  computed_status: "upcoming" | "live" | "finished";
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
