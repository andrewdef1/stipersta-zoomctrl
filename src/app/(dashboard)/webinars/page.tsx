import type { Metadata } from "next";
import { getWebinarsAction } from "@/app/actions/zoom";
import { WebinarView } from "@/components/webinars/WebinarView";
import { Presentation } from "lucide-react";

export const metadata: Metadata = {
  title: "Manajemen Webinar",
};

export const dynamic = "force-dynamic";

export default async function WebinarsPage() {
  const result = await getWebinarsAction();
  const data = result.success
    ? result.data
    : { available: false, webinars: [], error: result.error };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Presentation className="h-5 w-5 text-blue-400" />
          Manajemen Webinar
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Fitur webinar terintegrasi Zoom API, hanya aktif jika akun memiliki lisensi Webinar
        </p>
      </div>

      <WebinarView
        available={data.available}
        webinars={data.webinars}
        error={data.error}
      />
    </div>
  );
}
