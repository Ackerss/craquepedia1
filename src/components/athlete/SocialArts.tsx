"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Download, ImageIcon, Loader2, Smartphone, Square } from "lucide-react";

const TYPES = [
  { key: "apresentacao", label: "Apresentação", hint: "Foto grande, nome, posição e dados principais." },
  { key: "numeros", label: "Números", hint: "Estatísticas ou melhores marcas em destaque." },
  { key: "conquistas", label: "Conquistas", hint: "Lista de títulos e prêmios." },
  { key: "vitrine", label: "Disponível p/ clubes", hint: "Com QR Code do portfólio, para divulgação." },
] as const;

export function SocialArts({ athleteId, hasStats, hasAchievements, version }: { athleteId: string; hasStats: boolean; hasAchievements: boolean; version: string }) {
  const [fmt, setFmt] = useState<"post" | "story">("post");
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const v = version; // muda quando o perfil é editado, evitando imagem antiga
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold">
            <ImageIcon className="size-5 text-brand-600" /> Artes prontas para Instagram
          </h3>
          <p className="text-sm text-slate-500">Geradas automaticamente com a foto e os dados do perfil. Clique em baixar e poste.</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-sm font-semibold">
          <button type="button" onClick={() => setFmt("post")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${fmt === "post" ? "bg-ink-900 text-white" : "text-slate-600"}`}>
            <Square className="size-4" /> Post 4:5
          </button>
          <button type="button" onClick={() => setFmt("story")} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${fmt === "story" ? "bg-ink-900 text-white" : "text-slate-600"}`}>
            <Smartphone className="size-4" /> Story 9:16
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {TYPES.map((t) => {
          const src = `/api/arte/${athleteId}?tipo=${t.key}&fmt=${fmt}&v=${v}`;
          const weak = (t.key === "numeros" && !hasStats) || (t.key === "conquistas" && !hasAchievements);
          const k = `${t.key}-${fmt}`;
          return (
            <div key={t.key} className="card overflow-hidden">
              <div className={`relative bg-ink-950 ${fmt === "post" ? "aspect-[4/5]" : "aspect-[9/16]"}`}>
                {!loaded[k] ? <Loader2 className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 animate-spin text-white/50" /> : null}
                <img src={src} alt={t.label} loading="lazy" className="absolute inset-0 size-full object-cover" onLoad={() => setLoaded((s) => ({ ...s, [k]: true }))} />
              </div>
              <div className="p-3">
                <p className="font-semibold">{t.label}</p>
                <p className="text-xs text-slate-500">{weak ? "Cadastre números/conquistas no perfil para esta arte ficar completa." : t.hint}</p>
                <a href={`${src}&download=1`} className="btn-primary btn-sm mt-2 w-full">
                  <Download className="size-4" /> Baixar PNG
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
