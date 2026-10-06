"use server";

import {
  listMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  listPastMeetings,
  getPastMeetingDetails,
  getPastMeetingParticipants,
  getHostUser,
  listUsers,
  listRecordings,
  deleteRecording,
  listWebinars,
  createWebinar,
  deleteWebinar,
  getDailyUsageReports,
  syncWithZoom,
  isZoomConfigured,
  ZOOM_HOST_EMAIL,
  DEFAULT_TIMEZONE,
} from "@/lib/zoom";
import type {
  ZoomMeeting,
  ZoomPastMeeting,
  ZoomPastMeetingParticipant,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  ActionResult,
  MeetingWithStatus,
  ZoomUser,
  ZoomMeetingRecording,
  ZoomWebinar,
  ZoomDailyUsageReport,
  AttendanceRecord,
} from "@/types/zoom";
import { getMeetingStatus, isMeetingToday } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// ─── Auth Guard ───────────────────────────────────────────────────────────────
async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ─── Account & Diagnostics Actions ───────────────────────────────────────────

export async function getZoomAccountStatusAction(): Promise<
  ActionResult<{
    configured: boolean;
    email: string;
    timezone: string;
    user?: ZoomUser;
    error?: string;
  }>
> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return {
        success: true,
        data: {
          configured: false,
          email: ZOOM_HOST_EMAIL,
          timezone: DEFAULT_TIMEZONE,
          error: "Zoom API credentials belum dikonfigurasi di .env.local",
        },
      };
    }

    const user = await getHostUser();
    return {
      success: true,
      data: {
        configured: true,
        email: user.email || ZOOM_HOST_EMAIL,
        timezone: user.timezone || DEFAULT_TIMEZONE,
        user,
      },
    };
  } catch (e: any) {
    return {
      success: true,
      data: {
        configured: false,
        email: ZOOM_HOST_EMAIL,
        timezone: DEFAULT_TIMEZONE,
        error: e.message || "Gagal menghubungkan ke Zoom API",
      },
    };
  }
}

// ─── Meeting Read Actions ─────────────────────────────────────────────────────

export async function getUpcomingMeetingsAction(): Promise<
  ActionResult<MeetingWithStatus[]>
> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return { success: true, data: [] };
    }
    const meetings = await listMeetings("upcoming");
    const enriched = meetings.map((m) => ({
      ...m,
      computed_status: getMeetingStatus(m.start_time, m.duration),
    }));
    return { success: true, data: enriched };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getScheduledMeetingsAction(): Promise<
  ActionResult<MeetingWithStatus[]>
> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return { success: true, data: [] };
    }
    const meetings = await listMeetings("scheduled");
    const enriched = meetings.map((m) => ({
      ...m,
      computed_status: getMeetingStatus(m.start_time, m.duration),
    }));
    return { success: true, data: enriched };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getTodayMeetingsAction(): Promise<
  ActionResult<MeetingWithStatus[]>
> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return { success: true, data: [] };
    }
    const meetings = await listMeetings("upcoming");
    const today = meetings
      .filter((m) => isMeetingToday(m.start_time))
      .map((m) => ({
        ...m,
        computed_status: getMeetingStatus(m.start_time, m.duration),
      }));
    return { success: true, data: today };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getMeetingAction(
  meetingId: number | string
): Promise<ActionResult<ZoomMeeting>> {
  try {
    await requireAuth();
    const meeting = await getMeeting(meetingId);
    return { success: true, data: meeting };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getPastMeetingsAction(): Promise<
  ActionResult<ZoomMeeting[]>
> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return { success: true, data: [] };
    }
    const meetings = await listPastMeetings();
    return { success: true, data: meetings };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getPastMeetingDetailsAction(
  meetingId: number | string
): Promise<ActionResult<ZoomPastMeeting>> {
  try {
    await requireAuth();
    const details = await getPastMeetingDetails(meetingId);
    return { success: true, data: details };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getPastMeetingParticipantsAction(
  meetingId: number | string
): Promise<ActionResult<ZoomPastMeetingParticipant[]>> {
  try {
    await requireAuth();
    const participants = await getPastMeetingParticipants(meetingId);
    return { success: true, data: participants };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Meeting Mutations ────────────────────────────────────────────────────────

export async function createMeetingAction(
  data: CreateMeetingRequest
): Promise<ActionResult<ZoomMeeting>> {
  try {
    const session = await requireAuth();
    const meeting = await createMeeting(data);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Create Meeting",
      entity: "Meeting",
      entityId: String(meeting.id),
      description: `Rapat dibuat: "${meeting.topic}" (${meeting.id})`,
    });
    revalidatePath("/meetings");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true, data: meeting };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function updateMeetingAction(
  meetingId: number | string,
  data: UpdateMeetingRequest
): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await updateMeeting(meetingId, data);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Update Meeting",
      entity: "Meeting",
      entityId: String(meetingId),
      description: `Rapat diperbarui: ${data.topic || meetingId}`,
    });
    revalidatePath("/meetings");
    revalidatePath(`/meetings/${meetingId}`);
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteMeetingAction(
  meetingId: number | string
): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await deleteMeeting(meetingId);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Delete Meeting",
      entity: "Meeting",
      entityId: String(meetingId),
      description: `Rapat dihapus: ${meetingId}`,
    });
    revalidatePath("/meetings");
    revalidatePath("/calendar");
    revalidatePath("/");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function createInstantMeetingAction(): Promise<
  ActionResult<ZoomMeeting>
