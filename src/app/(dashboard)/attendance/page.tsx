import type { Metadata } from "next";
import { getAttendanceReportAction } from "@/app/actions/zoom";
import { AttendanceView } from "@/components/attendance/AttendanceView";
import { UserCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Presensi & Kehadiran",
};

export const dynamic = "force-dynamic";

export default async function AttendancePage() {
  const result = await getAttendanceReportAction(30);
  const data = result.success
    ? result.data
    : {
        totalParticipants: 0,
        presentCount: 0,
        lateCount: 0,
        leftEarlyCount: 0,
        attendanceRate: 100,
        records: [],
      };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-blue-400" />
          Laporan Presensi & Kehadiran
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Sistem attendance otomatis terintegrasi Zoom API dengan batas durasi fleksibel
        </p>
      </div>

      <AttendanceView initialData={data} />
    </div>
  );
}
