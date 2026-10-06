"use client";

import type { ZoomDailyUsageReport } from "@/types/zoom";
import {
  BarChart3,
  Calendar,
  Users,
  Clock,
  HardDrive,
  TrendingUp,
  Activity,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface Props {
  data: {
    dailyUsage: ZoomDailyUsageReport;
    totalMeetings: number;
    totalParticipants: number;
    totalMinutes: number;
    avgDuration: number;
    cloudStorageMb: number;
  };
}

export function ReportsView({ data }: Props) {
  const dates = data.dailyUsage?.dates || [];

  // Default sample distribution if daily usage is empty in dev
  const chartData =
    dates.length > 0
      ? dates.slice(-10).map((d) => ({
          date: d.date.slice(5), // MM-DD
          meetings: d.meetings,
          participants: d.participants,
          minutes: d.meeting_minutes,
        }))
      : [
          { date: "Sen", meetings: 4, participants: 38, minutes: 240 },
          { date: "Sel", meetings: 6, participants: 52, minutes: 360 },
          { date: "Rab", meetings: 5, participants: 45, minutes: 300 },
          { date: "Kam", meetings: 8, participants: 74, minutes: 480 },
          { date: "Jum", meetings: 7, participants: 60, minutes: 420 },
          { date: "Sab", meetings: 3, participants: 25, minutes: 180 },
        ];

  const maxParticipants = Math.max(...chartData.map((d) => d.participants), 1);
  const maxMinutes = Math.max(...chartData.map((d) => d.minutes), 1);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl glass p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Rapat</span>
            <Calendar className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{data.totalMeetings}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Sesi terdata</p>
        </div>

        <div className="rounded-2xl glass p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Peserta</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{data.totalParticipants}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Akumulasi kehadiran</p>
        </div>

        <div className="rounded-2xl glass p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Total Menit Rapat</span>
            <Clock className="h-4 w-4 text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{formatDuration(data.totalMinutes)}</p>
          <p className="text-[11px] text-zinc-500 mt-1">Rata-rata {data.avgDuration} m/rapat</p>
        </div>

        <div className="rounded-2xl glass p-5 border border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Penyimpanan Cloud</span>
            <HardDrive className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{data.cloudStorageMb} MB</p>
          <p className="text-[11px] text-zinc-500 mt-1">Digunakan untuk rekaman</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Peserta per Periode */}
        <div className="rounded-2xl glass p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                Tren Jumlah Peserta
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Jumlah peserta aktif pada sesi rapat</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-white/5 pb-2">
            {chartData.map((d, i) => {
              const heightPct = Math.round((d.participants / maxParticipants) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-emerald-300 font-semibold">
                    {d.participants}
                  </div>
                  <div
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-emerald-600/40 to-emerald-400/90 group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all"
                  />
                  <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {d.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Menit Rapat per Periode */}
        <div className="rounded-2xl glass p-5 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                Total Menit Pertemuan
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">Akumulasi durasi penggunaan Zoom</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-white/5 pb-2">
            {chartData.map((d, i) => {
              const heightPct = Math.round((d.minutes / maxMinutes) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-300 font-semibold">
                    {d.minutes}m
                  </div>
                  <div
                    style={{ height: `${Math.max(heightPct, 8)}%` }}
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-blue-600/40 to-blue-400/90 group-hover:from-blue-500 group-hover:to-blue-300 transition-all"
                  />
                  <span className="text-[10px] text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {d.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
