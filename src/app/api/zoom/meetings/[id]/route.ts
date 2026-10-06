import { auth } from "@/auth";
import { getMeeting, updateMeeting, deleteMeeting, isZoomConfigured } from "@/lib/zoom";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
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
    const { id } = await props.params;
    const meeting = await getMeeting(id);
    return NextResponse.json({ success: true, data: meeting });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to get meeting" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
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
    const { id } = await props.params;
    const body = await req.json();
    await updateMeeting(id, body);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Update Meeting (API)",
      entity: "Meeting",
      entityId: String(id),
      description: `Rapat ${id} diperbarui via API`,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update meeting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
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
    const { id } = await props.params;
    await deleteMeeting(id);
    await db.logActivity({
      userId: session.user?.id,
      userEmail: session.user?.email || undefined,
      action: "Delete Meeting (API)",
      entity: "Meeting",
      entityId: String(id),
      description: `Rapat ${id} dihapus via API`,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
