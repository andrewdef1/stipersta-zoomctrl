"use client";

import { useState, useTransition } from "react";
import {
  Video,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  Shield,
  Key,
  Database,
  ExternalLink,
  Loader2,
  Sparkles,
} from "lucide-react";
import { syncWithZoomAction } from "@/app/actions/zoom";

interface Props {
  accountStatus: {
    configured: boolean;
    email: string;
    timezone: string;
    user?: any;
    error?: string;
  };
}

export function SettingsView({ accountStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  function handleSync() {
    setSyncResult(null);
    setSyncError(null);
    startTransition(async () => {
      const res = await syncWithZoomAction();
      if (res.success) {
        setSyncResult(
          `Sinkronisasi berhasil! ${res.data.meetingsSynced} rapat, ${res.data.participantsSynced} peserta, dan ${res.data.recordingsSynced} rekaman telah diperbarui.`
        );
      } else {
        setSyncError(res.error);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Account Status Card */}
      <div className="rounded-2xl glass p-6 border border-white/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Akun Zoom Terhubung</h2>
                {accountStatus.configured ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
                    <XCircle className="h-3 w-3" />
                    Disconnected
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{accountStatus.email}</p>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={isPending || !accountStatus.configured}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 transition-all shrink-0"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menyinkronkan...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Sinkronkan dengan Zoom
              </>
            )}
          </button>
        </div>

        {/* Sync Feedback */}
        {syncResult && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-300">
            ✓ {syncResult}
          </div>
        )}
        {syncError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-400">
            ✕ {syncError}
          </div>
        )}

        {/* Details breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/5 pt-4 text-xs">
          <div className="rounded-xl bg-zinc-900/50 p-3 border border-white/5">
            <span className="text-zinc-500 text-[11px]">Institusi</span>
            <p className="text-zinc-200 font-medium mt-0.5">STIPER Jayapura</p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-3 border border-white/5">
            <span className="text-zinc-500 text-[11px]">Zona Waktu Resmi</span>
            <p className="text-zinc-200 font-medium mt-0.5">Asia/Jayapura (WIT UTC+9)</p>
          </div>
          <div className="rounded-xl bg-zinc-900/50 p-3 border border-white/5">
            <span className="text-zinc-500 text-[11px]">Tipe Autentikasi</span>
            <p className="text-zinc-200 font-medium mt-0.5">Server-to-Server OAuth</p>
          </div>
        </div>
      </div>

      {/* Environment Config Info */}
      <div className="rounded-2xl glass p-6 border border-white/5 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-blue-400" />
          Konfigurasi Kredensial (.env.local)
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Kredensial Zoom API disimpan secara aman di sisi server menggunakan Server-to-Server OAuth. Frontend tidak pernah memuat rahasia API.
        </p>

        <div className="rounded-xl bg-black/40 border border-white/5 p-4 font-mono text-xs space-y-1.5 text-zinc-400">
          <p className="text-zinc-500"># Zoom Server-to-Server OAuth Credentials</p>
          <p>ZOOM_ACCOUNT_ID=<span className="text-blue-400 font-semibold">{accountStatus.configured ? "••••••••••••••••" : "Belum diisi"}</span></p>
          <p>ZOOM_CLIENT_ID=<span className="text-blue-400 font-semibold">{accountStatus.configured ? "••••••••••••••••" : "Belum diisi"}</span></p>
          <p>ZOOM_CLIENT_SECRET=<span className="text-blue-400 font-semibold">{accountStatus.configured ? "••••••••••••••••" : "Belum diisi"}</span></p>
          <p>ZOOM_USER_ID=<span className="text-emerald-400">stipersta@gmail.com</span></p>
          <p>DEFAULT_TIMEZONE=<span className="text-emerald-400">Asia/Jayapura</span></p>
        </div>
      </div>

      {/* Webhook Endpoint Info */}
      <div className="rounded-2xl glass p-6 border border-white/5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-400" />
          Zoom Webhook Endpoint
        </h3>
        <p className="text-xs text-zinc-400">
          Endpoint aktif untuk menerima pembaruan real-time dari Zoom Cloud (rapat mulai, selesai, rekaman siap):
        </p>
        <div className="rounded-xl bg-black/40 border border-white/5 px-3.5 py-2.5 font-mono text-xs text-blue-400">
          /api/webhooks/zoom
        </div>
      </div>
    </div>
  );
}
