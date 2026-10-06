import { auth } from "@/auth";
import { getDailyUsageReports, isZoomConfigured } from "@/lib/zoom";
import { NextRequest, NextResponse } from "next/server";

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
    const now = new Date();
    const year = Number(req.nextUrl.searchParams.get("year")) || now.getFullYear();
    const month = Number(req.nextUrl.searchParams.get("month")) || now.getMonth() + 1;
    const report = await getDailyUsageReports(year, month);
    return NextResponse.json({ success: true, data: report });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
