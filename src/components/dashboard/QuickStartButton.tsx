"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInstantMeetingAction } from "@/app/actions/zoom";
import { Zap, Loader2, ExternalLink } from "lucide-react";

export function QuickStartButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");
  const router = useRouter();

  function handleQuickStart() {
    setError("");
    setCreatedUrl("");
    startTransition(async () => {
      const result = await createInstantMeetingAction();
      if (result.success) {
        setCreatedUrl(result.data.start_url ?? "");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (createdUrl) {
    return (
      <div className="rounded-2xl glass p-5 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm font-semibold text-emerald-400">Rapat Dibuat!</p>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Rapat instan berhasil dibuat. Klik tombol di bawah untuk langsung bergabung sebagai host.
        </p>
        <a
          href={createdUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          <ExternalLink className="h-4 w-4" />
          Buka di Zoom
        </a>
        <button
          onClick={() => setCreatedUrl("")}
          className="mt-2 w-full rounded-xl border border-white/10 px-4 py-2 text-xs text-zinc-500 hover:bg-white/5 transition-colors"
        >
          Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Quick Start Meeting</h3>
      </div>
      <p className="text-xs text-zinc-500 mb-4">
        Buat rapat instan langsung tanpa perlu jadwal — cocok untuk rapat mendadak.
      </p>

      {error && (
        <p className="mb-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <button
        onClick={handleQuickStart}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Membuat Rapat...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Mulai Rapat Instan
          </>
        )}
      </button>
    </div>
  );
}
