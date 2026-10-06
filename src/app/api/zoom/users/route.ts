import { auth } from "@/auth";
import { listUsers, isZoomConfigured } from "@/lib/zoom";
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
    const users = await listUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
