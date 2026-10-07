"use client";

import { useState, useTransition, useEffect } from "react";
import {
  addCoHostAction,
  removeCoHostAction,
  getMeetingParticipantsWithCoHostAction,
  recordParticipantAction,
  type MeetingParticipantWithCoHost,
} from "@/app/actions/zoom";
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  Plus,
  Trash2,
  Clock,
  Loader2,
  RefreshCw,
  Crown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";

interface MeetingParticipantManagerProps {
  meetingId: number | string;
  initialParticipants?: MeetingParticipantWithCoHost[];
  initialCoHosts?: string[];
  hostEmail?: string;
  orgUsers?: Array<{ id: string; email: string; first_name?: string; last_name?: string }>;
}

export function MeetingParticipantManager({
  meetingId,
  initialParticipants = [],
  initialCoHosts = [],
  hostEmail = "stipersta@gmail.com",
  orgUsers = [],
}: MeetingParticipantManagerProps) {
  const [participants, setParticipants] =
    useState<MeetingParticipantWithCoHost[]>(initialParticipants);
  const [coHosts, setCoHosts] = useState<string[]>(initialCoHosts);
  const [newEmail, setNewEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");

  // Auto-clear notification after 4s
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  // Periodic background refresh every 20 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await getMeetingParticipantsWithCoHostAction(meetingId);
      if (res.success && res.data.participants.length > 0) {
        setParticipants(res.data.participants);
        setCoHosts(res.data.coHosts);
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [meetingId]);

  function handleRecordParticipant(e: React.FormEvent) {
    e.preventDefault();
    if (!manualName.trim()) return;
    setMessage(null);
    startTransition(async () => {
      const res = await recordParticipantAction(meetingId, manualName, manualEmail);
      if (res.success) {
        setManualName("");
        setManualEmail("");
        setShowAddParticipant(false);
        handleRefresh();
        setMessage({ text: `Peserta "${manualName}" berhasil dicatat!`, type: "success" });
      } else {
        setMessage({ text: res.error || "Gagal mencatat peserta.", type: "error" });
      }
    });
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    const result = await getMeetingParticipantsWithCoHostAction(meetingId);
    setIsRefreshing(false);
    if (result.success) {
      setParticipants(result.data.participants);
      setCoHosts(result.data.coHosts);
      setMessage({ text: "Daftar peserta & Co-Host diperbarui dari Zoom.", type: "success" });
    } else {
      setMessage({ text: result.error || "Gagal menyegarkan data.", type: "error" });
    }
  }

  function handleAddCoHost(emailToAdd: string) {
    if (!emailToAdd.trim()) return;
    setMessage(null);
    startTransition(async () => {
      const result = await addCoHostAction(meetingId, emailToAdd);
      if (result.success) {
        const updated = (result.data.alternative_hosts || "")
          .split(/[,;]/)
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        setCoHosts(updated);
        setParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            isCoHost: p.email ? updated.includes(p.email.toLowerCase()) : p.isCoHost,
          }))
        );
        setNewEmail("");
        setMessage({
          text: `Berhasil menjadikan ${emailToAdd} sebagai Co-Host Zoom!`,
          type: "success",
        });
      } else {
        setMessage({ text: result.error || "Gagal menambahkan Co-Host.", type: "error" });
      }
    });
  }

  function handleRemoveCoHost(emailToRemove: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await removeCoHostAction(meetingId, emailToRemove);
      if (result.success) {
        const updated = (result.data.alternative_hosts || "")
          .split(/[,;]/)
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        setCoHosts(updated);
        setParticipants((prev) =>
          prev.map((p) => ({
            ...p,
            isCoHost: p.email ? updated.includes(p.email.toLowerCase()) : false,
          }))
        );
        setMessage({
          text: `Status Co-Host dari ${emailToRemove} telah dihapus.`,
          type: "success",
        });
      } else {
        setMessage({ text: result.error || "Gagal menghapus Co-Host.", type: "error" });
      }
    });
  }

  return (
    <div className="rounded-2xl glass p-5 space-y-5 border border-white/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            Peserta & Manajemen Co-Host
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Lihat peserta yang sudah join dan atur hak akses Co-Host secara langsung
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isPending}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
          title="Segarkan data peserta dari Zoom"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium border animate-in fade-in duration-150 ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Co-Hosts summary & Quick Add Box */}
      <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-purple-400" />
            Daftar Co-Host Aktif ({coHosts.length})
          </p>
          <span className="text-[10px] text-zinc-400">
            Tersinkronisasi otomatis dengan server Zoom
          </span>
        </div>

        {/* Co-Host Badges */}
        <div className="flex flex-wrap gap-2">
          {coHosts.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">
              Belum ada Co-Host tambahan. Tambahkan dari daftar peserta di bawah atau masukkan email.
            </p>
          ) : (
            coHosts.map((email) => (
              <div
                key={email}
                className="flex items-center gap-2 rounded-lg bg-purple-500/15 border border-purple-500/30 px-2.5 py-1 text-xs text-purple-200"
              >
                <Crown className="h-3 w-3 text-purple-400" />
                <span className="font-mono text-[11px]">{email}</span>
                <button
                  onClick={() => handleRemoveCoHost(email)}
                  disabled={isPending}
                  className="text-purple-400 hover:text-red-400 transition-colors ml-0.5"
                  title="Hapus status Co-Host"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Manual Add Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCoHost(newEmail);
          }}
          className="space-y-2 pt-1"
        >
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Masukkan email anggota Zoom institusi..."
              className="flex-1 rounded-xl border border-white/10 bg-zinc-950/80 px-3.5 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-purple-500/50"
            />
            <button
              type="submit"
              disabled={isPending || !newEmail.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition-colors shrink-0"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              + Tambah Co-Host
            </button>
          </div>

          {/* Org users quick pills */}
          {orgUsers.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-zinc-400">Pilih dari Akun Zoom STIPER:</span>
              {orgUsers.map((u) => (
                <button
                  key={u.id || u.email}
                  type="button"
                  onClick={() => setNewEmail(u.email)}
                  className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-300 hover:bg-purple-500/25 transition-colors font-mono"
                >
                  {u.email}
                </button>
              ))}
            </div>
          )}

          <p className="text-[10px] text-zinc-500 leading-tight">
            * <strong>Ketentuan Zoom:</strong> Alternative Host / Co-Host via API hanya dapat diberikan kepada akun yang terdaftar di dalam organisasi Zoom STIPER STA ({hostEmail}).
          </p>
        </form>
      </div>

      {/* Participants Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
            <span>Daftar Peserta Rapat ({participants.length})</span>
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Live Auto-Sync" />
          </h3>
          <button
            onClick={() => setShowAddParticipant(!showAddParticipant)}
            className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddParticipant ? "Tutup Form" : "+ Catat Peserta Manual"}
          </button>
        </div>

        {/* Manual Add Participant Box */}
        {showAddParticipant && (
          <form
            onSubmit={handleRecordParticipant}
            className="rounded-xl border border-white/10 bg-zinc-950/80 p-3.5 space-y-3 animate-in fade-in duration-150"
          >
            <p className="text-xs font-semibold text-zinc-300">
              Catat Kehadiran Peserta / Dosen Secara Manual
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                placeholder="Nama Lengkap Peserta / Dosen *"
                required
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-purple-500/50"
              />
              <input
                type="email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="Email Peserta (Opsional, untuk Co-Host)"
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-purple-500/50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddParticipant(false)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
              >
                {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                Simpan Peserta
              </button>
            </div>
          </form>
        )}

        <div className="rounded-xl border border-white/5 overflow-hidden bg-zinc-950/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-900/60">
                  <th className="px-4 py-3">Nama Peserta</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Waktu Join</th>
                  <th className="px-4 py-3">Durasi</th>
                  <th className="px-4 py-3">Status / Role</th>
                  <th className="px-4 py-3 text-right">Aksi Co-Host</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                      <Users className="h-6 w-6 mx-auto text-zinc-600 mb-1.5" />
                      Belum ada peserta yang bergabung atau data sedang dimuat.
                    </td>
                  </tr>
                ) : (
                  participants.map((p, idx) => {
                    const isHost =
                      p.email && hostEmail && p.email.toLowerCase() === hostEmail.toLowerCase();
                    const isCoHost =
                      p.isCoHost ||
                      (p.email && coHosts.includes(p.email.toLowerCase()));

                    return (
                      <tr
                        key={`${p.id}_${idx}`}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-white flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                            {p.name ? p.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="truncate max-w-[140px] sm:max-w-none">
                            {p.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">
                          {p.email || <span className="text-zinc-600 italic">Tanpa Email</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                          {p.join_time ? formatDateTime(p.join_time) : "-"}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 whitespace-nowrap">
                          {formatDuration(p.duration || 0)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isHost ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                              <Crown className="h-3 w-3" /> Host Utama
                            </span>
                          ) : isCoHost ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                              <ShieldCheck className="h-3 w-3" /> Co-Host
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-white/5 px-2 py-0.5 text-[10px] text-zinc-400">
                              <UserCheck className="h-3 w-3" /> Peserta
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {isHost ? (
                            <span className="text-[11px] text-zinc-500">Host Akun</span>
                          ) : isCoHost ? (
                            <button
                              onClick={() => p.email && handleRemoveCoHost(p.email)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-medium text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="h-3 w-3" />
                              Hapus Co-Host
                            </button>
                          ) : p.email ? (
                            <button
                              onClick={() => p.email && handleAddCoHost(p.email)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 rounded-lg bg-purple-600/20 border border-purple-500/30 px-2.5 py-1 text-[11px] font-semibold text-purple-300 hover:bg-purple-600 hover:text-white transition-all disabled:opacity-50"
                            >
                              <Shield className="h-3 w-3" />
                              Jadikan Co-Host
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-600">Perlu Email</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}