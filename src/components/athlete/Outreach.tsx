import Link from "next/link";
import { Building2, Send } from "lucide-react";
import type { Athlete } from "@/db/schema";
import { getCompany, listContacts, listOutreachForAthlete } from "@/lib/data";
import { baseUrl } from "@/lib/server-utils";
import { getSport } from "@/lib/sports";
import { OUTREACH_STATUS } from "@/lib/outreach";
import { ageFrom, firstName, fmtDate, todayISO } from "@/lib/utils";
import { ContactButton } from "@/components/contacts/ContactForm";
import { OutreachRow, SendMaterial } from "./OutreachClient";

export async function Outreach({ athlete: a }: { athlete: Athlete }) {
  const [history, contacts, company, base] = await Promise.all([listOutreachForAthlete(a.id), listContacts(), getCompany(), baseUrl()]);
  const sport = getSport(a.sport);
  const today = todayISO();
  const sentTo = new Set(history.map((h) => h.c.id));
  const ordered = [...contacts].sort((x, y) => Number(y.c.sports.includes(a.sport)) - Number(x.c.sports.includes(a.sport)));
  const counts = OUTREACH_STATUS.map((s) => ({ ...s, n: history.filter((h) => h.o.status === s.key).length }));
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {counts.map((c) => (
            <div key={c.key} className="card px-3 py-2.5 text-center">
              <p className="text-xl font-bold" style={{ color: c.n ? c.color : "#cbd5e1" }}>
                {c.n}
              </p>
              <p className="text-[11px] text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>
        <section className="card">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h3 className="flex items-center gap-2 font-semibold">
              <Send className="size-4 text-brand-600" /> Histórico de envios
            </h3>
            <Link href="/contatos" className="text-sm font-medium text-brand-700 hover:underline">
              Todos os contatos
            </Link>
          </div>
          {history.length ? (
            <ul className="divide-y divide-slate-100">
              {history.map(({ o, c }) => (
                <OutreachRow
                  key={o.id}
                  o={o}
                  c={c}
                  athleteId={a.id}
                  due={!!o.followUpAt && o.followUpAt <= today}
                  followMsg={`Olá ${firstName(c.name)}, tudo bem? Aqui é da ${company.name}. Passando para saber se conseguiu ver o material do(a) atleta ${a.fullName} que enviei em ${fmtDate(o.sentAt)}.\n\nPortfólio: ${base}/p/${a.slug}\n\nFico à disposição!`}
                />
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              Nenhum envio ainda. Escolha contatos ao lado, mande pelo WhatsApp ou e-mail e marque como enviado para acompanhar o retorno.
            </p>
          )}
        </section>
      </div>
      <div className="space-y-3">
        {contacts.length ? (
          <SendMaterial
            athleteId={a.id}
            contacts={ordered.map(({ c }) => ({ ...c, already: sentTo.has(c.id), match: c.sports.includes(a.sport) }))}
            info={{
              name: a.fullName,
              short: a.nickname || a.fullName.split(" ")[0],
              position: a.position ?? "",
              sport: sport.name,
              sportEn: sport.nameEn,
              age: ageFrom(a.birthDate),
              club: a.currentClub ?? "",
              company: company.name,
              portfolio: `${base}/p/${a.slug}`,
              cv: `${base}/cv/${a.slug}`,
            }}
          />
        ) : (
          <div className="card card-pad text-center">
            <Building2 className="mx-auto mb-2 size-8 text-slate-300" />
            <p className="font-semibold">Cadastre seus contatos de divulgação</p>
            <p className="mb-3 text-sm text-slate-500">Clubes, olheiros, empresários e universidades. Depois é só escolher para quem enviar cada atleta.</p>
          </div>
        )}
        <ContactButton className="btn-ghost w-full" label="Cadastrar novo contato" defaultSport={a.sport} />
      </div>
    </div>
  );
}
