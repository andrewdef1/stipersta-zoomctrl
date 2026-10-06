import type { Metadata } from "next";
import { getAllParticipantsAction } from "@/app/actions/zoom";
import { ParticipantsTable } from "@/components/participants/ParticipantsTable";
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Data Peserta Rapat",
};

export const dynamic = "force-dynamic";

export default async function ParticipantsPage() {
  const result = await getAllParticipantsAction();
  const participants = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-400" />
          Peserta Rapat Zoom
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Daftar seluruh peserta yang telah menghadiri rapat perkuliahan dan akademik STIPER
        </p>
      </div>

      <ParticipantsTable participants={participants} />
    </div>
  );
}
