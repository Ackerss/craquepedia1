"use client";

import { getSport, SPORTS, type SportField } from "@/lib/sports";

export function SportPicker({ value, onChange, dark = false }: { value: string; onChange: (v: string) => void; dark?: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7">
      {SPORTS.map((s) => {
        const active = s.slug === value;
        return (
          <button
            key={s.slug}
            type="button"
            onClick={() => onChange(s.slug)}
            className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center text-xs font-semibold transition ${
              active
                ? "border-brand-500 bg-brand-50 text-brand-800 ring-4 ring-brand-500/15"
                : dark
                  ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="text-2xl leading-none">{s.emoji}</span>
            <span className="leading-tight">{s.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function FieldInput({ f, value }: { f: SportField; value?: string }) {
  const name = `sd_${f.key}`;
  if (f.type === "select")
    return (
      <select name={name} defaultValue={value ?? ""} className="input">
        <option value="">Selecione</option>
        {f.options?.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  if (f.type === "textarea") return <textarea name={name} defaultValue={value ?? ""} className="input" rows={3} placeholder={f.placeholder} />;
  return <input name={name} defaultValue={value ?? ""} className="input" inputMode={f.type === "number" ? "numeric" : undefined} placeholder={f.placeholder} />;
}

export function SportSpecific({
  sport,
  position,
  dominantSide,
  sportData,
  multiPosition = false,
}: {
  sport: string;
  position?: string | null;
  dominantSide?: string | null;
  sportData?: Record<string, string>;
  multiPosition?: boolean;
}) {
  const def = getSport(sport);
  const current = (position ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <div className="grid gap-4 sm:grid-cols-2" key={sport}>
      <div className={multiPosition && def.positions ? "sm:col-span-2" : ""}>
        <label className="label">{def.positionLabel}</label>
        {def.positions && multiPosition ? (
          <div className="flex flex-wrap gap-2">
            {def.positions.map((p) => (
              <label key={p} className="cursor-pointer">
                <input type="checkbox" name="position" value={p} defaultChecked={current.includes(p)} className="peer sr-only" />
                <span className="inline-block rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:font-semibold peer-checked:text-brand-800">
                  {p}
                </span>
              </label>
            ))}
          </div>
        ) : def.positions ? (
          <>
            <input name="position" defaultValue={position ?? ""} list={`pos-${def.slug}`} className="input" placeholder="Selecione ou digite" />
            <datalist id={`pos-${def.slug}`}>
              {def.positions.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </>
        ) : (
          <input name="position" defaultValue={position ?? ""} className="input" />
        )}
      </div>
      {def.sideLabel ? (
        <div>
          <label className="label">{def.sideLabel}</label>
          <select name="dominantSide" defaultValue={dominantSide ?? ""} className="input">
            <option value="">Selecione</option>
            {def.sideOptions?.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      ) : null}
      {def.fields.map((f) => (
        <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
          <label className="label">{f.label}</label>
          <FieldInput f={f} value={sportData?.[f.key]} />
        </div>
      ))}
    </div>
  );
}
