"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Sport } from "@/lib/supabase/types";

const SPORT_DESCRIPTIONS: Record<string, string> = {
    futebol: "Futebol de campo — clubes, seleções e categorias de base",
    natacao: "Natação competitiva — piscina curta e longa",
    "artes-marciais": "MMA, Jiu-Jitsu, Judô, Boxe, Muay Thai e mais",
    volei: "Vôlei de quadra — Superliga e competições nacionais",
    basquete: "Basquete profissional — NBB e categorias de formação",
    atletismo: "Corridas, saltos, arremessos e provas combinadas",
    futsal: "Futsal competitivo — Liga Nacional e estaduais",
    corrida: "Corrida de rua, trail running e ultramaratonas",
};

export default function CadastroPage() {
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSports() {
            const { data, error } = await supabase
                .from("sports")
                .select("*")
                .order("name");

            if (data && !error) {
                setSports(data);
            }
            setLoading(false);
        }
        loadSports();
    }, []);

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <header
                style={{
                    padding: "16px 32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid var(--border-color)",
                    background: "#fff",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18 }}>
                    <Trophy size={22} color="var(--primary-color)" />
                    CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                    Cadastro de Atleta
                </span>
            </header>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "48px 24px",
                    maxWidth: 900,
                    margin: "0 auto",
                    width: "100%",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 800,
                            marginBottom: 12,
                            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Qual é o seu esporte?
                    </h1>
                    <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 500, margin: "0 auto" }}>
                        Selecione sua modalidade esportiva para preencher o formulário de cadastro personalizado.
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)", padding: 40 }}>
                        <Loader2 size={24} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                        Carregando modalidades...
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                            gap: 20,
                            width: "100%",
                        }}
                    >
                        {sports.map((sport) => (
                            <Link
                                key={sport.id}
                                href={`/cadastro/${sport.slug}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    padding: "20px 24px",
                                    background: "#fff",
                                    borderRadius: 16,
                                    border: "2px solid var(--border-color)",
                                    textDecoration: "none",
                                    color: "inherit",
                                    transition: "all 0.25s ease",
                                    cursor: "pointer",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = sport.color;
                                    el.style.boxShadow = `0 8px 25px ${sport.color}20`;
                                    el.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget;
                                    el.style.borderColor = "var(--border-color)";
                                    el.style.boxShadow = "none";
                                    el.style.transform = "translateY(0)";
                                }}
                            >
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 14,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 28,
                                        background: `${sport.color}15`,
                                        flexShrink: 0,
                                    }}
                                >
                                    {sport.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{sport.name}</h3>
                                    <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                                        {SPORT_DESCRIPTIONS[sport.slug] || "Clique para preencher o formulário"}
                                    </p>
                                </div>
                                <ChevronRight size={20} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                            </Link>
                        ))}
                    </div>
                )}

                <p
                    style={{
                        marginTop: 48,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        textAlign: "center",
                        maxWidth: 400,
                    }}
                >
                    Ao enviar o formulário, seus dados serão analisados pela equipe Craquepedia. Entraremos em contato pelo WhatsApp.
                </p>
            </main>

            {/* Footer */}
            <footer
                style={{
                    padding: "20px 32px",
                    textAlign: "center",
                    borderTop: "1px solid var(--border-color)",
                    fontSize: 12,
                    color: "var(--text-secondary)",
                }}
            >
                © {new Date().getFullYear()} Craquepedia — Todos os direitos reservados.
            </footer>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
