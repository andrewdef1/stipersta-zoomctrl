import { auth } from "@/auth";
import { syncWithZoom, isZoomConfigured } from "@/lib/zoom";
import { NextResponse } from "next/server";

export async function POST() {
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
    const result = await syncWithZoom();
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Sync failed" },
      { status: 500 }
    );
  }
}
