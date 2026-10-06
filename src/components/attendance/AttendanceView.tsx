"use client";

import { useState } from "react";
import type { AttendanceRecord } from "@/types/zoom";
import {
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  Search,
  Download,
} from "lucide-react";
import { formatDateTime, formatDuration } from "@/lib/utils";

interface Props {
  initialData: {
    totalParticipants: number;
    presentCount: number;
    lateCount: number;
    leftEarlyCount: number;
    attendanceRate: number;
    records: AttendanceRecord[];
  };
}

export function AttendanceView({ initialData }: Props) {
  const [threshold, setThreshold] = useState<number>(30);
  const [search, setSearch] = useState("");

  // Re-evaluate statuses based on threshold
  const records = initialData.records.map((r) => {
    let status: "Present" | "Late" | "Left Early" = "Present";
    if (r.duration < 10) {
      status = "Late";
    } else if (r.duration < threshold) {
      status = "Left Early";
    }
    return { ...r, status };
  });

  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.email && r.email.toLowerCase().includes(search.toLowerCase())) ||
      r.meetingTopic.toLowerCase().includes(search.toLowerCase())
  );

  const present = filtered.filter((r) => r.status === "Present").length;
  const late = filtered.filter((r) => r.status === "Late").length;
  const leftEarly = filtered.filter((r) => r.status === "Left Early").length;
  const total = filtered.length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 100;

  function exportCSV() {
    const headers = ["Nama", "Email", "Topik Rapat", "Meeting ID", "Masuk", "Keluar", "Durasi (Menit)", "Status Kehadiran"];
    const rows = filtered.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      r.email || "-",
      `"${r.meetingTopic.replace(/"/g, '""')}"`,
      r.zoomMeetingId,
      r.joinTime,
      r.leaveTime || "-",
      r.duration,
      r.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `presensi_zoom_sta_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl glass p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Tingkat Kehadiran</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{rate}%</p>
          <p className="text-[11px] text-zinc-500 mt-1">Berdasarkan threshold {threshold}m</p>
        </div>

        <div className="rounded-2xl glass p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Hadir Penuh</span>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{present}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Durasi ≥ {threshold} menit</p>
        </div>

        <div className="rounded-2xl glass p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Keluar Awal</span>
            <UserX className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{leftEarly}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Durasi 10 - {threshold} menit</p>
        </div>

        <div className="rounded-2xl glass p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Terlambat / Singkat</span>
            <Clock className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400 mt-2">{late}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Durasi &lt; 10 menit</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl glass p-4">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, topik rapat..."
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          {/* Threshold Config */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-xs text-zinc-400 hidden sm:inline">Ambang:</span>
            <select
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-blue-500/50"
            >
              <option value={15}>15 Menit</option>
              <option value={30}>30 Menit</option>
              <option value={45}>45 Menit</option>
              <option value={60}>60 Menit</option>
              <option value={90}>90 Menit</option>
            </select>
          </div>
        </div>

        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Ekspor Laporan ({filtered.length})
        </button>
      </div>

      {/* Attendance Table */}
      <div className="rounded-2xl glass overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-500 font-semibold">
                <th className="px-5 py-3.5">Nama Peserta</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Rapat</th>
                <th className="px-5 py-3.5">Waktu Masuk</th>
                <th className="px-5 py-3.5">Durasi</th>
                <th className="px-5 py-3.5">Status Presensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-500">
                    Tidak ada data presensi tersedia.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white">{r.name}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{r.email || "-"}</td>
                    <td className="px-5 py-3.5 text-blue-400 font-medium">{r.meetingTopic}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{formatDateTime(r.joinTime)}</td>
                    <td className="px-5 py-3.5 text-zinc-300">{formatDuration(r.duration)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          r.status === "Present"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                            : r.status === "Left Early"
                            ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/15 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {r.status === "Present" && "✓ "}
                        {r.status === "Left Early" && "⏱ "}
                        {r.status === "Late" && "✕ "}
                        {r.status}
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
