"use client";

import { useState, useTransition } from "react";
import type { ZoomMeetingRecording } from "@/types/zoom";
import {
  Video,
  Play,
  Download,
  Copy,
  Trash2,
  HardDrive,
  FileText,
  Music,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";
import { deleteRecordingAction } from "@/app/actions/zoom";

interface Props {
  recordings: ZoomMeetingRecording[];
}

export function RecordingsList({ recordings }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return (mb / 1024).toFixed(2) + " GB";
    }
    return mb.toFixed(1) + " MB";
  }

  function copyShareLink(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      await deleteRecordingAction(id);
      setDeleteId(null);
    });
  }

  if (recordings.length === 0) {
    return (
      <div className="rounded-2xl glass p-12 text-center text-zinc-500">
        <Video className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
        <h3 className="text-base font-semibold text-zinc-300">Tidak Ada Rekaman Cloud</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Belum ada rekaman Zoom Cloud yang tersimpan pada akun stipersta@gmail.com
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recordings.map((rec) => (
        <div
          key={rec.id}
          className="rounded-2xl glass p-5 border border-white/5 space-y-4 hover:border-white/10 transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 shrink-0">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">{rec.topic}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {formatDateTime(rec.start_time)} · {formatDuration(rec.duration)} · Total Ukuran: {formatBytes(rec.total_size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {rec.share_url && (
                <button
                  onClick={() => copyShareLink(rec.share_url!, String(rec.id))}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-colors"
                >
                  {copiedId === String(rec.id) ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Salin Link Berbagi
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => setDeleteId(rec.id)}
                className="flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus
              </button>
            </div>
          </div>

          {/* Files List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {rec.recording_files?.map((file) => {
              const isVideo = file.file_type === "MP4";
              const isAudio = file.file_type === "M4A";
              const isTranscript = file.file_type === "CHAT" || file.file_type === "TRANSCRIPT";

              return (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-xl bg-zinc-900/60 border border-white/5 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    {isVideo && <Video className="h-4 w-4 text-blue-400 shrink-0" />}
                    {isAudio && <Music className="h-4 w-4 text-purple-400 shrink-0" />}
                    {isTranscript && <FileText className="h-4 w-4 text-amber-400 shrink-0" />}
                    <div>
                      <p className="text-xs font-medium text-zinc-200">
                        {file.recording_type || file.file_type} ({file.file_extension})
                      </p>
                      <p className="text-[10px] text-zinc-500">{formatBytes(file.file_size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {file.play_url && (
                      <a
                        href={file.play_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Tonton"
                      >
                        <Play className="h-3.5 w-3.5 text-blue-400" />
                      </a>
                    )}
                    {file.download_url && (
                      <a
                        href={file.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Unduh"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 w-full max-w-sm rounded-2xl glass p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-base font-semibold text-white">Hapus Rekaman Cloud?</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-5">
              Rekaman akan dipindahkan ke tempat sampah Zoom Cloud dan tidak dapat diakses lagi oleh peserta.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/5"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
