"use client";

import { useActionState, useState } from "react";
import type { Athlete } from "@/db/schema";
import { ATHLETE_STATUS } from "@/lib/catalog";
import { getSport } from "@/lib/sports";
import { FormMessage, Submit } from "@/components/ui/Submit";
import { keepValues } from "@/lib/form-submit";
import { ListEditor } from "./ListEditor";
import { SportPicker, SportSpecific } from "./SportFields";

type Action = (prev: unknown, form: FormData) => Promise<{ error?: string } | undefined | void>;

const UF = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
const ACCENTS = ["#10b981", "#2563eb", "#dc2626", "#f59e0b", "#7c3aed", "#0f172a", "#db2777", "#0891b2"];

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="card card-pad">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink-900">{title}</h2>
        {desc ? <p className="text-sm text-slate-500">{desc}</p> : null}
      </div>
      {children}
    </section>
  );
}

function F({ label, children, span = "" }: { label: string; children: React.ReactNode; span?: string }) {
  return (
    <div className={span}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function AthleteForm({
  athlete,
  action,
  users,
  submitLabel,
}: {
  athlete?: Partial<Athlete>;
  action: Action;
  users: { id: string; name: string }[];
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [sport, setSport] = useState(athlete?.sport ?? "futebol");
  const [accent, setAccent] = useState(athlete?.accent ?? "#10b981");
  const def = getSport(sport);
  const a = athlete ?? {};
  const edu = a.education ?? {};

  return (
    <form onSubmit={keepValues(formAction)} className="space-y-5">
      <input type="hidden" name="sport" value={sport} />
      <input type="hidden" name="accent" value={accent} />

      <Section title="Esporte" desc="Os campos específicos mudam conforme o esporte.">
        <SportPicker value={sport} onChange={setSport} />
      </Section>

      <Section title="Identificação">
        <div className="grid gap-4 sm:grid-cols-6">
          <F label="Nome completo *" span="sm:col-span-4">
            <input name="fullName" required defaultValue={a.fullName ?? ""} className="input" />
          </F>
          <F label="Apelido esportivo" span="sm:col-span-2">
            <input name="nickname" defaultValue={a.nickname ?? ""} className="input" />
          </F>
          <F label="Data de nascimento" span="sm:col-span-2">
            <input name="birthDate" type="date" defaultValue={a.birthDate ?? ""} className="input" />
          </F>
          <F label="Gênero" span="sm:col-span-2">
            <select name="gender" defaultValue={a.gender ?? ""} className="input">
              <option value="">—</option>
              <option>Masculino</option>
              <option>Feminino</option>
            </select>
          </F>
          <F label="Nacionalidade" span="sm:col-span-2">
            <input name="nationality" defaultValue={a.nationality ?? "Brasileira"} className="input" />
          </F>
          <F label="2ª cidadania (passaporte)" span="sm:col-span-2">
            <input name="secondNationality" defaultValue={a.secondNationality ?? ""} className="input" placeholder="ex.: Italiana" />
          </F>
          <F label="Cidade" span="sm:col-span-3">
            <input name="city" defaultValue={a.city ?? ""} className="input" />
          </F>
          <F label="UF" span="sm:col-span-1">
            <select name="state" defaultValue={a.state ?? ""} className="input">
              <option value="">—</option>
              {UF.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </F>
        </div>
      </Section>

      <Section title={`Dados esportivos — ${def.name}`}>
        <div className="grid gap-4 sm:grid-cols-4">
          <F label={def.clubLabel} span="sm:col-span-2">
            <input name="currentClub" defaultValue={a.currentClub ?? ""} className="input" />
          </F>
          <F label="Altura (cm)">
            <input name="heightCm" inputMode="decimal" defaultValue={a.heightCm ?? ""} className="input" placeholder="178" />
          </F>
          <F label="Peso (kg)">
            <input name="weightKg" inputMode="decimal" defaultValue={a.weightKg ?? ""} className="input" placeholder="72" />
          </F>
        </div>
        <div className="mt-4">
          <SportSpecific sport={sport} position={a.position} dominantSide={a.dominantSide} sportData={a.sportData} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <F label="Empresário / agente">
            <input name="agent" defaultValue={a.agent ?? ""} className="input" />
          </F>
          <F label="Idiomas">
            <input name="languages" defaultValue={a.languages ?? ""} className="input" placeholder="Português (nativo), Inglês (intermediário)" />
          </F>
        </div>
      </Section>

      <Section title="Contato e redes">
        <div className="grid gap-4 sm:grid-cols-3">
          <F label="WhatsApp">
            <input name="phone" inputMode="tel" defaultValue={a.phone ?? ""} className="input" placeholder="(11) 99999-9999" />
          </F>
          <F label="E-mail">
            <input name="email" type="email" defaultValue={a.email ?? ""} className="input" />
          </F>
          <F label="Instagram">
            <input name="instagram" defaultValue={a.instagram ?? ""} className="input" placeholder="@usuario" />
          </F>
          <F label="Outras redes / links" span="sm:col-span-3">
            <input name="otherSocials" defaultValue={a.otherSocials ?? ""} className="input" placeholder="TikTok, YouTube, Transfermarkt..." />
          </F>
          <F label="Responsável legal (menores)">
            <input name="guardianName" defaultValue={a.guardianName ?? ""} className="input" />
          </F>
          <F label="WhatsApp do responsável">
            <input name="guardianPhone" defaultValue={a.guardianPhone ?? ""} className="input" />
          </F>
        </div>
      </Section>

      <Section title="Carreira" desc="Do mais recente para o mais antigo. A IA pode montar isso a partir do texto do atleta.">
        <ListEditor
          name="career"
          initial={a.career ?? []}
          addLabel="Adicionar clube"
          columns={[
            { key: "club", label: "Clube / equipe", width: "sm:col-span-4" },
            { key: "period", label: "Período", placeholder: "2023 - Atual", width: "sm:col-span-3" },
            { key: "role", label: "Categoria / função", placeholder: "Sub-17 · Titular", width: "sm:col-span-5" },
            { key: "highlights", label: "Destaques (opcional)", width: "sm:col-span-12" },
          ]}
        />
      </Section>

      <Section title="Conquistas e títulos">
        <ListEditor
          name="achievements"
          initial={a.achievements ?? []}
          addLabel="Adicionar conquista"
          columns={[
            { key: "year", label: "Ano", width: "sm:col-span-2" },
            { key: "title", label: "Título / conquista", width: "sm:col-span-5" },
            { key: "description", label: "Detalhe (opcional)", width: "sm:col-span-5" },
          ]}
        />
      </Section>

      <Section title="Números e estatísticas">
        <ListEditor
          name="stats"
          initial={a.stats ?? []}
          addLabel="Adicionar número"
          suggestions={def.statsSuggestions}
          columns={[
            { key: "label", label: "Indicador", width: "sm:col-span-7" },
            { key: "value", label: "Valor", width: "sm:col-span-5" },
          ]}
        />
      </Section>

      <Section title="Textos do perfil" desc="Usados nos currículos, cartão e portfólio. Deixe em branco e use o botão de IA na página do atleta.">
        <div className="grid gap-4">
          <F label="Resumo de impacto (até 30 palavras)">
            <input name="bioShort" defaultValue={a.bioShort ?? ""} className="input" />
          </F>
          <F label="Biografia">
            <textarea name="bio" defaultValue={a.bio ?? ""} className="input" rows={5} />
          </F>
          <F label="Estilo de jogo / características">
            <textarea name="playingStyle" defaultValue={a.playingStyle ?? ""} className="input" rows={3} />
          </F>
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Biografia em inglês">
              <textarea name="bioEn" defaultValue={a.bioEn ?? ""} className="input" rows={5} />
            </F>
            <F label="Estilo de jogo em inglês">
              <textarea name="playingStyleEn" defaultValue={a.playingStyleEn ?? ""} className="input" rows={5} />
            </F>
          </div>
        </div>
      </Section>

      <Section title="Escolaridade (currículo para universidades dos EUA)">
        <div className="grid gap-4 sm:grid-cols-3">
          <F label="Escola / faculdade" span="sm:col-span-2">
            <input name="edu_school" defaultValue={edu.school ?? ""} className="input" />
          </F>
          <F label="Série / ano">
            <input name="edu_grade" defaultValue={edu.grade ?? ""} className="input" placeholder="2º ano EM" />
          </F>
          <F label="Ano de formatura">
            <input name="edu_graduationYear" defaultValue={edu.graduationYear ?? ""} className="input" placeholder="2027" />
          </F>
          <F label="Média escolar (GPA)">
            <input name="edu_gpa" defaultValue={edu.gpa ?? ""} className="input" placeholder="8,5 / 3.6" />
          </F>
          <F label="Inglês (nível / TOEFL / Duolingo)">
            <input name="edu_english" defaultValue={edu.english ?? ""} className="input" />
          </F>
          <F label="SAT / ACT" span="sm:col-span-3">
            <input name="edu_satAct" defaultValue={edu.satAct ?? ""} className="input" />
          </F>
        </div>
      </Section>

      <Section title="Vídeos" desc="Links do YouTube, Instagram ou Drive. Aparecem no portfólio e nos currículos com QR Code.">
        <ListEditor
          name="videos"
          initial={a.videos ?? []}
          addLabel="Adicionar vídeo"
          columns={[
            { key: "title", label: "Título", placeholder: "Melhores momentos 2025", width: "sm:col-span-4" },
            { key: "url", label: "Link", placeholder: "https://youtube.com/...", width: "sm:col-span-8" },
          ]}
        />
      </Section>

      <Section title="Gestão interna">
        <div className="grid gap-4 sm:grid-cols-3">
          <F label="Status">
            <select name="status" defaultValue={a.status ?? "ativo"} className="input">
              {ATHLETE_STATUS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </F>
          <F label="Responsável">
            <select name="responsibleId" defaultValue={a.responsibleId ?? ""} className="input">
              <option value="">—</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </F>
          <F label="Como chegou (indicação, Instagram...)">
            <input name="source" defaultValue={a.source ?? ""} className="input" />
          </F>
          <div className="sm:col-span-3">
            <label className="label">Cor principal dos materiais</label>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccent(c)}
                  className={`size-9 rounded-full ring-offset-2 transition ${accent === c ? "ring-2 ring-ink-900" : ""}`}
                  style={{ background: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200" />
            </div>
          </div>
          <F label="Observações internas" span="sm:col-span-3">
            <textarea name="notes" defaultValue={a.notes ?? ""} className="input" rows={3} />
          </F>
        </div>
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex-1">
          <FormMessage state={state as { error?: string } | null} />
        </div>
        <Submit pending={isPending} pendingText="Salvando...">{submitLabel}</Submit>
      </div>
    </form>
  );
}
