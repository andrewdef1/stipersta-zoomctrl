"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { deleteMeetingAction } from "@/app/actions/zoom";
import { Trash2, X, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeleteConfirmDialogProps {
  meetingId: number;
  meetingTopic: string;
  onDeleted?: () => void;
  className?: string;
}

export function DeleteConfirmDialog({
  meetingId,
  meetingTopic,
  onDeleted,
  className,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, isPending]);

  function handleDelete() {
    setError("");
    startTransition(async () => {
      const result = await deleteMeetingAction(meetingId);
      if (result.success) {
        setOpen(false);
        onDeleted?.();
        router.push("/meetings");
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors",
          className
        )}
      >
        <Trash2 className="h-4 w-4" />
        Hapus Rapat
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl shadow-black p-6 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="absolute right-4 top-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>

            <h3 className="text-lg font-semibold text-white">Hapus Rapat?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Anda akan menghapus rapat{" "}
              <span className="font-medium text-zinc-200">
                &ldquo;{meetingTopic}&rdquo;
              </span>
              . Tindakan ini tidak dapat dibatalkan dan rapat akan dihapus dari
              akun Zoom.
            </p>

            {error && (
              <p className="mt-3 text-sm text-red-400 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Ya, Hapus
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
