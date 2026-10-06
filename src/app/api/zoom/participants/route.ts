import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const meetingId = req.nextUrl.searchParams.get("meetingId") || undefined;
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const participants = await db.getParticipants({ meetingId, search });
    return NextResponse.json({ success: true, data: participants });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch participants" },
      { status: 500 }
    );
  }
}
