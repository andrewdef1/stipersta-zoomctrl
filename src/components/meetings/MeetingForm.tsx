"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createMeetingAction, updateMeetingAction } from "@/app/actions/zoom";
import { generatePasscode, formatDuration, formatDateTime } from "@/lib/utils";
import type { ZoomMeeting, MeetingFormData } from "@/types/zoom";
import {
  Loader2,
  X,
  RefreshCw,
  Clock,
  Video,
  Mic,
  Shield,
  HardDrive,
  Plus,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MeetingFormProps {
  mode: "create" | "edit";
  existing?: ZoomMeeting;
  prefill?: Partial<MeetingFormData>;
  onClose?: () => void;
  onSuccess?: (meeting: ZoomMeeting) => void;
  asModal?: boolean;
}

const DEFAULT_TZ = "Asia/Jayapura";

function toLocalDatetimeString(isoString?: string): string {
  if (!isoString) {
    // Default to now + 1 hour, rounded to next 30 min
    const d = new Date();
    d.setMinutes(d.getMinutes() >= 30 ? 60 : 30, 0, 0);
    d.setHours(d.getHours() + (d.getMinutes() >= 60 ? 1 : 0));
    return d.toISOString().slice(0, 16);
  }
  return new Date(isoString).toISOString().slice(0, 16);
}

export function MeetingForm({
  mode,
  existing,
  prefill,
  onClose,
  onSuccess,
  asModal = false,
}: MeetingFormProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState<MeetingFormData>({
    topic: existing?.topic ?? prefill?.topic ?? "",
    agenda: existing?.agenda ?? prefill?.agenda ?? "",
    start_time:
      toLocalDatetimeString(existing?.start_time ?? prefill?.start_time),
    duration: existing?.duration ?? prefill?.duration ?? 60,
    timezone: existing?.timezone ?? prefill?.timezone ?? DEFAULT_TZ,
    password: existing?.password ?? prefill?.password ?? "",
    waiting_room: existing?.settings?.waiting_room ?? prefill?.waiting_room ?? true,
    require_auth: existing?.settings?.meeting_authentication ?? prefill?.require_auth ?? false,
    host_video: existing?.settings?.host_video ?? prefill?.host_video ?? true,
    participant_video: existing?.settings?.participant_video ?? prefill?.participant_video ?? false,
    mute_upon_entry: existing?.settings?.mute_upon_entry ?? prefill?.mute_upon_entry ?? true,
    auto_recording: existing?.settings?.auto_recording ?? prefill?.auto_recording ?? "none",
  });

  function update<K extends keyof MeetingFormData>(key: K, value: MeetingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAutoPasscode() {
    update("password", generatePasscode());
  }

  function buildRequest() {
    return {
      topic: form.topic,
      agenda: form.agenda,
      type: 2 as const,
      start_time: new Date(form.start_time).toISOString(),
      duration: form.duration,
      timezone: form.timezone,
      password: form.password || undefined,
      settings: {
        host_video: form.host_video,
        participant_video: form.participant_video,
        mute_upon_entry: form.mute_upon_entry,
        waiting_room: form.waiting_room,
        meeting_authentication: form.require_auth,
        auto_recording: form.auto_recording,
      },
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      if (mode === "create") {
        const result = await createMeetingAction(buildRequest());
        if (result.success) {
          onSuccess?.(result.data);
          onClose?.();
          router.push(`/meetings/${result.data.id}`);
        } else {
          setError(result.error);
        }
      } else if (existing) {
        const result = await updateMeetingAction(existing.id, buildRequest());
        if (result.success) {
          onClose?.();
          router.refresh();
        } else {
          setError(result.error);
        }
      }
    });
  }

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!asModal) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [asModal, onClose]);

  const formInputs = (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Topic */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-300">Topik Rapat *</label>
        <input
          type="text"
          value={form.topic}
          onChange={(e) => update("topic", e.target.value)}
          placeholder="Contoh: Rapat Akademik Semester Ganjil"
          required
          className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-all"
        />
      </div>

      {/* Agenda */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-300">Agenda / Deskripsi</label>
        <textarea
          value={form.agenda}
          onChange={(e) => update("agenda", e.target.value)}
          placeholder="Agenda rapat atau deskripsi singkat..."
          rows={3}
          className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-all resize-none"
        />
      </div>

      {/* Time & Duration Controls */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Waktu Mulai */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-400" /> Waktu Mulai *
            </label>
            <input
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => update("start_time", e.target.value)}
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Durasi: Jam & Menit Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Clock className="h-3 w-3 text-purple-400" /> Durasi Rapat *
              </label>
              <span className="text-[11px] font-medium text-blue-400">
                {formatDuration(form.duration)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <select
                  value={Math.floor(form.duration / 60)}
                  onChange={(e) => {
                    const hours = Number(e.target.value);
                    const mins = form.duration % 60;
                    const total = hours * 60 + mins;
                    update("duration", Math.max(15, total));
                  }}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
                >
                  {Array.from({ length: 25 }, (_, i) => (
                    <option key={i} value={i}>
                      {i} Jam
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <select
                  value={form.duration % 60}
                  onChange={(e) => {
                    const mins = Number(e.target.value);
                    const hours = Math.floor(form.duration / 60);
                    const total = hours * 60 + mins;
                    update("duration", Math.max(15, total));
                  }}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
                >
                  <option value={0}>0 Menit</option>
                  <option value={15}>15 Menit</option>
                  <option value={30}>30 Menit</option>
                  <option value={45}>45 Menit</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Live End Time Estimator Banner */}
        <div className="flex items-center justify-between rounded-xl bg-blue-500/10 border border-blue-500/20 px-3.5 py-2 text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            Estimasi Selesai:
          </span>
          <span className="font-semibold text-blue-300">
            {(() => {
              try {
                const start = new Date(form.start_time);
                const end = new Date(start.getTime() + form.duration * 60 * 1000);
                return formatDateTime(end.toISOString()) + " WIT";
              } catch {
                return "-";
              }
            })()}
          </span>
        </div>
      </div>

      {/* Timezone */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-300">Zona Waktu</label>
        <select
          value={form.timezone}
          onChange={(e) => update("timezone", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
        >
          <option value="Asia/Jayapura">Asia/Jayapura (WIT, UTC+9)</option>
          <option value="Asia/Makassar">Asia/Makassar (WITA, UTC+8)</option>
          <option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      {/* Security */}
      <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-3.5 space-y-3">
        <p className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-blue-400" /> Keamanan Rapat
        </p>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-400">Passcode</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="Kosongkan jika tidak diperlukan"
              maxLength={10}
              className="flex-1 rounded-xl border border-white/10 bg-zinc-950/80 px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-all"
            />
            <button
              type="button"
              onClick={handleAutoPasscode}
              title="Auto-generate passcode"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-zinc-400 hover:bg-white/10 hover:text-zinc-200 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Auto
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.waiting_room}
              onChange={(e) => update("waiting_room", e.target.checked)}
              className="h-4 w-4 rounded accent-blue-500"
            />
            <span className="text-xs text-zinc-300">Aktifkan Ruang Tunggu (Waiting Room)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.require_auth}
              onChange={(e) => update("require_auth", e.target.checked)}
              className="h-4 w-4 rounded accent-blue-500"
            />
            <span className="text-xs text-zinc-300">Wajib Login / Autentikasi Akun Zoom</span>
          </label>
        </div>
      </div>

      {/* Video & Audio */}
      <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-3.5 space-y-3">
        <p className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
          <Video className="h-3.5 w-3.5 text-blue-400" /> Pengaturan Video & Audio
        </p>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.host_video}
              onChange={(e) => update("host_video", e.target.checked)}
              className="h-4 w-4 rounded accent-blue-500"
            />
            <span className="text-xs text-zinc-300">Video Host Otomatis Nyala (On)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.participant_video}
              onChange={(e) => update("participant_video", e.target.checked)}
              className="h-4 w-4 rounded accent-blue-500"
            />
            <span className="text-xs text-zinc-300">Video Peserta Otomatis Nyala (On)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.mute_upon_entry}
              onChange={(e) => update("mute_upon_entry", e.target.checked)}
              className="h-4 w-4 rounded accent-blue-500"
            />
            <span className="text-xs text-zinc-300 flex items-center gap-1">
              <Mic className="h-3 w-3 text-zinc-500" />
              Mute Mikrofon Peserta Saat Masuk
            </span>
          </label>
        </div>
      </div>

      {/* Recording */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
          <HardDrive className="h-3 w-3 text-blue-400" /> Rekaman Otomatis
        </label>
        <select
          value={form.auto_recording}
          onChange={(e) => update("auto_recording", e.target.value as MeetingFormData["auto_recording"])}
          className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition-all"
        >
          <option value="none">Tidak Direkam</option>
          <option value="local">Rekam Lokal (di laptop/PC host)</option>
          <option value="cloud">Rekam ke Cloud Zoom STIPER</option>
        </select>
      </div>
    </div>
  );

  const formButtons = (
    <div className="flex gap-3">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/5 transition-colors"
        >
          Batal
        </button>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {mode === "create" ? "Membuat..." : "Menyimpan..."}
          </>
        ) : mode === "create" ? (
          <>
            <Plus className="h-3.5 w-3.5" />
            Buat Jadwal
          </>
        ) : (
          <>
            <Save className="h-3.5 w-3.5" />
            Simpan Perubahan
          </>
        )}
      </button>
    </div>
  );

  if (!asModal) {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {formInputs}
        <div className="pt-2 border-t border-white/5">
          {formButtons}
        </div>
      </form>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card Container */}
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl shadow-black flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900 shrink-0">
          <div>
            <h2 className="text-base font-bold text-white">
              {mode === "create" ? "Buat Jadwal Rapat" : "Edit Rapat"}
            </h2>
            <p className="text-[11px] text-zinc-400">
              {mode === "create" ? "Isi detail rapat Zoom baru" : `Ubah konfigurasi rapat #${existing?.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {formInputs}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-white/10 bg-zinc-900 shrink-0">
            {formButtons}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
