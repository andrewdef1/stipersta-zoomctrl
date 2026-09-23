"use client";

import type { MeetingTemplate } from "@prisma/client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTemplateAction } from "@/app/actions/templates";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import {
  Clock,
  Users,
  Mic,
  Video,
  Shield,
  HardDrive,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  GraduationCap,
  Scroll,
  Presentation,
  Star,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  "graduation-cap": GraduationCap,
  users: Users,
  scroll: Scroll,
  presentation: Presentation,
  video: Video,
};

const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
  blue: { bg: "from-blue-600/15 to-blue-600/5", icon: "text-blue-400", border: "border-blue-500/10" },
  green: { bg: "from-emerald-600/15 to-emerald-600/5", icon: "text-emerald-400", border: "border-emerald-500/10" },
  purple: { bg: "from-violet-600/15 to-violet-600/5", icon: "text-violet-400", border: "border-violet-500/10" },
  orange: { bg: "from-amber-600/15 to-amber-600/5", icon: "text-amber-400", border: "border-amber-500/10" },
};

interface TemplateCardProps {
  template: MeetingTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const colors = colorMap[template.color] ?? colorMap.blue;
  const Icon = iconMap[template.icon] ?? Video;

  function handleDelete() {
    if (!confirm(`Hapus template "${template.name}"?`)) return;
    startTransition(async () => {
      await deleteTemplateAction(template.id);
      router.refresh();
    });
  }

  return (
    <>
      <div
        className={cn(
          "group relative rounded-2xl glass p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 border",
          colors.border
        )}
      >
        {/* Default badge */}
        {template.isDefault && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
            <Star className="h-2.5 w-2.5" />
            Default
          </div>
        )}

        {/* Icon + Name */}
        <div className={cn("mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.icon)} />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">{template.name}</h3>
        {template.description && (
          <p className="text-xs text-zinc-500 mb-3 line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Settings */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="h-3 w-3 text-zinc-600" />
            {formatDuration(template.duration)}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {template.waitingRoom && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Shield className="h-3 w-3" /> Waiting Room
              </span>
            )}
            {template.hostVideo && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Video className="h-3 w-3" /> Host Video
              </span>
            )}
            {template.muteUponEntry && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Mic className="h-3 w-3" /> Mute on Entry
              </span>
            )}
            {template.autoRecording !== "none" && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <HardDrive className="h-3 w-3" />
                Rekam ({template.autoRecording})
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowMeetingForm(true)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600/80 to-indigo-600/80 px-3 py-2 text-xs font-semibold text-white hover:from-blue-500/90 hover:to-indigo-500/90 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Gunakan
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/15 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Meeting form with template prefill */}
      {showMeetingForm && (
        <MeetingForm
          mode="create"
          asModal
          prefill={{
            agenda: template.agenda ?? "",
            duration: template.duration,
            timezone: template.timezone,
            password: template.passcode ?? "",
            waiting_room: template.waitingRoom,
            require_auth: template.requireAuth,
            host_video: template.hostVideo,
            participant_video: template.participantVideo,
            mute_upon_entry: template.muteUponEntry,
            auto_recording: template.autoRecording as "none" | "local" | "cloud",
          }}
          onClose={() => setShowMeetingForm(false)}
        />
      )}
    </>
  );
}
