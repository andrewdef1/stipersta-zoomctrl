"use client";

import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createTemplateAction, type TemplateFormData } from "@/app/actions/templates";
import { Plus, X, Loader2, Clock } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

export function NewTemplateButton() {
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

  const [form, setForm] = useState<TemplateFormData>({
    name: "",
    description: "",
    icon: "video",
    color: "blue",
    duration: 60,
    timezone: "Asia/Jayapura",
    waitingRoom: true,
    hostVideo: true,
    participantVideo: false,
    muteUponEntry: true,
    autoRecording: "none",
  });

  function update<K extends keyof TemplateFormData>(k: K, v: TemplateFormData[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createTemplateAction(form);
      if (result.success) {
        setOpen(false);
        setForm({ name: "", description: "", icon: "video", color: "blue", duration: 60, timezone: "Asia/Jayapura", waitingRoom: true, hostVideo: true, participantVideo: false, muteUponEntry: true, autoRecording: "none" });
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-purple-500 transition-all hover:-translate-y-0.5"
      >
        <Plus className="h-4 w-4" />
        Template Baru
      </button>

      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700/80 shadow-2xl shadow-black p-6 max-h-[88vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Buat Template Rapat</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">{error}</p>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Nama Template *</label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required placeholder="Contoh: Kuliah Umum" className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Deskripsi</label>
                <input type="text" value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} placeholder="Deskripsi singkat penggunaan template..." className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Ikon</label>
                  <select value={form.icon} onChange={(e) => update("icon", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500/50">
                    <option value="video">📹 Video</option>
                    <option value="graduation-cap">🎓 Kuliah</option>
                    <option value="users">👥 Rapat</option>
                    <option value="scroll">📜 Sidang</option>
                    <option value="presentation">📊 Seminar</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Warna</label>
                  <select value={form.color} onChange={(e) => update("color", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500/50">
                    <option value="blue">Biru</option>
                    <option value="green">Hijau</option>
                    <option value="purple">Ungu</option>
                    <option value="orange">Oranye</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-purple-400" /> Durasi Standar
                  </label>
                  <span className="text-[11px] font-medium text-purple-400">
                    {formatDuration(form.duration ?? 60)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={Math.floor((form.duration ?? 60) / 60)}
                    onChange={(e) => {
                      const hours = Number(e.target.value);
                      const mins = (form.duration ?? 60) % 60;
                      update("duration", Math.max(15, hours * 60 + mins));
                    }}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  >
                    {Array.from({ length: 25 }, (_, i) => (
                      <option key={i} value={i}>{i} Jam</option>
                    ))}
                  </select>
                  <select
                    value={(form.duration ?? 60) % 60}
                    onChange={(e) => {
                      const mins = Number(e.target.value);
                      const hours = Math.floor((form.duration ?? 60) / 60);
                      update("duration", Math.max(15, hours * 60 + mins));
                    }}
                    className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white outline-none focus:border-violet-500/50"
                  >
                    <option value={0}>0 Menit</option>
                    <option value={15}>15 Menit</option>
                    <option value={30}>30 Menit</option>
                    <option value={45}>45 Menit</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 border border-white/5 rounded-xl bg-zinc-950/40 p-3">
                {[
                  { key: "waitingRoom" as const, label: "Waiting Room Aktif" },
                  { key: "hostVideo" as const, label: "Video Host On Otomatis" },
                  { key: "participantVideo" as const, label: "Video Peserta On Otomatis" },
                  { key: "muteUponEntry" as const, label: "Mute Peserta saat Masuk" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={!!form[key]} onChange={(e) => update(key, e.target.checked)} className="h-4 w-4 rounded accent-violet-500" />
                    <span className="text-xs text-zinc-300">{label}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Rekaman Otomatis</label>
                <select value={form.autoRecording} onChange={(e) => update("autoRecording", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-3.5 py-2.5 text-xs text-white outline-none focus:border-violet-500/50">
                  <option value="none">Tidak Direkam</option>
                  <option value="local">Lokal (PC Host)</option>
                  <option value="cloud">Cloud Zoom STIPER</option>
                </select>
              </div>
              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-white/5 transition-colors">Batal</button>
                <button type="submit" disabled={isPending} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-60 transition-all">
                  {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Menyimpan...</> : <><Plus className="h-3.5 w-3.5" />Buat Template</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
