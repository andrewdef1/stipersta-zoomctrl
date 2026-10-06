import { auth } from "@/auth";
import { listMeetings, createMeeting, isZoomConfigured } from "@/lib/zoom";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createMeetingSchema = z.object({
  topic: z.string().min(1, "Topic required"),
  type: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(8)]).optional(),
  start_time: z.string(),
  duration: z.number().min(1),
  timezone: z.string().optional(),
  agenda: z.string().optional(),
  password: z.string().optional(),
  settings: z.record(z.string(), z.any()).optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isZoomConfigured()) {
    return NextResponse.json(
      { error: "Zoom integration is not configured." },
      { status: 503 }
    );
  }

  try {
    const typeParam = req.nextUrl.searchParams.get("type") as any || "upcoming";
    const meetings = await listMeetings(typeParam);
    return NextResponse.json({ success: true, data: meetings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isZoomConfigured()) {
    return NextResponse.json(
      { error: "Zoom integration is not configured." },
      { status: 503 }
    );
  }

  try {
    const json = await req.json();
    const parsed = createMeetingSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const meeting = await createMeeting(parsed.data as any);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Create Meeting (API)",
      entity: "Meeting",
      entityId: String(meeting.id),
      description: `Rapat dibuat via API: "${meeting.topic}"`,
    });

    return NextResponse.json({ success: true, data: meeting }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create meeting" },
      { status: 500 }
    );
  }
}
