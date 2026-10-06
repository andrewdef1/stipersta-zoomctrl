"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import { Video, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Username atau password salah. Silakan coba lagi.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Username */}
      <div className="space-y-1.5">
        <label
          htmlFor="username"
          className="text-xs font-medium text-zinc-400"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          required
          autoComplete="username"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
        />
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-xs font-medium text-zinc-400"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 pr-11 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk ke Dashboard"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-violet-600/10 blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/40">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Zoom-STA
          </h1>
          <p className="mt-1.5 text-sm text-zinc-400">
            Dashboard Controller · STIPER STA
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Masuk</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Silakan masukkan kredensial admin Anda
            </p>
          </div>

          <Suspense fallback={<div className="text-sm text-zinc-500">Memuat formulir...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          © 2026 STIPER STA · Zoom Dashboard Controller
        </p>
      </div>
    </div>
  );
}
