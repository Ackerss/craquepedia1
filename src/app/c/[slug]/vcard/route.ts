import { getAthleteBySlug, getCompany } from "@/lib/data";
import { sportOf } from "@/lib/sports";
import { isMinor, onlyDigits } from "@/lib/utils";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) return new Response("not found", { status: 404 });
  const company = await getCompany();
  const minor = isMinor(a.birthDate);
  const phone = onlyDigits(company.whatsapp || (minor ? a.guardianPhone : a.phone));
  // vCard: vírgula, ponto e vírgula e quebra de linha precisam de escape
  const esc = (v: string) => v.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");
  const parts = a.fullName.trim().split(/\s+/);
  const base = process.env.APP_URL ?? new URL(_req.url).origin;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${esc(a.nickname ? `${a.nickname} (${a.fullName})` : a.fullName)}`,
    `N:${esc(parts.slice(-1)[0] ?? "")};${esc(parts.slice(0, -1).join(" "))};;;`,
    `TITLE:${esc([sportOf(a).name, a.position].filter(Boolean).join(" - "))}`,
    a.currentClub ? `ORG:${esc(a.currentClub)}` : "",
    `URL:${base}/p/${a.slug}`,
    phone ? `TEL;TYPE=CELL:+${phone.length <= 11 ? "55" + phone : phone}` : "",
    a.email && !minor ? `EMAIL:${a.email}` : "",
    `NOTE:${esc(company.whatsapp ? `Telefone de contato: ${company.name} (agência do atleta)` : `Contato via ${company.name}`)}`,
    "END:VCARD",
  ].filter(Boolean);
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${a.slug}.vcf"`,
    },
  });
}
