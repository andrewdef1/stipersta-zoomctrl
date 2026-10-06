import type { Metadata } from "next";
import { getRecordingsAction } from "@/app/actions/zoom";
import { RecordingsList } from "@/components/recordings/RecordingsList";
import { Video } from "lucide-react";

export const metadata: Metadata = {
  title: "Rekaman Zoom Cloud",
};

export const dynamic = "force-dynamic";

export default async function RecordingsPage() {
  const result = await getRecordingsAction();
  const recordings = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Video className="h-5 w-5 text-blue-400" />
          Rekaman Zoom Cloud
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Manajemen rekaman video, audio, dan transkrip rapat institusi STIPER Jayapura
        </p>
      </div>

      <RecordingsList recordings={recordings} />
    </div>
  );
}
