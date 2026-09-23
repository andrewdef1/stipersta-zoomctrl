import type { Metadata } from "next";
import {
  CalendarDays,
  Clock,
  Radio,
  Zap,
  TrendingUp,
  Plus,
} from "lucide-react";
import {
  getUpcomingMeetingsAction,
  getTodayMeetingsAction,
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
  const [upcomingResult, todayResult] = await Promise.all([
    getUpcomingMeetingsAction(),
    getTodayMeetingsAction(),
  ]);

  const upcomingMeetings = upcomingResult.success ? upcomingResult.data : [];
  const todayMeetings = todayResult.success ? todayResult.data : [];

  const liveMeetings = todayMeetings.filter(
    (m) => m.computed_status === "live"
  );
  const upcomingCount = upcomingMeetings.filter(
    (m) => m.computed_status === "upcoming"
  ).length;

  // Total duration this month (from upcoming meetings)
  const totalDuration = upcomingMeetings.reduce(
    (sum, m) => sum + m.duration,
    0
  );

  const hasError = !upcomingResult.success;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Selamat datang di Zoom-STA Control Center
          </p>
        </div>
        <Link
          href="/meetings"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition-all hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Buat Rapat
        </Link>
      </div>

      {/* Error banner */}
      {hasError && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
          ⚠️ Tidak dapat terhubung ke Zoom API. Pastikan kredensial di{" "}
          <code className="font-mono text-amber-300">.env.local</code> sudah benar.
          <span className="text-amber-600 ml-1">({upcomingResult.error})</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Rapat Mendatang"
          value={upcomingCount}
          subtitle="Dijadwalkan"
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

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Quick Start */}
        <div className="lg:col-span-1 space-y-4">
          <QuickStartButton />

          {/* Tips card */}
          <div className="rounded-2xl glass p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Tips Cepat</h3>
            </div>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Gunakan <strong className="text-zinc-300">Template Rapat</strong> untuk membuat jadwal lebih cepat
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Aktifkan <strong className="text-zinc-300">Waiting Room</strong> untuk rapat formal dan sidang
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">→</span>
                Salin <strong className="text-zinc-300">Teks Undangan</strong> dari halaman detail rapat
              </li>
            </ul>
          </div>
        </div>

        {/* Today's meetings */}
        <div className="lg:col-span-2">
          <TodayMeetingList meetings={todayMeetings} />
        </div>
      </div>
    </div>
  );
}
