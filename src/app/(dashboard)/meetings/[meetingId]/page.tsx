import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMeetingAction } from "@/app/actions/zoom";
import { getMeetingStatus, formatDateTime, formatDuration } from "@/lib/utils";
import { MeetingStatusBadge } from "@/components/meetings/MeetingStatusBadge";
import { InvitationDialog } from "@/components/meetings/InvitationDialog";
import { DeleteConfirmDialog } from "@/components/meetings/DeleteConfirmDialog";
import { EditMeetingButton } from "@/components/meetings/EditMeetingButton";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Copy,
  ExternalLink,
  Clock,
  Calendar,
  Globe,
  Shield,
  Monitor,
  HardDrive,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ meetingId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { meetingId } = await params;
  return { title: `Rapat #${meetingId}` };
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800/60 shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-zinc-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <div className="mt-0.5 text-sm text-zinc-200 break-all">{value}</div>
      </div>
    </div>
  );
}

async function CopyableLink({ url, label }: { url: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="truncate text-blue-400 text-sm">{url}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

export default async function MeetingDetailPage({ params }: Props) {
  const { meetingId } = await params;
  const result = await getMeetingAction(meetingId);

  if (!result.success || !result.data) {
    notFound();
  }

  const meeting = result.data;
  const status = getMeetingStatus(meeting.start_time, meeting.duration);
  const isLive = status === "live";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/meetings"
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Rapat
      </Link>

      {/* Header card */}
      <div className="rounded-2xl glass p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                isLive
                  ? "bg-red-500/15 shadow-lg shadow-red-500/20"
                  : "bg-blue-500/10"
              }`}
            >
              <Video
                className={`h-6 w-6 ${isLive ? "text-red-400" : "text-blue-400"}`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MeetingStatusBadge status={status} size="md" />
                {isLive && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white">{meeting.topic}</h1>
              {meeting.agenda && (
                <p className="mt-1 text-sm text-zinc-400">{meeting.agenda}</p>
              )}
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-5 flex flex-wrap gap-3">
          {meeting.start_url && (
            <a
              href={meeting.start_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all hover:-translate-y-0.5"
            >
              <Video className="h-4 w-4" />
              Mulai Rapat (Host)
            </a>
          )}
          <InvitationDialog meeting={meeting} />
          <EditMeetingButton meeting={meeting} />
          <DeleteConfirmDialog
            meetingId={meeting.id}
            meetingTopic={meeting.topic}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Meeting details */}
        <div className="rounded-2xl glass p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Detail Rapat
          </h2>
          <div>
            <InfoRow
              icon={Calendar}
              label="Waktu Mulai"
              value={formatDateTime(meeting.start_time)}
            />
            <InfoRow
              icon={Clock}
              label="Durasi"
              value={formatDuration(meeting.duration)}
            />
            <InfoRow
              icon={Globe}
              label="Zona Waktu"
              value={meeting.timezone}
            />
            <InfoRow
              icon={Monitor}
              label="Meeting ID"
              value={
                <span className="font-mono text-blue-400">{meeting.id}</span>
              }
            />
            {meeting.password && (
              <InfoRow
                icon={Shield}
                label="Passcode"
                value={
                  <span className="font-mono text-emerald-400">
                    {meeting.password}
                  </span>
                }
              />
            )}
          </div>
        </div>

        {/* Links */}
        <div className="rounded-2xl glass p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">Link</h2>
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-1.5">
              Join URL (Peserta)
            </p>
            <CopyableLink url={meeting.join_url} label="Join URL" />
          </div>
          {meeting.start_url && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1.5">
                Start URL (Host)
              </p>
              <CopyableLink url={meeting.start_url} label="Start URL" />
            </div>
          )}
        </div>

        {/* Settings */}
        {meeting.settings && (
          <div className="rounded-2xl glass p-5 md:col-span-2">
            <h2 className="text-sm font-semibold text-white mb-3">
              Pengaturan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  label: "Video Host",
                  value: meeting.settings.host_video ? "On" : "Off",
                  positive: meeting.settings.host_video,
                },
                {
                  label: "Video Peserta",
                  value: meeting.settings.participant_video ? "On" : "Off",
                  positive: meeting.settings.participant_video,
                },
                {
                  label: "Waiting Room",
                  value: meeting.settings.waiting_room ? "Aktif" : "Nonaktif",
                  positive: meeting.settings.waiting_room,
                },
                {
                  label: "Mute on Entry",
                  value: meeting.settings.mute_upon_entry ? "Aktif" : "Nonaktif",
                  positive: meeting.settings.mute_upon_entry,
                },
                {
                  label: "Auto Recording",
                  value:
                    meeting.settings.auto_recording === "cloud"
                      ? "Cloud"
                      : meeting.settings.auto_recording === "local"
                      ? "Lokal"
                      : "Nonaktif",
                  positive: meeting.settings.auto_recording !== "none",
                },
                {
                  label: "Auth Wajib",
                  value: meeting.settings.meeting_authentication
                    ? "Ya"
                    : "Tidak",
                  positive: meeting.settings.meeting_authentication,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-zinc-900/50 border border-white/5 px-3.5 py-2.5"
                >
                  <p className="text-[11px] text-zinc-500">{item.label}</p>
                  <p
                    className={`text-sm font-medium mt-0.5 ${
                      item.positive ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
