import type { Metadata } from "next";
import { getUsersAction } from "@/app/actions/zoom";
import { UsersList } from "@/components/users/UsersList";
import { UserCog } from "lucide-react";

export const metadata: Metadata = {
  title: "Pengguna Zoom",
};

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const result = await getUsersAction();
  const users = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <UserCog className="h-5 w-5 text-blue-400" />
          Pengguna Zoom Institusi
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Daftar lisensi dan akun pengguna Zoom terdaftar di bawah STIPER Santo Thomas Aquinas
        </p>
      </div>

      <UsersList users={users} />
    </div>
  );
}
