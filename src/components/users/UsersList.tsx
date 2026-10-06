"use client";

import type { ZoomUser } from "@/types/zoom";
import { UserCog, ShieldCheck, User, Clock, Key } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Props {
  users: ZoomUser[];
}

export function UsersList({ users }: Props) {
  function getUserType(type: number) {
    if (type === 1) return { label: "Basic User", color: "bg-zinc-700/40 text-zinc-300" };
    if (type === 2) return { label: "Licensed User (Pro)", color: "bg-blue-500/15 text-blue-400 border border-blue-500/20" };
    if (type === 3) return { label: "On-Prem", color: "bg-purple-500/15 text-purple-400 border border-purple-500/20" };
    return { label: "Standard", color: "bg-zinc-800 text-zinc-400" };
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl glass p-12 text-center text-zinc-500">
        <UserCog className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
        <h3 className="text-base font-semibold text-zinc-300">Data Pengguna Zoom</h3>
        <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
          Pastikan kredensial Zoom API diatur dengan izin `user:read:admin` atau `user:read`. Akun host utama adalah stipersta@gmail.com.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const typeInfo = getUserType(u.type);
          const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Host STIPER";

          return (
            <div
              key={u.id}
              className="rounded-2xl glass p-5 border border-white/5 space-y-4 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/20 text-white font-bold text-sm">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{fullName}</h3>
                    <p className="text-xs text-zinc-400 truncate">{u.email}</p>
                  </div>
                </div>

                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
              </div>

              <div className="space-y-2 text-xs border-t border-white/5 pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Key className="h-3 w-3" /> PMI (Personal ID):
                  </span>
                  <span className="font-mono text-zinc-200">{u.pmi || "-"}</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <ShieldCheck className="h-3 w-3" /> Status:
                  </span>
                  <span className="text-emerald-400 font-medium capitalize">
                    {u.status || "Active"}
                  </span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Clock className="h-3 w-3" /> Terdaftar:
                  </span>
                  <span className="text-zinc-300">
                    {u.created_at ? formatDateTime(u.created_at) : "-"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
