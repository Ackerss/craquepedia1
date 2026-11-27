/* eslint-disable @next/next/no-img-element */
import { Check, FileText, Globe, IdCard, ImageIcon, LayoutTemplate, Send, Clapperboard, MonitorPlay, Megaphone } from "lucide-react";
import type { Athlete } from "@/db/schema";
import { getAthlete, getCompany, listPackages, listServices } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { brl, fmtDate, fmtPhone, todayISO } from "@/lib/utils";
import { PrintButton } from "@/components/resume/PrintButton";
import { LogoMark } from "@/components/ui/Logo";
import { SportIcon } from "@/components/ui/SportIcon";

const ICONS: Record<string, typeof FileText> = { FileText, Globe, IdCard, LayoutTemplate, Clapperboard, MonitorPlay, Megaphone, Send };

export async function loadProposal(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  return getAthlete(id);
}

/** Proposta comercial (versão interna e link público /proposta/[id]). */
export async function Proposal({ a, toolbar }: { a: Athlete; toolbar?: React.ReactNode }) {
  const [company, pkgs, svcs] = await Promise.all([getCompany(), listPackages(true), listServices(true)]);
  const sport = getSport(a.sport);
  const first = a.nickname || a.fullName.split(" ")[0];
  const valid = todayISO(7);
  const svc = (k: string) => svcs.find((s) => s.key === k);
  return (
    <div className="min-h-screen bg-slate-200/70 py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-4 flex max-w-[794px] flex-wrap items-center justify-end gap-2 px-4">
        {toolbar}
        <PrintButton label="Baixar PDF da proposta" />
      </div>
      <div className="overflow-x-auto print:overflow-visible">
      <div className="print-page relative mx-auto w-full max-w-[794px] overflow-hidden bg-white text-slate-800 shadow-xl print:w-[794px] print:max-w-none" style={{ minHeight: 1123 }}>
        {/* Capa */}
        <div className="relative h-[330px] overflow-hidden bg-[#070b14] text-white">
          <img src={sport.image} alt="" className="absolute right-0 top-0 h-full w-[60%] object-cover" style={{ maskImage: "linear-gradient(90deg, transparent, black 50%)" }} />
          <div className="relative flex h-full flex-col justify-between px-6 py-10 sm:px-12">
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-xl font-semibold uppercase tracking-wide">{company.name}</span>
            </div>
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ background: sport.color }}>
                <SportIcon sport={sport.slug} className="size-3.5" /> {sport.name}
              </p>
              <h1 className="mt-3 break-words font-display text-[34px] font-semibold uppercase leading-none sm:text-[44px]">Proposta para {first}</h1>
              <p className="mt-2 max-w-md text-[15px] text-white/75">Materiais profissionais para apresentar seu talento a clubes, olheiros, empresários e universidades.</p>
            </div>
          </div>
        </div>

        <div className="px-6 pt-9 sm:px-12">
          <h2 className="font-display text-[18px] font-semibold uppercase tracking-[0.15em] text-ink-900">O que você recebe</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: FileText, t: "Currículo esportivo", d: "14 modelos em PDF, em português e inglês" },
              { icon: LayoutTemplate, t: "Portfólio online", d: "Site com fotos, vídeos e números" },
              { icon: IdCard, t: "Cartão digital", d: "Link com QR Code para compartilhar" },
              { icon: ImageIcon, t: "Artes para Instagram", d: "Posts e stories prontos para postar" },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-slate-200 p-3.5">
                <x.icon className="size-6" style={{ color: sport.color }} />
                <p className="mt-2 text-[13px] font-bold text-ink-900">{x.t}</p>
                <p className="text-[11.5px] leading-snug text-slate-500">{x.d}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-9 font-display text-[18px] font-semibold uppercase tracking-[0.15em] text-ink-900">Pacotes</h2>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-3">
            {pkgs.map((p) => (
              <div key={p.id} className={`relative flex break-inside-avoid flex-col rounded-2xl p-4 ${p.highlight ? "bg-ink-900 text-white shadow-lg" : "border border-slate-200"}`}>
                {p.highlight && p.id === pkgs.find((x) => x.highlight)?.id ? (
                  <span className="absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: sport.color }}>
                    Mais escolhido
                  </span>
                ) : null}
                <p className="font-display text-[20px] font-semibold uppercase">{p.name}</p>
                <p className={`text-[11.5px] ${p.highlight ? "text-white/70" : "text-slate-500"}`}>{p.description}</p>
                <p className="mt-3 font-display text-[30px] font-semibold leading-none">{brl(p.priceCents)}</p>
                <ul className="mt-3 space-y-1.5">
                  {p.serviceKeys.map((k) => (
                    <li key={k} className="flex gap-1.5 text-[12px]">
                      <Check className="mt-0.5 size-3.5 shrink-0" style={{ color: p.highlight ? "#6ee7b7" : sport.color }} />
                      {svc(k)?.name ?? k}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <h2 className="mt-9 font-display text-[18px] font-semibold uppercase tracking-[0.15em] text-ink-900">Serviços avulsos</h2>
          <table className="mt-3 w-full text-[12.5px]">
            <tbody>
              {svcs.map((s) => {
                const Icon = ICONS[s.icon] ?? FileText;
                return (
                  <tr key={s.id} className="break-inside-avoid border-b border-slate-100">
                    <td className="py-2 pr-2">
                      <Icon className="size-4 text-slate-400" />
                    </td>
                    <td className="py-2 pr-3 font-semibold text-ink-900">{s.name}</td>
                    <td className="py-1.5 pr-3 text-[11.5px] text-slate-500">{s.description}</td>
                    <td className="whitespace-nowrap py-2 text-right font-semibold">{brl(s.priceCents)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mx-6 mb-10 mt-8 flex break-inside-avoid flex-col gap-3 rounded-2xl bg-slate-50 px-6 py-4 text-[12.5px] sm:mx-12 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="font-semibold text-ink-900">Proposta válida até {fmtDate(valid)}</p>
            {company.pix ? <p className="text-slate-600">PIX: {company.pix}</p> : null}
          </div>
          <div className="text-slate-600 sm:text-right">
            {company.whatsapp ? <p>WhatsApp: {fmtPhone(company.whatsapp)}</p> : null}
            <p>{[company.instagram, company.email, company.site].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
