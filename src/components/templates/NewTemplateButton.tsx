"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTemplateAction, type TemplateFormData } from "@/app/actions/templates";
import { Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewTemplateButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

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

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl glass shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Template Baru</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">{error}</p>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Nama Template *</label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} required placeholder="Kuliah Umum" className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Deskripsi</label>
                <input type="text" value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} placeholder="Deskripsi singkat..." className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-violet-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Ikon</label>
                  <select value={form.icon} onChange={(e) => update("icon", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500/50">
                    <option value="video">📹 Video</option>
                    <option value="graduation-cap">🎓 Kuliah</option>
                    <option value="users">👥 Rapat</option>
                    <option value="scroll">📜 Sidang</option>
                    <option value="presentation">📊 Seminar</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">Warna</label>
                  <select value={form.color} onChange={(e) => update("color", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500/50">
                    <option value="blue">Biru</option>
                    <option value="green">Hijau</option>
                    <option value="purple">Ungu</option>
                    <option value="orange">Oranye</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Durasi (menit)</label>
                <input type="number" value={form.duration} onChange={(e) => update("duration", Number(e.target.value))} min={15} step={15} className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500/50" />
              </div>
              <div className="space-y-2">
                {[
                  { key: "waitingRoom" as const, label: "Waiting Room" },
                  { key: "hostVideo" as const, label: "Video Host On" },
                  { key: "participantVideo" as const, label: "Video Peserta On" },
                  { key: "muteUponEntry" as const, label: "Mute on Entry" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={!!form[key]} onChange={(e) => update(key, e.target.checked)} className="h-4 w-4 rounded accent-violet-500" />
                    <span className="text-sm text-zinc-300">{label}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Rekaman Otomatis</label>
                <select value={form.autoRecording} onChange={(e) => update("autoRecording", e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500/50">
                  <option value="none">Tidak Direkam</option>
                  <option value="local">Lokal</option>
                  <option value="cloud">Cloud</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-colors">Batal</button>
                <button type="submit" disabled={isPending} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 transition-all">
                  {isPending ? <><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</> : <><Plus className="h-4 w-4" />Buat Template</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
