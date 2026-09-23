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
} from "@/lib/zoom";
import type {
  ZoomMeeting,
  ZoomPastMeeting,
  ZoomPastMeetingParticipant,
  CreateMeetingRequest,
  UpdateMeetingRequest,
  ActionResult,
  MeetingWithStatus,
} from "@/types/zoom";
import { getMeetingStatus, isMeetingToday } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// ─── Auth Guard ───────────────────────────────────────────────────────────────
async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
  return session;
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function getUpcomingMeetingsAction(): Promise<
  ActionResult<MeetingWithStatus[]>
> {
  try {
    await requireAuth();
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

// ─── Mutation Actions ─────────────────────────────────────────────────────────

export async function createMeetingAction(
  data: CreateMeetingRequest
): Promise<ActionResult<ZoomMeeting>> {
  try {
    await requireAuth();
    const meeting = await createMeeting(data);
    revalidatePath("/meetings");
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
    await requireAuth();
    await updateMeeting(meetingId, data);
    revalidatePath("/meetings");
    revalidatePath(`/meetings/${meetingId}`);
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
    await requireAuth();
    await deleteMeeting(meetingId);
    revalidatePath("/meetings");
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
    await requireAuth();
    const meeting = await createMeeting({
      topic: "Rapat Instan - STIPER STA",
      type: 1, // instant
      start_time: new Date().toISOString(),
      duration: 60,
      timezone: process.env.DEFAULT_TIMEZONE ?? "Asia/Jayapura",
      settings: {
        host_video: true,
        participant_video: false,
        mute_upon_entry: true,
        waiting_room: true,
        auto_recording: "none",
      },
    });
    revalidatePath("/");
    return { success: true, data: meeting };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
