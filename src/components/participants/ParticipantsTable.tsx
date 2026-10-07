"use client";

import { useState } from "react";
import { Search, Download, UserCheck, Clock, Users } from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";

interface ParticipantItem {
  id: string;
  zoomMeetingId: string;
  name: string;
  email: string | null;
  joinTime: string;
  leaveTime: string | null;
  duration: number;
  status: string;
}

interface Props {
  participants: ParticipantItem[];
}

export function ParticipantsTable({ participants }: Props) {
  const [search, setSearch] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState<string>("all");

  const meetingIds = Array.from(new Set(participants.map((p) => p.zoomMeetingId)));

  const filtered = participants.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      p.zoomMeetingId.includes(search);
    const matchMeeting =
      selectedMeeting === "all" || p.zoomMeetingId === selectedMeeting;
    return matchSearch && matchMeeting;
  });

  function exportCSV() {
    const headers = ["ID", "Nama Peserta", "Email", "Meeting ID", "Waktu Masuk", "Waktu Keluar", "Durasi (Menit)", "Status"];
    const rows = filtered.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.email || "-",
      p.zoomMeetingId,
      p.joinTime,
      p.leaveTime || "-",
      p.duration,
      p.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `peserta_zoom_sta_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl glass p-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari peserta, email, meeting ID..."
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {meetingIds.length > 0 && (
            <select
              value={selectedMeeting}
              onChange={(e) => setSelectedMeeting(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
            >
              <option value="all">Semua Meeting ({participants.length})</option>
              {meetingIds.map((id) => (
                <option key={id} value={id}>
                  Meeting #{id}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Ekspor CSV ({filtered.length})
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl glass overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-500 font-semibold">
                <th className="px-5 py-3.5">Nama Peserta</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Meeting ID</th>
                <th className="px-5 py-3.5">Waktu Masuk</th>
                <th className="px-5 py-3.5">Durasi</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    <Users className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
                    Tidak ada data peserta ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((p, idx) => (
                  <tr key={`${p.id}_${idx}`} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      {p.name}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">{p.email || "-"}</td>
                    <td className="px-5 py-3.5 font-mono text-blue-400">{p.zoomMeetingId}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{formatDateTime(p.joinTime)}</td>
                    <td className="px-5 py-3.5 text-zinc-300">
                      {formatDuration(p.duration)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          p.status === "Present"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : p.status === "Left Early"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/15 text-red-400 border border-red-500/20"
                        }`}
                      >
                        <UserCheck className="h-2.5 w-2.5" />
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
