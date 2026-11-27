import Link from "next/link";
import { Building2, Download, Mail, MessageCircle } from "lucide-react";
import { listContacts } from "@/lib/data";
import { CONTACT_KINDS, kindLabel } from "@/lib/outreach";
import { getSport } from "@/lib/sports";
import { fmtPhone, waLink } from "@/lib/utils";
import { ContactButton } from "@/components/contacts/ContactForm";
import { DeleteContact } from "./DeleteContact";
import { SportIcon } from "@/components/ui/SportIcon";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contatos" };

export default async function ContatosPage({ searchParams }: { searchParams: Promise<{ tipo?: string; q?: string }> }) {
  const sp = await searchParams;
  const all = await listContacts();
  const q = (sp.q ?? "").toLowerCase();
  const list = all.filter(
    ({ c }) => (!sp.tipo || c.kind === sp.tipo) && (!q || `${c.name} ${c.organization ?? ""} ${c.city ?? ""} ${c.country ?? ""} ${c.notes ?? ""}`.toLowerCase().includes(q)),
  );
  const qs = (p: Record<string, string | undefined>) => {
    const u = new URLSearchParams();
    const m = { tipo: sp.tipo, q: sp.q, ...p };
    Object.entries(m).forEach(([k, v]) => v && u.set(k, v));
    const s = u.toString();
    return s ? `/contatos?${s}` : "/contatos";
  };
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-[28px]">Contatos de divulgação</h1>
          <p className="text-slate-500">Clubes, olheiros, empresários e universidades. Envie o material dos atletas pela aba &quot;Divulgação&quot; de cada um.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {all.length ? (
            <a href="/api/exportar?tipo=contatos" className="btn-ghost" title="Baixar planilha de contatos">
              <Download className="size-4" /> Planilha
            </a>
          ) : null}
          <ContactButton />
        </div>
      </div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <form className="flex-1">
          {sp.tipo ? <input type="hidden" name="tipo" value={sp.tipo} /> : null}
          <input name="q" defaultValue={sp.q} className="input" placeholder="Buscar por nome, clube, cidade, país..." />
        </form>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <Link href={qs({ tipo: undefined })} className={`badge shrink-0 border py-1 ${!sp.tipo ? "border-brand-500 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"}`}>
            Todos ({all.length})
          </Link>
          {CONTACT_KINDS.map((k) => {
            const n = all.filter(({ c }) => c.kind === k.key).length;
            return n ? (
              <Link key={k.key} href={qs({ tipo: k.key })} className={`badge shrink-0 border py-1 ${sp.tipo === k.key ? "border-brand-500 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-600"}`}>
                {k.label} ({n})
              </Link>
            ) : null;
          })}
        </div>
      </div>
      {list.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <Building2 className="mb-3 size-10 text-slate-300" />
          <p className="font-semibold text-ink-900">{all.length ? "Nenhum contato encontrado" : "Monte sua rede de contatos"}</p>
          <p className="mt-1 max-w-md text-sm text-slate-500">Cadastre quem recebe os materiais. Depois, na ficha do atleta, você escolhe para quem enviar e acompanha quem respondeu.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map(({ c, sent, positive }) => (
            <div key={c.id} className="card card-pad flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{c.organization || c.name}</p>
                  <p className="truncate text-sm text-slate-500">{[c.organization ? c.name : null, kindLabel(c.kind)].filter(Boolean).join(" · ")}</p>
                  <p className="truncate text-xs text-slate-400">{[c.city, c.country].filter(Boolean).join(", ")}</p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p>
                    <b className="text-ink-900">{sent}</b> {sent === 1 ? "envio" : "envios"}
                  </p>
                  {positive ? <p className="font-semibold text-violet-600">{positive} retorno(s)</p> : null}
                </div>
              </div>
              {c.sports.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.sports.map((s) => (
                    <span key={s} className="badge bg-slate-100 text-slate-600">
                      <SportIcon sport={s} className="size-3" /> {getSport(s).name}
                    </span>
                  ))}
                </div>
              ) : null}
              {c.notes ? <p className="mt-2 line-clamp-2 text-sm text-slate-600">{c.notes}</p> : null}
              <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                {c.phone ? (
                  <a href={waLink(c.phone, undefined, c.country)} target="_blank" rel="noreferrer" className="btn-ghost btn-sm" title={fmtPhone(c.phone)}>
                    <MessageCircle className="size-4" /> WhatsApp
                  </a>
                ) : null}
                {c.email ? (
                  <a href={`mailto:${c.email}`} className="btn-ghost btn-sm" title={c.email}>
                    <Mail className="size-4" /> E-mail
                  </a>
                ) : null}
                <span className="flex-1" />
                <ContactButton contact={c} className="btn-ghost btn-sm" label="Editar" />
                <DeleteContact id={c.id} name={c.organization || c.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
