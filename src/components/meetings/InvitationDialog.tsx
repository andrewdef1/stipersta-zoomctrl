"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { buildInvitationText, formatDateTime, formatDuration } from "@/lib/utils";
import type { ZoomMeeting } from "@/types/zoom";
import { Copy, Check, Share2, X } from "lucide-react";

interface InvitationDialogProps {
  meeting: ZoomMeeting;
}

export function InvitationDialog({ meeting }: InvitationDialogProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const invitationText = buildInvitationText({
    topic: meeting.topic,
    start_time: meeting.start_time,
    duration: meeting.duration,
    timezone: meeting.timezone,
    id: meeting.id,
    password: meeting.password,
    join_url: meeting.join_url,
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(invitationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Copy Undangan
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl shadow-black p-6 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-white mb-1">
              Teks Undangan Resmi
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Siap paste ke WhatsApp, Email, atau pengumuman kampus
            </p>

            {/* Preview */}
            <div className="rounded-xl bg-zinc-950 border border-white/5 p-4 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all">
              {invitationText}
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Salin Teks
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
