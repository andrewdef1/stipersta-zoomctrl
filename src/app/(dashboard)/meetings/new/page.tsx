import type { Metadata } from "next";
import { getTemplatesAction } from "@/app/actions/templates";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Sparkles } from "lucide-react";
import type { MeetingFormData } from "@/types/zoom";

export const metadata: Metadata = {
  title: "Jadwalkan Rapat Baru",
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ template?: string }>;
}

export default async function ScheduleMeetingPage({ searchParams }: Props) {
  const { template: templateId } = await searchParams;
  const templatesResult = await getTemplatesAction();
  const templates = templatesResult.success ? templatesResult.data : [];

  let prefill: Partial<MeetingFormData> | undefined = undefined;

  if (templateId) {
    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      prefill = {
        topic: selected.name,
        agenda: selected.agenda || selected.description || undefined,
        duration: selected.duration,
        timezone: selected.timezone,
        waiting_room: selected.waitingRoom,
        require_auth: selected.requireAuth,
        host_video: selected.hostVideo,
        participant_video: selected.participantVideo,
        mute_upon_entry: selected.muteUponEntry,
        auto_recording: selected.autoRecording as any,
      };
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* Back button */}
      <Link
        href="/meetings"
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Daftar Rapat
      </Link>

      {/* Header */}
      <div className="rounded-2xl glass p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <CalendarPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Jadwalkan Rapat Zoom</h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Buat rapat baru menggunakan Zoom API resmi STIPER STA
            </p>
          </div>
        </div>

        {/* Template Selector Bar if templates exist */}
        {templates.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-xs font-medium text-zinc-400 mb-2 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Pilih dari Template Siap Pakai:
            </p>
            <div className="flex flex-wrap gap-2">
              {templates.map((t) => (
                <Link
                  key={t.id}
                  href={`/meetings/new?template=${t.id}`}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    templateId === t.id
                      ? "bg-blue-600/30 border-blue-500 text-blue-300 font-medium shadow-sm"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200 hover:bg-white/8"
                  }`}
                >
                  {t.name} ({t.duration}m)
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Form Card */}
      <div className="rounded-2xl glass p-6 shadow-xl shadow-black/20">
        <MeetingForm mode="create" prefill={prefill} asModal={false} />
      </div>
    </div>
  );
}
