import type { Metadata } from "next";
import { getAllMeetingsAction } from "@/app/actions/zoom";
import { MeetingTable } from "@/components/meetings/MeetingTable";
import { NewMeetingButton } from "@/components/meetings/NewMeetingButton";
import { CalendarDays, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Manajemen Rapat",
};

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const result = await getAllMeetingsAction();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-400" />
            Manajemen Rapat
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Kelola jadwal rapat Zoom kampus
          </p>
        </div>
        <NewMeetingButton />
      </div>

      {/* Error state */}
      {!result.success ? (
        <div className="rounded-2xl glass p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <p className="text-sm font-medium text-zinc-300">
            Gagal memuat data rapat
          </p>
          <p className="mt-1 text-xs text-zinc-500">{result.error}</p>
        </div>
      ) : (
        <MeetingTable meetings={result.data} />
      )}
    </div>
  );
}
