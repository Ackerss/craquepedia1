"use client";

import { useActionState, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, Loader2, ShieldCheck, X } from "lucide-react";
import { submitIntake } from "@/actions/intake";
import { getSport } from "@/lib/sports";
import { SportPicker, SportSpecific } from "@/components/athlete/SportFields";
import { compressImage } from "@/components/athlete/Photos";
import { keepValues } from "@/lib/form-submit";

const UF = "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ");
const STEPS = ["Esporte", "Sobre você", "Dados esportivos", "Sua trajetória", "Fotos e envio"];

function F({ label, hint, children, span = "" }: { label: string; hint?: string; children: React.ReactNode; span?: string }) {
  return (
    <div className={span}>
      <label className="label text-[14px] text-slate-700">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function IntakeForm({
  token,
  initialSport,
  initialName,
  initialPhone,
  company,
}: {
  token: string;
  initialSport?: string | null;
  initialName?: string | null;
  initialPhone?: string | null;
  company: string;
}) {
  const [step, setStep] = useState(initialSport ? 1 : 0);
  const [sport, setSport] = useState(initialSport ?? "");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [state, action, isPending] = useActionState(submitIntake.bind(null, token), null);
  const busy = sending || isPending;
  const def = sport ? getSport(sport) : null;

  if (state?.ok)
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-4 rounded-full bg-brand-50 p-4">
          <CheckCircle2 className="size-12 text-brand-600" />
        </div>
        <h2 className="text-2xl font-bold text-ink-900">Recebemos tudo! 🙌</h2>
        <p className="mt-2 max-w-sm text-slate-600">
          Obrigado! A equipe {company} já está preparando o seu material e vai falar com você pelo WhatsApp.
        </p>
      </div>
    );

  const validate = (): string | null => {
    const f = formRef.current;
    if (!f) return null;
    const v = (n: string) => (f.elements.namedItem(n) as HTMLInputElement | null)?.value?.trim() ?? "";
    if (step === 0 && !sport) return "Escolha o seu esporte.";
    if (step === 1) {
      if (v("fullName").split(/\s+/).length < 2) return "Informe seu nome completo.";
      if (!v("birthDate")) return "Informe sua data de nascimento.";
      if (v("phone").replace(/\D/g, "").length < 10) return "Informe um WhatsApp válido com DDD.";
    }
    return null;
  };

  const go = (d: number) => {
    if (d > 0) {
      const e = validate();
      if (e) return setErr(e);
    }
    setErr(null);
    setStep((s) => Math.max(0, Math.min(STEPS.length - 1, s + d)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = keepValues(action, async (fd) => {
    setSending(true);
    try {
      fd.delete("photos");
      for (const p of photos) fd.append("photos", await compressImage(p.file, 1600, 0.82));
    } finally {
      setSending(false);
    }
  });

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        // Enter num campo antes da última etapa só avança (não envia)
        if (step < STEPS.length - 1) {
          e.preventDefault();
          go(1);
          return;
        }
        return submit(e);
      }}
      className="pb-28"
    >
      <input type="hidden" name="sport" value={sport} />

      {/* Progresso */}
      <div className="sticky top-0 z-20 bg-white/95 px-5 pb-3 pt-4 backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
          <span>
            Etapa {step + 1} de {STEPS.length}
          </span>
          <span className="text-ink-900">{STEPS[step]}</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition ${i <= step ? "bg-brand-500" : "bg-slate-200"}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-2">
        {/* 0 Esporte */}
        <div className={step === 0 ? "block" : "hidden"}>
          <h2 className="mb-1 text-xl font-bold text-ink-900">Qual é o seu esporte?</h2>
          <p className="mb-4 text-sm text-slate-500">Assim mostramos as perguntas certas para você.</p>
          <SportPicker value={sport} onChange={(s) => setSport(s)} />
        </div>

        {/* 1 Sobre você */}
        <div className={step === 1 ? "block space-y-4" : "hidden"}>
          <h2 className="text-xl font-bold text-ink-900">Sobre você</h2>
          <F label="Nome completo *">
            <input name="fullName" defaultValue={initialName ?? ""} className="input" autoComplete="name" />
          </F>
          <F label="Apelido esportivo" hint="Como você é conhecido em campo/quadra">
            <input name="nickname" className="input" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Nascimento *">
              <input name="birthDate" type="date" className="input" />
            </F>
            <F label="Gênero">
              <select name="gender" className="input">
                <option value="">—</option>
                <option>Masculino</option>
                <option>Feminino</option>
              </select>
            </F>
          </div>
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <F label="Cidade">
              <input name="city" className="input" autoComplete="address-level2" />
            </F>
            <F label="UF">
              <select name="state" className="input">
                <option value="">—</option>
                {UF.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Nacionalidade">
              <input name="nationality" defaultValue="Brasileira" className="input" />
            </F>
            <F label="Tem outra cidadania?">
              <input name="secondNationality" className="input" placeholder="ex.: Italiana" />
            </F>
          </div>
          <F label="WhatsApp *">
            <input name="phone" inputMode="tel" defaultValue={initialPhone ?? ""} className="input" placeholder="(11) 99999-9999" autoComplete="tel" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="E-mail">
              <input name="email" type="email" className="input" autoComplete="email" />
            </F>
            <F label="Instagram">
              <input name="instagram" className="input" placeholder="@seuperfil" />
            </F>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">Menor de 18 anos? Dados do responsável:</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="guardianName" className="input" placeholder="Nome do responsável" />
              <input name="guardianPhone" inputMode="tel" className="input" placeholder="WhatsApp do responsável" />
            </div>
          </div>
        </div>

        {/* 2 Dados esportivos */}
        <div className={step === 2 ? "block space-y-4" : "hidden"}>
          <h2 className="text-xl font-bold text-ink-900">
            {def?.emoji} Dados de {def?.name ?? "esporte"}
          </h2>
          <F label={def?.clubLabel ?? "Clube atual"}>
            <input name="currentClub" className="input" />
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Altura (cm)">
              <input name="heightCm" inputMode="numeric" className="input" placeholder="178" />
            </F>
            <F label="Peso (kg)">
              <input name="weightKg" inputMode="numeric" className="input" placeholder="72" />
            </F>
          </div>
          {sport ? <SportSpecific sport={sport} multiPosition /> : null}
          <F label="Como você descreve seu estilo de jogo?" hint="Ex.: rápido, bom no 1x1, forte no jogo aéreo, liderança...">
            <textarea name="playingStyle" className="input" rows={3} />
          </F>
        </div>

        {/* 3 Trajetória */}
        <div className={step === 3 ? "block space-y-4" : "hidden"}>
          <h2 className="text-xl font-bold text-ink-900">Sua trajetória</h2>
          <p className="-mt-2 text-sm text-slate-500">Escreva do seu jeito, sem se preocupar com formatação. Nossa equipe organiza tudo.</p>
          <F label="Clubes / equipes por onde passou" hint="Ex.: 2022-2023 Santos Sub-15; 2024 até hoje Palmeiras Sub-17">
            <textarea name="historico" className="input" rows={4} />
          </F>
          <F label="Títulos, prêmios e conquistas" hint="Ex.: Campeão Paulista Sub-15 (2023), artilheiro da Copa X (2024)">
            <textarea name="conquistas" className="input" rows={4} />
          </F>
          <F label="Seus números" hint="Jogos, gols, assistências, tempos, ranking... o que tiver">
            <textarea name="numeros" className="input" rows={3} />
          </F>
          <F label="Conte um pouco sobre você" hint="Quando começou, o que te motiva, seus objetivos">
            <textarea name="bio" className="input" rows={4} />
          </F>
          <div className="grid gap-3 sm:grid-cols-2">
            <F label="Escola / faculdade">
              <input name="edu_school" className="input" />
            </F>
            <F label="Ano em que termina os estudos">
              <input name="edu_graduationYear" inputMode="numeric" className="input" />
            </F>
            <F label="Nível de inglês">
              <select name="edu_english" className="input">
                <option value="">—</option>
                <option>Básico</option>
                <option>Intermediário</option>
                <option>Avançado</option>
                <option>Fluente</option>
              </select>
            </F>
            <F label="Idiomas">
              <input name="languages" className="input" placeholder="Português, Espanhol..." />
            </F>
          </div>
          <F label="Seu objetivo com a Craquepedia">
            <select name="objetivo" className="input">
              <option value="">—</option>
              <option>Conseguir teste/peneira em clube</option>
              <option>Jogar no exterior</option>
              <option>Bolsa em universidade nos EUA</option>
              <option>Valorizar minha imagem / patrocínio</option>
              <option>Outro</option>
            </select>
          </F>
          <F label="Links de vídeos (YouTube, Instagram, Drive)" hint="Cole um link por linha">
            <textarea name="videos" className="input" rows={3} placeholder="https://" />
          </F>
          <F label="Como conheceu a Craquepedia?">
            <input name="source" className="input" placeholder="Indicação de..., Instagram..." />
          </F>
        </div>

        {/* 4 Fotos */}
        <div className={step === 4 ? "block space-y-4" : "hidden"}>
          <h2 className="text-xl font-bold text-ink-900">Suas fotos</h2>
          <p className="-mt-2 text-sm text-slate-500">
            A <b>primeira foto</b> vai no currículo: de preferência de rosto, com uniforme e fundo limpo. Depois, fotos em ação (até 8).
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              const list = Array.from(e.target.files ?? []).map((file) => ({ file, url: URL.createObjectURL(file) }));
              setPhotos((p) => [...p, ...list].slice(0, 8));
              e.target.value = "";
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={p.url} className="relative overflow-hidden rounded-2xl bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="aspect-square w-full object-cover" />
                {i === 0 ? <span className="badge absolute left-1.5 top-1.5 bg-brand-600 text-white">Principal</span> : null}
                <button type="button" onClick={() => setPhotos((x) => x.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white" aria-label="Remover foto">
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            {photos.length < 8 ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-medium text-slate-500 hover:border-brand-400 hover:text-brand-700"
              >
                <Camera className="size-6" />
                Adicionar
              </button>
            ) : null}
          </div>
          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600">
            <input type="checkbox" name="consent" className="mt-0.5 size-5 shrink-0 accent-emerald-600" />
            <span>
              <ShieldCheck className="mr-1 inline size-4 text-brand-600" />
              Autorizo a {company} a usar meus dados e imagens para criar e divulgar meus materiais esportivos (currículo, portfólio e cartão), conforme a LGPD. Se
              eu for menor de idade, meu responsável está de acordo.
            </span>
          </label>
          {state?.error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}
        </div>
        {err ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p> : null}
      </div>

      {/* Navegação */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => go(-1)} className="btn-ghost px-4">
              <ArrowLeft className="size-4" />
            </button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <button key="next" type="button" onClick={() => go(1)} className="btn-primary flex-1 py-3 text-base">
              Continuar <ArrowRight className="size-4" />
            </button>
          ) : (
            <button key="submit" type="submit" disabled={busy} className="btn-primary flex-1 py-3 text-base">
              {busy ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}
              {busy ? "Enviando..." : "Enviar meus dados"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
