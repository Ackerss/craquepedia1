import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRAQUEPEDIA | Gestão Esportiva",
  description: "Plataforma premium para gestão e marketing de atletas profissionais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
