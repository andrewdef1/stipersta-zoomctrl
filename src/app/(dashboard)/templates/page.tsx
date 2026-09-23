import type { Metadata } from "next";
import {
  getTemplatesAction,
  seedDefaultTemplatesAction,
} from "@/app/actions/templates";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { NewTemplateButton } from "@/components/templates/NewTemplateButton";
import { LayoutTemplate, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Template Rapat",
};

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  // Seed defaults on first visit
  await seedDefaultTemplatesAction();

  const result = await getTemplatesAction();
  const templates = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-violet-400" />
            Template Rapat
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Preset pengaturan rapat untuk membuat jadwal lebih cepat
          </p>
        </div>
        <NewTemplateButton />
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-3 flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
        <p className="text-sm text-zinc-400">
          Pilih template saat membuat jadwal baru untuk mengisi pengaturan secara otomatis.
          Template dapat dikustomisasi dan disimpan untuk penggunaan berulang.
        </p>
      </div>

      {/* Error */}
      {!result.success && (
        <p className="text-sm text-red-400">{result.error}</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {templates.length === 0 && result.success && (
        <div className="rounded-2xl glass p-12 text-center">
          <LayoutTemplate className="mx-auto h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500">Belum ada template</p>
          <p className="text-xs text-zinc-600 mt-1">
            Buat template pertama Anda
          </p>
        </div>
      )}
    </div>
  );
}
