import "server-only";
import { headers } from "next/headers";
import QRCode from "qrcode";

export async function baseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function qrSvg(text: string, color = "#0b1220", bg = "#ffffff") {
  return QRCode.toString(text, { type: "svg", margin: 0, color: { dark: color, light: bg }, errorCorrectionLevel: "M" });
}
