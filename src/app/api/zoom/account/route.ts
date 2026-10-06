import { auth } from "@/auth";
import { getHostUser, isZoomConfigured } from "@/lib/zoom";
import { NextResponse } from "next/server";

export async function GET() {
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
    const user = await getHostUser();
    return NextResponse.json({ success: true, data: user });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch account info" },
      { status: 500 }
    );
  }
}
