import { cn, formatTime, getMeetingStatus } from "@/lib/utils";
import type { ZoomMeeting } from "@/types/zoom";
import { Clock, ExternalLink, Radio } from "lucide-react";
import { MeetingStatusBadge } from "@/components/meetings/MeetingStatusBadge";
import Link from "next/link";

interface TodayMeetingListProps {
  meetings: ZoomMeeting[];
  className?: string;
}

export function TodayMeetingList({ meetings, className }: TodayMeetingListProps) {
  if (meetings.length === 0) {
    return (
      <div className={cn("rounded-2xl glass p-6", className)}>
        <h2 className="mb-1 text-sm font-semibold text-white">Rapat Hari Ini</h2>
        <p className="text-xs text-zinc-500 mb-4">Jadwal pada hari ini</p>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/60">
            <Clock className="h-6 w-6 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">Tidak ada rapat hari ini</p>
          <p className="mt-1 text-xs text-zinc-600">Selamat beristirahat! 🎉</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl glass p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Rapat Hari Ini</h2>
          <p className="text-xs text-zinc-500">{meetings.length} jadwal</p>
        </div>
        <Link
          href="/meetings"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Lihat semua →
        </Link>
      </div>

      <div className="space-y-2">
        {[...meetings]
          .sort((a, b) => {
            const statusA = getMeetingStatus(a.start_time, a.duration);
            const statusB = getMeetingStatus(b.start_time, b.duration);
            const timeA = new Date(a.start_time).getTime();
            const timeB = new Date(b.start_time).getTime();

            const priority = (s: "live" | "upcoming" | "finished") => {
              if (s === "live") return 0;
              if (s === "upcoming") return 1;
              return 2;
            };

            const pA = priority(statusA);
            const pB = priority(statusB);

            if (pA !== pB) return pA - pB;
            if (statusA === "upcoming" || statusA === "live") return timeA - timeB;
            return timeB - timeA;
          })
          .map((meeting, idx) => {
          const status = getMeetingStatus(meeting.start_time, meeting.duration);
          const isLive = status === "live";
          return (
            <Link
              key={`${meeting.uuid || meeting.id}_${meeting.start_time || idx}`}
              href={`/meetings/${meeting.id}`}
              className="group flex items-center gap-3 rounded-xl p-3 hover:bg-white/5 transition-colors"
            >
              {/* Status indicator */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  isLive ? "bg-red-500/15" : "bg-blue-500/10"
                )}
              >
                {isLive ? (
                  <Radio className="h-4 w-4 text-red-400 animate-pulse" />
                ) : (
                  <Clock className="h-4 w-4 text-blue-400" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  {meeting.topic}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-zinc-500">
                    {formatTime(meeting.start_time)}
                  </span>
                  <span className="text-zinc-700">·</span>
                  <MeetingStatusBadge status={status} size="xs" />
                </div>
              </div>

              <ExternalLink className="h-3.5 w-3.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
