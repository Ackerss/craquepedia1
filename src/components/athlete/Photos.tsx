"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, ImagePlus, Loader2, Star, Trash2, Image as ImageIcon } from "lucide-react";
import { deleteFile, setMainPhoto, uploadAthleteFiles } from "@/actions/athletes";

/** Reduz a foto no navegador (máx. 1600px, JPEG) antes de enviar. */
export async function compressImage(file: File, max = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", quality));
    if (!blob || blob.size > file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function PhotoUpload({
  athleteId,
  kind,
  label,
  multiple = false,
  className = "btn-ghost btn-sm",
}: {
  athleteId: string;
  kind: "photo" | "gallery" | "cover";
  label: string;
  multiple?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={(e) => {
          const list = Array.from(e.target.files ?? []);
          if (!list.length) return;
          start(async () => {
            setErr(null);
            // envia em lotes pequenos para não estourar o limite de upload
            for (let i = 0; i < list.length; i += 3) {
              const fd = new FormData();
              for (const f of list.slice(i, i + 3)) fd.append("files", await compressImage(f));
              const r = await uploadAthleteFiles(athleteId, kind, fd);
              if (r?.error) {
                setErr(r.error);
                break;
              }
            }
            if (ref.current) ref.current.value = "";
          });
        }}
      />
      <button type="button" className={className} disabled={pending} onClick={() => ref.current?.click()}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : kind === "photo" ? <Camera className="size-4" /> : <ImagePlus className="size-4" />}
        {pending ? "Enviando..." : label}
      </button>
      {err ? <span className="text-sm text-red-600">{err}</span> : null}
    </>
  );
}

export function Gallery({
  athleteId,
  items,
  photoId,
  coverId,
}: {
  athleteId: string;
  items: { id: string; kind: string }[];
  photoId?: string | null;
  coverId?: string | null;
}) {
  const [pending, start] = useTransition();
  if (!items.length)
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500">
        <ImageIcon className="mb-2 size-8 text-slate-300" />
        Nenhuma foto ainda. Envie a foto principal e fotos de jogos para o portfólio.
      </div>
    );
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 ${pending ? "opacity-60" : ""}`}>
      {items.map((f) => (
        <div key={f.id} className="group relative overflow-hidden rounded-2xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/files/${f.id}`} alt="" className="aspect-square w-full object-cover" loading="lazy" />
          <div className="absolute left-2 top-2 flex gap-1">
            {f.id === photoId ? <span className="badge bg-brand-600 text-white">Principal</span> : null}
            {f.id === coverId ? <span className="badge bg-ink-900 text-white">Capa</span> : null}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
            <button type="button" title="Usar como foto principal" onClick={() => start(() => setMainPhoto(athleteId, f.id, "photo"))} className="rounded-lg bg-white/90 p-1.5 text-ink-900 hover:bg-white">
              <Star className="size-4" />
            </button>
            <button type="button" title="Usar como capa do portfólio" onClick={() => start(() => setMainPhoto(athleteId, f.id, "cover"))} className="rounded-lg bg-white/90 p-1.5 text-ink-900 hover:bg-white">
              <ImageIcon className="size-4" />
            </button>
            <button type="button" title="Excluir" onClick={() => start(() => deleteFile(athleteId, f.id))} className="rounded-lg bg-white/90 p-1.5 text-red-600 hover:bg-white">
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
