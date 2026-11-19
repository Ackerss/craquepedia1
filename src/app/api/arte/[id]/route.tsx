/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { eq } from "drizzle-orm";
import type { ReactNode } from "react";
import { db } from "@/db";
import { files } from "@/db/schema";
import { getAthlete, getCompany, ready } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { getSport } from "@/lib/sports";
import { parseRecords } from "@/lib/resume-data";
import { baseUrl, qrSvg } from "@/lib/server-utils";
import { ageFrom, igHandle } from "@/lib/utils";

export const runtime = "nodejs";

const ROOT = process.cwd();
let fontsCache: { name: string; data: Buffer; weight: 400 | 500 | 600 | 700 | 800 }[] | null = null;
async function fonts() {
  if (fontsCache) return fontsCache;
  const f = (n: string) => readFile(path.join(ROOT, "src/assets/fonts", n));
  const [i4, i6, i8, o5, o7] = await Promise.all([f("Inter-400.ttf"), f("Inter-600.ttf"), f("Inter-800.ttf"), f("Oswald-500.ttf"), f("Oswald-700.ttf")]);
  fontsCache = [
    { name: "Inter", data: i4, weight: 400 },
    { name: "Inter", data: i6, weight: 600 },
    { name: "Inter", data: i8, weight: 800 },
    { name: "Oswald", data: o5, weight: 500 },
    { name: "Oswald", data: o7, weight: 700 },
  ];
  return fontsCache;
}

async function fileData(id?: string | null) {
  if (!id) return null;
  const [f] = await db.select({ data: files.data, mime: files.mime }).from(files).where(eq(files.id, id)).limit(1);
  if (!f || !/jpe?g|png/.test(f.mime)) return null;
  return `data:${f.mime};base64,${Buffer.from(f.data).toString("base64")}`;
}

async function sportImage(slug: string) {
  const buf = await readFile(path.join(ROOT, "public/sports", `${slug}.jpg`)).catch(() => null);
  return buf ? `data:image/jpeg;base64,${buf.toString("base64")}` : null;
}


