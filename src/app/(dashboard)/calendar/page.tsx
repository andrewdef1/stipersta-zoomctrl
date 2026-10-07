import type { Metadata } from "next";
import { getAllMeetingsAction } from "@/app/actions/zoom";
import { CalendarView } from "@/components/calendar/CalendarView";
import { Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Kalender Rapat",
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const result = await getAllMeetingsAction();
  const meetings = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-400" />
          Kalender Rapat STIPER
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Tinjau seluruh agenda rapat STIPER STA secara visual berdasarkan tanggal
        </p>
      </div>

      <CalendarView meetings={meetings} />
    </div>
  );
}
