import type { Metadata } from "next";
import { getActivityLogsAction } from "@/app/actions/logs";
import { ActivityLogsTable } from "@/components/logs/ActivityLogsTable";
import { ScrollText } from "lucide-react";

export const metadata: Metadata = {
  title: "Activity Logs",
};

export const dynamic = "force-dynamic";

export default async function ActivityLogsPage() {
  const result = await getActivityLogsAction();
  const logs = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-blue-400" />
          Audit & Activity Logs
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Rekam jejak setiap aksi administratif yang terjadi di dalam ZOOM-STA
        </p>
      </div>

      <ActivityLogsTable logs={logs} />
    </div>
  );
}