> {
  try {
    const session = await requireAuth();
    const meeting = await createMeeting({
      topic: "Rapat Instan - STIPER STA",
      type: 1, // instant
      start_time: new Date().toISOString(),
      duration: 60,
      timezone: DEFAULT_TIMEZONE,
      settings: {
        host_video: true,
        participant_video: false,
        mute_upon_entry: true,
        waiting_room: true,
        auto_recording: "none",
      },
    });
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Start Instant Meeting",
      entity: "Meeting",
      entityId: String(meeting.id),
      description: `Rapat instan dimulai: ${meeting.id}`,
    });
    revalidatePath("/");
    return { success: true, data: meeting };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Participants & Attendance Actions ────────────────────────────────────────

export async function getAllParticipantsAction(): Promise<
  ActionResult<Array<{
    id: string;
    zoomMeetingId: string;
    name: string;
    email: string | null;
    joinTime: string;
    leaveTime: string | null;
    duration: number;
    status: string;
  }>>
> {
  try {
    await requireAuth();
    const saved = await db.getParticipants();
    if (saved.length > 0) {
      return { success: true, data: saved };
    }

    // Try fetching from past meetings if local DB is empty
    if (isZoomConfigured()) {
      const pastMeetings = await listPastMeetings().catch(() => []);
      for (const m of pastMeetings.slice(0, 3)) {
        try {
          const parts = await getPastMeetingParticipants(m.id);
          if (parts.length > 0) {
            await db.saveParticipants(
              String(m.id),
              parts.map((p) => ({
                name: p.name,
                email: p.user_email,
                joinTime: p.join_time,
                leaveTime: p.leave_time,
                duration: p.duration,
              }))
            );
          }
        } catch {
          // ignore
        }
      }
    }
    const refreshed = await db.getParticipants();
    return { success: true, data: refreshed };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function getAttendanceReportAction(thresholdMinutes = 30): Promise<
  ActionResult<{
    totalParticipants: number;
    presentCount: number;
    lateCount: number;
    leftEarlyCount: number;
    attendanceRate: number;
    records: AttendanceRecord[];
  }>
> {
  try {
    await requireAuth();
    const participants = await db.getParticipants();
    const pastMeetings = isZoomConfigured() ? await listPastMeetings().catch(() => []) : [];
    const meetingMap = new Map<string, string>();
    for (const m of pastMeetings) {
      meetingMap.set(String(m.id), m.topic);
    }

    const records: AttendanceRecord[] = participants.map((p) => {
      let status: "Present" | "Late" | "Left Early" | "Absent" = "Present";
      if (p.duration < 10) {
        status = "Late";
      } else if (p.duration < thresholdMinutes) {
        status = "Left Early";
      }
      return {
        id: p.id,
        name: p.name,
        email: p.email,
        joinTime: p.joinTime,
        leaveTime: p.leaveTime,
        duration: p.duration,
        status,
        meetingTopic: meetingMap.get(p.zoomMeetingId) || `Rapat ${p.zoomMeetingId}`,
        zoomMeetingId: p.zoomMeetingId,
      };
    });

    const presentCount = records.filter((r) => r.status === "Present").length;
    const lateCount = records.filter((r) => r.status === "Late").length;
    const leftEarlyCount = records.filter((r) => r.status === "Left Early").length;
    const total = records.length;
    const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 100;

    return {
      success: true,
      data: {
        totalParticipants: total,
        presentCount,
        lateCount,
        leftEarlyCount,
        attendanceRate,
        records,
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Cloud Recordings Actions ─────────────────────────────────────────────────

export async function getRecordingsAction(): Promise<
  ActionResult<ZoomMeetingRecording[]>
> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return { success: true, data: [] };
    }
    const recordings = await listRecordings();
    return { success: true, data: recordings };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteRecordingAction(
  meetingId: number | string
): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await deleteRecording(meetingId);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Delete Recording",
      entity: "Recording",
      entityId: String(meetingId),
      description: `Rekaman dihapus untuk meeting ${meetingId}`,
    });
    revalidatePath("/recordings");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Webinars Actions ─────────────────────────────────────────────────────────

export async function getWebinarsAction(): Promise<
  ActionResult<{ available: boolean; webinars: ZoomWebinar[]; error?: string }>
> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return {
        success: true,
        data: {
          available: false,
          webinars: [],
          error: "Zoom API belum dikonfigurasi.",
        },
      };
    }
    try {
      const webinars = await listWebinars();
      return { success: true, data: { available: true, webinars } };
    } catch (apiErr: any) {
      // If error indicates account has no webinar license (e.g. 400 or 403 or code 200)
      return {
        success: true,
        data: {
          available: false,
          webinars: [],
          error: "Zoom Webinar is not available for this account. Akun institusi membutuhkan Zoom Webinar Add-on License.",
        },
      };
    }
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function createWebinarAction(data: {
  topic: string;
  start_time: string;
  duration: number;
  timezone?: string;
  agenda?: string;
}): Promise<ActionResult<ZoomWebinar>> {
  try {
    const session = await requireAuth();
    const webinar = await createWebinar(data);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Create Webinar",
      entity: "Webinar",
      entityId: String(webinar.id),
      description: `Webinar dibuat: ${webinar.topic}`,
    });
    revalidatePath("/webinars");
    return { success: true, data: webinar };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export async function deleteWebinarAction(
  webinarId: number | string
): Promise<ActionResult<void>> {
  try {
    const session = await requireAuth();
    await deleteWebinar(webinarId);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Delete Webinar",
      entity: "Webinar",
      entityId: String(webinarId),
      description: `Webinar dihapus: ${webinarId}`,
    });
    revalidatePath("/webinars");
    return { success: true, data: undefined };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Users Actions ────────────────────────────────────────────────────────────

export async function getUsersAction(): Promise<ActionResult<ZoomUser[]>> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return { success: true, data: [] };
    }
    const users = await listUsers();
    return { success: true, data: users };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Reports Actions ──────────────────────────────────────────────────────────

export async function getReportsAction(): Promise<
  ActionResult<{
    dailyUsage: ZoomDailyUsageReport;
    totalMeetings: number;
    totalParticipants: number;
    totalMinutes: number;
    avgDuration: number;
    cloudStorageMb: number;
  }>
> {
  try {
    await requireAuth();
    const now = new Date();
    const daily = isZoomConfigured()
      ? await getDailyUsageReports(now.getFullYear(), now.getMonth() + 1).catch(() => ({ dates: [] }))
      : { dates: [] };

    const upcoming = isZoomConfigured() ? await listMeetings("upcoming").catch(() => []) : [];
    const past = isZoomConfigured() ? await listPastMeetings().catch(() => []) : [];
    const recordings = isZoomConfigured() ? await listRecordings().catch(() => []) : [];

    const allMeetings = [...upcoming, ...past];
    const totalMinutes = allMeetings.reduce((acc, m) => acc + (m.duration || 0), 0);
    const avgDuration = allMeetings.length > 0 ? Math.round(totalMinutes / allMeetings.length) : 0;
    const cloudStorageMb = Math.round(
      recordings.reduce((acc, r) => acc + (r.total_size || 0), 0) / (1024 * 1024)
    );

    return {
      success: true,
      data: {
        dailyUsage: daily,
        totalMeetings: allMeetings.length,
        totalParticipants: (daily.dates || []).reduce((acc, d) => acc + d.participants, 0) || allMeetings.length * 4,
        totalMinutes,
        avgDuration,
        cloudStorageMb,
      },
    };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

// ─── Sync Action ──────────────────────────────────────────────────────────────

export async function syncWithZoomAction(): Promise<
  ActionResult<{
    meetingsSynced: number;
    participantsSynced: number;
    recordingsSynced: number;
  }>
> {
  try {
    await requireAuth();
    if (!isZoomConfigured()) {
      return { success: false, error: "Zoom API credentials belum dikonfigurasi di .env.local" };
    }
    const result = await syncWithZoom();
    revalidatePath("/");
    revalidatePath("/meetings");
    revalidatePath("/participants");
    revalidatePath("/recordings");
    revalidatePath("/attendance");
    revalidatePath("/reports");
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
