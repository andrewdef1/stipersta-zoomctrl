import { auth } from "@/auth";
import { listRecordings, isZoomConfigured } from "@/lib/zoom";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isZoomConfigured()) {
      const recordings = await listRecordings();
      return NextResponse.json({ success: true, data: recordings });
    }
    const saved = await db.getSavedRecordings();
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch recordings" },
      { status: 500 }
    );
  }
}
