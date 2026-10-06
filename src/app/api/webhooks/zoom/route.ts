import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { verifyZoomWebhook } from "@/lib/zoom";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    const signature = headers.get("x-zm-signature") || "";
    const timestamp = headers.get("x-zm-request-timestamp") || "";

    const secretToken = process.env.ZOOM_WEBHOOK_SECRET_TOKEN ?? "";

    const json = JSON.parse(rawBody || "{}");

    // 1. Handle URL Validation Challenge from Zoom
    if (json.event === "endpoint.url_validation") {
      const plainToken = json.payload?.plainToken;
      const encryptedToken = crypto
        .createHmac("sha256", secretToken)
        .update(plainToken)
        .digest("hex");

      return NextResponse.json({
        plainToken,
        encryptedToken,
      });
    }

    // 2. Signature verification
    if (secretToken && signature && timestamp) {
      const isValid = verifyZoomWebhook(signature, timestamp, rawBody, secretToken);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
      }
    }

    // 3. Process Zoom Events
    const event = json.event;
    const payload = json.payload?.object;

    if (event === "meeting.started") {
      await db.logActivity({
        action: "Meeting Started (Webhook)",
        entity: "Meeting",
        entityId: String(payload?.id),
        description: `Rapat telah dimulai: "${payload?.topic}" (${payload?.id})`,
      });
    } else if (event === "meeting.ended") {
      await db.logActivity({
        action: "Meeting Ended (Webhook)",
        entity: "Meeting",
        entityId: String(payload?.id),
        description: `Rapat telah selesai: "${payload?.topic}" (${payload?.id})`,
      });
    } else if (event === "meeting.participant_joined") {
      const participant = payload?.participant;
      if (participant && payload?.id) {
        await db.saveParticipants(String(payload.id), [
          {
            name: participant.user_name || "Unknown",
            email: participant.email,
            joinTime: participant.join_time || new Date().toISOString(),
            duration: 0,
            status: "Present",
          },
        ]);
      }
    } else if (event === "recording.completed") {
      if (payload?.recording_files && payload?.id) {
        const files = payload.recording_files.map((f: any) => ({
          zoomMeetingId: String(payload.id),
          recordingId: f.id,
          topic: payload.topic,
          startTime: payload.start_time,
          duration: payload.duration,
          fileType: f.file_type,
          fileSize: f.file_size,
          downloadUrl: f.download_url,
          playUrl: f.play_url,
        }));
        await db.saveRecordings(files);
      }
      await db.logActivity({
        action: "Recording Completed (Webhook)",
        entity: "Recording",
        entityId: String(payload?.id),
        description: `Rekaman cloud selesai: "${payload?.topic}"`,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
