import { auth } from "@/auth";
import { listWebinars, createWebinar, isZoomConfigured } from "@/lib/zoom";
import { NextRequest, NextResponse } from "next/server";

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
    const webinars = await listWebinars();
    return NextResponse.json({ success: true, data: webinars });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Zoom Webinar is not available for this account.", details: err.message },
      { status: 403 }
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
    const body = await req.json();
    const webinar = await createWebinar(body);
    return NextResponse.json({ success: true, data: webinar }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create webinar", details: err.message },
      { status: 500 }
    );
  }
}
