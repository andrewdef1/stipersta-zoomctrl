"use client";

import type { ZoomWebinar } from "@/types/zoom";
import { Presentation, AlertTriangle, ExternalLink, Calendar, Plus } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";

interface Props {
  available: boolean;
  webinars: ZoomWebinar[];
  error?: string;
}

export function WebinarView({ available, webinars, error }: Props) {
  if (!available) {
    return (
      <div className="rounded-2xl glass p-10 border border-amber-500/20 bg-amber-500/5 text-center max-w-xl mx-auto space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">
            Zoom Webinar is not available for this account
          </h3>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {error ||
              "Akun institusi stipersta@gmail.com saat ini menggunakan lisensi Zoom Workplace standar tanpa add-on Zoom Webinar. Fitur ini akan otomatis aktif jika paket lisensi akun diperbarui oleh administrator."}
          </p>
        </div>
        <div className="pt-2">
          <a
            href="https://zoom.us/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
          >
            Pelajari Zoom Webinar Add-on
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-xs text-zinc-400">Total {webinars.length} webinar aktif</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {webinars.map((w) => (
          <div key={w.id} className="rounded-2xl glass p-5 border border-white/5 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-base font-semibold text-white">{w.topic}</h3>
              <span className="rounded-full bg-purple-500/15 text-purple-400 text-[10px] font-semibold px-2 py-0.5 border border-purple-500/20">
                Webinar
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-zinc-500" />
              {formatDateTime(w.start_time)} ({formatDuration(w.duration)})
            </p>
            {w.agenda && <p className="text-xs text-zinc-400">{w.agenda}</p>}
            <div className="pt-2 border-t border-white/5 flex gap-2">
              <a
                href={w.join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                Buka Link Webinar
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
