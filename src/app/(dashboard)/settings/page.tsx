import type { Metadata } from "next";
import { getZoomAccountStatusAction } from "@/app/actions/zoom";
import { SettingsView } from "@/components/settings/SettingsView";
import { Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Pengaturan & Akun Zoom",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await getZoomAccountStatusAction();
  const accountStatus = result.success
    ? result.data
    : {
        configured: false,
        email: "stipersta@gmail.com",
        timezone: "Asia/Jayapura",
        error: result.error,
      };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-400" />
          Pengaturan & Integrasi Zoom
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Status koneksi Zoom API, sinkronisasi data institusi, dan konfigurasi sistem
        </p>
      </div>

      <SettingsView accountStatus={accountStatus} />
    </div>
  );
}
