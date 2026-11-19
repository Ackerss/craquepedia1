import { getAthleteBySlug, getCompany } from "@/lib/data";
import { getSport } from "@/lib/sports";
import { onlyDigits } from "@/lib/utils";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const a = await getAthleteBySlug(slug);
  if (!a || !a.publicEnabled) return new Response("not found", { status: 404 });
  const company = await getCompany();
  const phone = onlyDigits(company.whatsapp || a.phone);
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${a.nickname ? `${a.nickname} (${a.fullName})` : a.fullName}`,
    `N:${a.fullName.split(" ").slice(-1)[0]};${a.fullName.split(" ").slice(0, -1).join(" ")};;;`,
    `TITLE:${[getSport(a.sport).name, a.position].filter(Boolean).join(" - ")}`,
    a.currentClub ? `ORG:${a.currentClub}` : "",
    phone ? `TEL;TYPE=CELL:+${phone.length <= 11 ? "55" + phone : phone}` : "",
    a.email ? `EMAIL:${a.email}` : "",
    `NOTE:Contato via ${company.name}`,
    "END:VCARD",
  ].filter(Boolean);
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${a.slug}.vcf"`,
    },
  });
}