export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("unauthorized", { status: 401 });
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const tipo = (url.searchParams.get("tipo") ?? "apresentacao") as "apresentacao" | "numeros" | "conquistas" | "vitrine";
  const story = url.searchParams.get("fmt") === "story";
  const download = url.searchParams.get("download") === "1";
  await ready();
  const a = await getAthlete(id);
  if (!a) return new Response("not found", { status: 404 });
  const sport = getSport(a.sport);
  const [company, photo, cover, art, fnts, base] = await Promise.all([getCompany(), fileData(a.photoId), fileData(a.coverId), sportImage(sport.slug), fonts(), baseUrl()]);
  const W = 1080;
  const H = story ? 1920 : 1350;
  const accent = a.accent || sport.color;
  const name = a.nickname || a.fullName.split(" ").slice(0, 2).join(" ");
  const age = ageFrom(a.birthDate);
  const pos = (a.position ?? "").split(",")[0]?.trim();
  const sd = a.sportData ?? {};
  const records = parseRecords(sd.melhores_marcas || sd.melhores_tempos);
  const hero = cover ?? photo ?? art;
  const ig = igHandle(company.instagram) || company.instagram;

  const Brand = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Oswald", fontWeight: 700, fontSize: 28, color: "#fff" }}>
        {(company.name || "C")[0]}
      </div>
      <div style={{ display: "flex", fontFamily: "Oswald", fontWeight: 700, fontSize: 30, letterSpacing: 4, color: "#fff", textTransform: "uppercase" }}>{company.name}</div>
    </div>
  );
  const Chip = ({ children }: { children: ReactNode }) => (
    <div style={{ display: "flex", alignSelf: "flex-start", background: accent, color: "#fff", borderRadius: 999, padding: "10px 24px", fontSize: 26, fontWeight: 800, letterSpacing: 3, textTransform: "uppercase" }}>
      {children}
    </div>
  );
  const Footer = () => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 26, color: "rgba(255,255,255,.7)" }}>
      <div style={{ display: "flex" }}>{ig || company.name}</div>
      <div style={{ display: "flex" }}>{sport.name}</div>
    </div>
  );
  const Bg = ({ img, opacity = 1, top = 0 }: { img: string | null; opacity?: number; top?: number }) =>
    img ? <img src={img} style={{ position: "absolute", left: 0, top, width: W, height: H - top, objectFit: "cover", objectPosition: "center top", opacity }} /> : null;
  const Shade = ({ from = 0.05, to = 0.96, at = 45 }: { from?: number; to?: number; at?: number }) => (
    <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: `linear-gradient(180deg, rgba(7,11,20,${from}) 0%, rgba(7,11,20,${from + 0.1}) ${at}%, rgba(7,11,20,${to}) 82%)` }} />
  );

  let body: ReactNode;
  if (tipo === "numeros") {
    const items = (records.length ? records.map((r) => ({ label: r.event, value: r.mark })) : a.stats).slice(0, story ? 6 : 4);
    body = (
      <>
        <Bg img={art} opacity={0.55} />
        <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: `radial-gradient(circle at 80% 0%, ${accent}aa, rgba(7,11,20,.92) 55%)` }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: W, height: H, padding: 72 }}>
          <Brand />
          <div style={{ display: "flex", alignItems: "center", gap: 36, marginTop: story ? 140 : 70 }}>
            {photo ? <img src={photo} style={{ width: 210, height: 210, borderRadius: 999, objectFit: "cover", border: `8px solid ${accent}` }} /> : null}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontFamily: "Oswald", fontWeight: 700, fontSize: 92, lineHeight: 1, color: "#fff", textTransform: "uppercase" }}>{name}</div>
              <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,.75)", marginTop: 10 }}>{[pos, a.currentClub].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: 8, color: accent, marginTop: story ? 120 : 70, textTransform: "uppercase" }}>
            {records.length ? "Melhores marcas" : "Números da temporada"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 28 }}>
            {items.map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", width: (W - 144 - 24) / 2, padding: "30px 34px", borderRadius: 32, background: i === 0 ? accent : "rgba(255,255,255,.08)", border: "2px solid rgba(255,255,255,.12)" }}>
                <div style={{ display: "flex", fontFamily: "Oswald", fontWeight: 700, fontSize: 100, lineHeight: 1, color: "#fff" }}>{s.value}</div>
                <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "rgba(255,255,255,.8)", marginTop: 10, textTransform: "uppercase", letterSpacing: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flex: 1 }} />
          <Footer />
        </div>
      </>
    );
  } else if (tipo === "conquistas") {
    const list = a.achievements.slice(0, story ? 8 : 6);
    body = (
      <>
        <Bg img={hero} opacity={0.5} />
        <div style={{ position: "absolute", inset: 0, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(7,11,20,.55), rgba(7,11,20,.96) 50%)" }} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: W, height: H, padding: 72 }}>
          <Brand />
          <div style={{ display: "flex", flex: story ? 0.6 : 0.35 }} />
          <Chip>Conquistas</Chip>
          <div style={{ display: "flex", fontFamily: "Oswald", fontWeight: 700, fontSize: 120, lineHeight: 0.95, color: "#fff", textTransform: "uppercase", marginTop: 22 }}>{name}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 44 }}>
            {list.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 28px", borderRadius: 26, background: "rgba(255,255,255,.07)", border: "2px solid rgba(255,255,255,.1)" }}>
                <div style={{ display: "flex", width: 22, height: 22, borderRadius: 999, background: /vice|prata|2º/i.test(c.title) ? "#cbd5e1" : /bronze|3º/i.test(c.title) ? "#cd7f32" : "#f5b400" }} />
                <div style={{ display: "flex", flex: 1, fontSize: 34, fontWeight: 600, color: "#fff" }}>{c.title}</div>
                <div style={{ display: "flex", fontFamily: "Oswald", fontSize: 34, fontWeight: 500, color: "rgba(255,255,255,.6)" }}>{c.year}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flex: 1 }} />
          <Footer />
        </div>
      </>
    );
  } else if (tipo === "vitrine") {
    const qr = await qrSvg(`${base}/p/${a.slug}`, "#0b1220", "#ffffff");
    const qrUri = `data:image/svg+xml;base64,${Buffer.from(qr).toString("base64")}`;
    const facts = [age !== null ? [`${age}`, "anos"] : null, a.heightCm ? [(a.heightCm / 100).toFixed(2).replace(".", ","), "altura"] : null, a.dominantSide ? [a.dominantSide, sport.sideLabel?.toLowerCase() ?? ""] : null].filter(Boolean) as string[][];
    body = (
      <>
        <Bg img={hero} />
        <Shade from={0.1} to={0.97} at={story ? 40 : 30} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: W, height: H, padding: 72 }}>
          <Brand />
          <div style={{ display: "flex", flex: 1 }} />
          <Chip>Disponível para clubes</Chip>
          <div style={{ display: "flex", fontFamily: "Oswald", fontWeight: 700, fontSize: 140, lineHeight: 0.92, color: "#fff", textTransform: "uppercase", marginTop: 20 }}>{name}</div>
          <div style={{ display: "flex", fontSize: 36, color: "rgba(255,255,255,.8)", marginTop: 14 }}>{[sport.name, pos].filter(Boolean).join(" · ")}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 36, marginTop: 44 }}>
            <div style={{ display: "flex", padding: 16, background: "#fff", borderRadius: 24 }}>
              <img src={qrUri} style={{ width: 190, height: 190 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 18 }}>
                {facts.map(([v, l]) => (
                  <div key={l} style={{ display: "flex", flexDirection: "column", padding: "12px 22px", borderRadius: 20, background: "rgba(255,255,255,.1)" }}>
                    <div style={{ display: "flex", fontFamily: "Oswald", fontWeight: 700, fontSize: 44, color: "#fff" }}>{v}</div>
                    <div style={{ display: "flex", fontSize: 20, color: "rgba(255,255,255,.65)", textTransform: "uppercase", letterSpacing: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", fontSize: 28, fontWeight: 600, color: "#fff" }}>Aponte a câmera e veja o portfólio completo</div>
            </div>
          </div>
          <div style={{ display: "flex", height: 44 }} />
          <Footer />
        </div>
      </>
    );
  } else {
    const facts = [age !== null ? [`${age}`, "anos"] : null, a.heightCm ? [(a.heightCm / 100).toFixed(2).replace(".", ","), "metros"] : null, a.weightKg ? [`${a.weightKg}`, "kg"] : null, a.stats[0] ? [a.stats[0].value, a.stats[0].label] : null].filter(Boolean) as string[][];
    body = (
      <>
        <Bg img={hero} />
        <Shade at={story ? 50 : 40} />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", width: W, height: H, padding: 72 }}>
          <Brand />
          <div style={{ display: "flex", flex: 1 }} />
          <Chip>{sport.name}</Chip>
          <div style={{ display: "flex", fontFamily: "Oswald", fontWeight: 700, fontSize: name.length > 14 ? 120 : 160, lineHeight: 0.9, color: "#fff", textTransform: "uppercase", marginTop: 22 }}>{name}</div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 600, color: "rgba(255,255,255,.85)", marginTop: 16 }}>{[pos, a.currentClub].filter(Boolean).join("  ·  ")}</div>
          {a.bioShort ? <div style={{ display: "flex", fontSize: 32, color: "rgba(255,255,255,.7)", marginTop: 18, lineHeight: 1.35 }}>{`“${a.bioShort}”`}</div> : null}
          <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
            {facts.map(([v, l]) => (
              <div key={l} style={{ display: "flex", flexDirection: "column", padding: "16px 26px", borderRadius: 24, background: "rgba(255,255,255,.1)", border: "2px solid rgba(255,255,255,.12)" }}>
                <div style={{ display: "flex", fontFamily: "Oswald", fontWeight: 700, fontSize: 54, color: "#fff", lineHeight: 1 }}>{v}</div>
                <div style={{ display: "flex", fontSize: 22, color: "rgba(255,255,255,.65)", textTransform: "uppercase", letterSpacing: 2, marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", height: 48 }} />
          <Footer />
        </div>
      </>
    );
  }

  const res = new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: W, height: H, background: "#070b14", fontFamily: "Inter", color: "#fff", overflow: "hidden" }}>{body}</div>
    ),
    { width: W, height: H, fonts: fnts },
  );
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", "private, no-store");
  if (download) headers.set("Content-Disposition", `attachment; filename="${a.slug}-${tipo}-${story ? "story" : "post"}.png"`);
  return new Response(res.body, { status: 200, headers });
}
