"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, Loader2, ArrowRight, Dribbble, Target, Activity, Flame, Medal } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Sport } from "@/lib/supabase/types";

const SPORT_DESCRIPTIONS: Record<string, string> = {
    futebol: "Futebol de campo — clubes, seleções e categorias de base",
    natacao: "Natação competitiva — piscina curta e longa",
    "artes-marciais": "MMA, Jiu-Jitsu, Judô, Boxe e esportes de combate",
    volei: "Vôlei de quadra e praia — competições nacionais e regionais",
    basquete: "Basquete profissional — NBB e categorias de formação",
    atletismo: "Corridas, saltos, arremessos e provas combinadas",
    futsal: "Futsal competitivo — Liga Nacional e Ligas estaduais",
    corrida: "Corrida de rua, trail running e ultramaratonas",
};

// Fallback visual para garantir que os ícones do banco de dados (se não forem emojis) fiquem bonitos
const getFallbackIcon = (slug: string, color: string) => {
    const props = { size: 28, color, strokeWidth: 1.5 };
    switch (slug) {
        case 'futebol':
        case 'futsal':
            return <Dribbble {...props} />;
        case 'artes-marciais':
            return <Target {...props} />;
        case 'basquete':
        case 'volei':
            return <Activity {...props} />;
        case 'natacao':
        case 'corrida':
        case 'atletismo':
            return <Flame {...props} />;
        default:
            return <Medal {...props} />;
    }
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
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
            {/* Header Premium */}
            <header
                style={{
                    padding: "20px 48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
                    <div style={{ background: "linear-gradient(135deg, var(--primary-color), #4f46e5)", padding: 8, borderRadius: 10 }}>
                        <Trophy size={18} color="#fff" />
                    </div>
                    CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span>
                </div>
                <div style={{
                    fontSize: 13,
                    color: "var(--primary-color)",
                    fontWeight: 600,
                    background: "var(--bg-app)",
                    padding: "6px 16px",
                    borderRadius: 20,
                    border: "1px solid rgba(37, 99, 235, 0.1)"
                }}>
                    Cadastro de Atleta
                </div>
            </header>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "64px 24px",
                    maxWidth: 1000,
                    margin: "0 auto",
                    width: "100%",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 56, animation: "fadeUp 0.6s ease-out" }}>
                    <span style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        background: "#fff",
                        color: "var(--text-secondary)",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 16,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                    }}>
                        SEJA NOTADO PELOS CLUBES
                    </span>
                    <h1
                        style={{
                            fontSize: "clamp(32px, 5vw, 44px)",
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: "-1px",
                            marginBottom: 16,
                            color: "#0f172a",
                        }}
                    >
                        Qual é a sua modalidade?
                    </h1>
                    <p style={{
                        fontSize: "clamp(15px, 2vw, 17px)",
                        color: "#64748b",
                        maxWidth: 580,
                        margin: "0 auto",
                        lineHeight: 1.6
                    }}>
                        Preencha o formulário personalizado para o seu esporte,
                        monte seu portfólio e entre no radar de olheiros e treinadores.
                    </p>
                </div>

                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "var(--text-secondary)", padding: 60 }}>
                        <Loader2 size={32} color="var(--primary-color)" className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                        <span style={{ fontWeight: 500 }}>Carregando modalidades...</span>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: 24,
                            width: "100%",
                            animation: "fadeUp 0.8s ease-out"
                        }}
                    >
                        {sports.map((sport, idx) => (
                            <Link
                                key={sport.id}
                                href={`/cadastro/${sport.slug}`}
                                className="sport-card"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "28px",
                                    background: "#fff",
                                    borderRadius: 24,
                                    border: "1px solid rgba(0,0,0,0.04)",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                                    textDecoration: "none",
                                    color: "inherit",
                                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                                    cursor: "pointer",
                                    position: "relative",
                                    overflow: "hidden",
                                    animationDelay: `${idx * 0.05}s` // CSS Animation delay for stagger effect
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                                    <div
                                        style={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 16,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 26,
                                            background: `${sport.color}15`,
                                            color: sport.color,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {/* Verifica se o ícone é um emoji simples ou um texto gigante. Se for texto gigante, usa o fallback. */}
                                        {sport.icon && sport.icon.length <= 2 ? sport.icon : getFallbackIcon(sport.slug, sport.color)}
                                    </div>
                                    <div className="card-arrow" style={{
                                        width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        transition: "all 0.3s", color: "#64748b"
                                    }}>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                    <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{sport.name}</h3>
                                    <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5, flex: 1 }}>
                                        {SPORT_DESCRIPTIONS[sport.slug] || "Preencha seu currículo esportivo com todos os dados técnicos dessa modalidade."}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                <p
                    style={{
                        marginTop: 64,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center"
                    }}
                >
                    <Trophy size={14} /> Ao preencher o currículo, a equipe Craquepedia analisará seu perfil.
                </p>
            </main>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .sport-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 30px rgba(0,0,0,0.08) !important;
            border-color: rgba(37, 99, 235, 0.2) !important;
        }
        .sport-card:hover .card-arrow {
            background: var(--primary-color) !important;
            color: #fff !important;
            transform: scale(1.1) rotate(-45deg);
        }
      `}</style>
        </div>
    );
}
