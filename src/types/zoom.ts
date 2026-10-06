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
  registrants_email_notification?: boolean;
}

export interface ZoomRecurrence {
  type: 1 | 2 | 3; // 1 = daily, 2 = weekly, 3 = monthly
  repeat_interval: number;
  weekly_days?: string; // 1 = Sunday, 2 = Monday, ...
  monthly_day?: number;
  end_times?: number;
  end_date_time?: string;
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
  recurrence?: ZoomRecurrence;
}

export interface ZoomListResponse<T> {
  page_count?: number;
  page_number?: number;
  page_size?: number;
  total_records?: number;
  next_page_token?: string;
  meetings?: T[];
  participants?: T[];
  users?: T[];
  recordings?: T[];
  webinars?: T[];
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
  recurrence?: ZoomRecurrence;
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
  recurrence?: ZoomRecurrence;
}

export interface ZoomUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  type: number; // 1 = Basic, 2 = Licensed, 3 = On-prem
  role_name?: string;
  status: string;
  pmi: number;
  timezone: string;
  verified: number;
  dept?: string;
  created_at: string;
  last_login_time?: string;
  pic_url?: string;
}

export interface ZoomAccountInfo {
  id: string;
  account_name: string;
  account_number: number;
  account_type?: string;
  seats: number;
  created_at?: string;
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

export interface ZoomRecordingFile {
  id: string;
  meeting_id: string;
  recording_start: string;
  recording_end: string;
  file_type: "MP4" | "M4A" | "CHAT" | "TRANSCRIPT" | "TIMELINE" | string;
  file_extension: string;
  file_size: number;
  play_url?: string;
  download_url?: string;
  status: string;
  recording_type: string;
}

export interface ZoomMeetingRecording {
  uuid: string;
  id: number;
  account_id: string;
  host_id: string;
  topic: string;
  start_time: string;
  duration: number;
  total_size: number;
  recording_count: number;
  share_url?: string;
  recording_files: ZoomRecordingFile[];
}

export interface ZoomWebinar {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  type: number; // 5 = webinar, 6 = recurring no fixed time, 9 = recurring fixed time
  start_time: string;
  duration: number;
  timezone: string;
  agenda?: string;
  created_at: string;
  join_url: string;
  settings?: Record<string, any>;
}

export interface ZoomDailyUsageReport {
  dates?: Array<{
    date: string;
    new_users: number;
    meetings: number;
    participants: number;
    meeting_minutes: number;
  }>;
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
  recurrence_type?: "none" | "daily" | "weekly" | "monthly";
}

export interface MeetingWithStatus extends ZoomMeeting {
  computed_status: "upcoming" | "live" | "finished";
}

export interface AttendanceRecord {
  id: string;
  name: string;
  email: string | null;
  joinTime: string;
  leaveTime: string | null;
  duration: number;
  status: "Present" | "Late" | "Left Early" | "Absent";
  meetingTopic: string;
  zoomMeetingId: string;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
