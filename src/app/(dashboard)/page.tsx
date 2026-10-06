import type { Metadata } from "next";
import {
  CalendarDays,
  Clock,
  Radio,
  Zap,
  TrendingUp,
  Plus,
  Calendar,
  LayoutTemplate,
  Video,
  UserCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import {
  getUpcomingMeetingsAction,
  getTodayMeetingsAction,
  getZoomAccountStatusAction,
} from "@/app/actions/zoom";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TodayMeetingList } from "@/components/dashboard/TodayMeetingList";
import { QuickStartButton } from "@/components/dashboard/QuickStartButton";
import { formatDuration } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [upcomingResult, todayResult, accountStatusResult] = await Promise.all([
    getUpcomingMeetingsAction(),
    getTodayMeetingsAction(),
    getZoomAccountStatusAction(),
  ]);

  const upcomingMeetings = upcomingResult.success ? upcomingResult.data : [];
  const todayMeetings = todayResult.success ? todayResult.data : [];
  const accountStatus = accountStatusResult.success
    ? accountStatusResult.data
    : { configured: false, email: "stipersta@gmail.com", timezone: "Asia/Jayapura" };

  const liveMeetings = todayMeetings.filter(
    (m) => m.computed_status === "live"
  );
  const upcomingCount = upcomingMeetings.filter(
    (m) => m.computed_status === "upcoming"
  ).length;

  const totalDuration = upcomingMeetings.reduce(
    (sum, m) => sum + m.duration,
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            ZOOM-STA Control Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            STIPER Santo Thomas Aquinas Jayapura · WIT (UTC+9)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/meetings/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Jadwalkan Rapat
          </Link>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="rounded-2xl glass p-5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Akun Zoom Institusi:</span>
              <span className="text-sm font-semibold text-blue-400 font-mono">
                {accountStatus.email}
              </span>
              {accountStatus.configured ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                  <XCircle className="h-3 w-3" /> Disconnected
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Zona Waktu: Asia/Jayapura (WIT UTC+9) · Lisensi: Workplace Standar / Pro
            </p>
          </div>
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors shrink-0"
        >
          Kelola Koneksi Zoom
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          href="/meetings/new"
          className="flex items-center gap-2.5 rounded-xl glass p-3 border border-white/5 hover:border-blue-500/30 hover:bg-white/5 transition-all text-xs font-medium text-zinc-300"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Plus className="h-4 w-4" />
          </div>
          + Jadwal Rapat
        </Link>

        <Link
          href="/templates"
          className="flex items-center gap-2.5 rounded-xl glass p-3 border border-white/5 hover:border-purple-500/30 hover:bg-white/5 transition-all text-xs font-medium text-zinc-300"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <LayoutTemplate className="h-4 w-4" />
          </div>
          Template Rapat
        </Link>

        <Link
          href="/calendar"
          className="flex items-center gap-2.5 rounded-xl glass p-3 border border-white/5 hover:border-emerald-500/30 hover:bg-white/5 transition-all text-xs font-medium text-zinc-300"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          Kalender
        </Link>

        <Link
          href="/recordings"
          className="flex items-center gap-2.5 rounded-xl glass p-3 border border-white/5 hover:border-amber-500/30 hover:bg-white/5 transition-all text-xs font-medium text-zinc-300"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Video className="h-4 w-4" />
          </div>
          Rekaman Cloud
        </Link>

        <Link
          href="/attendance"
          className="flex items-center gap-2.5 rounded-xl glass p-3 border border-white/5 hover:border-pink-500/30 hover:bg-white/5 transition-all text-xs font-medium text-zinc-300 col-span-2 sm:col-span-1"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
            <UserCheck className="h-4 w-4" />
          </div>
          Presensi
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Rapat Mendatang"
          value={upcomingCount}
          subtitle="Dijadwalkan di Zoom"
          icon={CalendarDays}
          color="blue"
        />
        <StatsCard
          title="Live Sekarang"
          value={liveMeetings.length}
          subtitle={liveMeetings.length > 0 ? "Sedang berlangsung" : "Tidak ada sesi live"}
          icon={Radio}
          color={liveMeetings.length > 0 ? "amber" : "violet"}
        />
        <StatsCard
          title="Rapat Hari Ini"
          value={todayMeetings.length}
          subtitle="Jadwal hari ini"
          icon={Clock}
          color="emerald"
        />
        <StatsCard
          title="Total Durasi"
          value={formatDuration(totalDuration)}
          subtitle="Semua rapat terjadwal"
          icon={TrendingUp}
          color="violet"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick Start & Tips */}
        <div className="lg:col-span-1 space-y-4">
          <QuickStartButton />

          <div className="rounded-2xl glass p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Panduan Administrator</h3>
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Semua jadwal rapat disinkronkan langsung via <strong className="text-zinc-200">Zoom API resmi</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Waktu disesuaikan dengan zona waktu Jayapura <strong className="text-zinc-200">WIT (UTC+9)</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Gunakan <strong className="text-zinc-200">Salin Teks Undangan</strong> untuk membagikan info ke WhatsApp dosen/mahasiswa
              </li>
            </ul>
          </div>
        </div>

        {/* Today's Meetings */}
        <div className="lg:col-span-2">
          <TodayMeetingList meetings={todayMeetings} />
        </div>
      </div>
    </div>
  );
}
