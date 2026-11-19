import type { Metadata, Viewport } from "next";
import { Inter, Oswald, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald", weight: ["400", "500", "600", "700"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["500", "700", "800"] });

export const metadata: Metadata = {
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
