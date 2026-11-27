import type { Metadata, Viewport } from "next";
import { Inter, Oswald, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

// endereço do site para as prévias de link (WhatsApp/Instagram) usarem a imagem certa
const SITE = process.env.APP_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Craquepedia", template: "%s · Craquepedia" },
  description: "Central de serviços para atletas da Craquepedia.",
  icons: { icon: "/brand/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0b1220", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${oswald.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
