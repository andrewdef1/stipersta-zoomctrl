import type { Metadata } from "next";
import { getReportsAction } from "@/app/actions/zoom";
import { ReportsView } from "@/components/reports/ReportsView";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Laporan & Statistik",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const result = await getReportsAction();
  const data = result.success
    ? result.data
    : {
        dailyUsage: { dates: [] },
        totalMeetings: 0,
        totalParticipants: 0,
        totalMinutes: 0,
        avgDuration: 0,
        cloudStorageMb: 0,
      };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-400" />
          Laporan & Statistik Penggunaan
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Statistik menyeluruh penggunaan Zoom institusi STIPER Santo Thomas Aquinas
        </p>
      </div>

      <ReportsView data={data} />
    </div>
  );
}
