import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "CRAQUEPEDIA | Gerenciamento Esportivo",
  description: "Plataforma premium para gestão e marketing de atletas — Versão Isolada Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
