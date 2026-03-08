"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trophy, Loader2, ArrowRight, Star, Sparkles, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Sport } from "@/lib/supabase/types";

const SPORT_DESCRIPTIONS: Record<string, string> = {
    futebol: "Monte seu currículo esportivo completo com estatísticas de campo",
    natacao: "Registre seus tempos, provas e conquistas na piscina",
    "artes-marciais": "Documente sua graduação, lutas e conquistas nos tatames",
    volei: "Crie seu perfil com posição, estatísticas e torneios disputados",
    basquete: "Organize suas métricas, posição e trajetória nas quadras",
    atletismo: "Registre marcas pessoais, provas e competições",
    futsal: "Monte seu perfil com posição, clubes e histórico competitivo",
    corrida: "Documente seus tempos, distâncias e provas concluídas",
    handebol: "Organize posição, equipes e conquistas no handebol",
    ginastica: "Registre aparelhos, notas e competições da ginástica",
    tenis: "Documente ranking, torneios e evolução no tênis",
    ciclismo: "Registre distâncias, tempos e competições no ciclismo",
};

// Mapeamento de slug do esporte para o arquivo de imagem do Stitch
const SPORT_IMAGES: Record<string, string> = {
    futebol: "/sports/futebol.png",
    natacao: "/sports/natacao.png",
    "artes-marciais": "/sports/artes-marciais.png",
    volei: "/sports/volei.png",
    basquete: "/sports/basquete.png",
    atletismo: "/sports/atletismo.png",
    futsal: "/sports/futsal.png",
    corrida: "/sports/corrida.png",
    handebol: "/sports/handebol.png",
    ginastica: "/sports/ginastica.png",
    tenis: "/sports/tenis.png",
    ciclismo: "/sports/ciclismo.png",
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
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0a0a0f" }}>
            {/* Header Premium */}
            <header
                style={{
                    padding: "20px 48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(10, 10, 15, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px", color: "#fff" }}>
                    <div style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", padding: 8, borderRadius: 10 }}>
                        <Trophy size={18} color="#fff" />
                    </div>
                    CRAQUE<span style={{ color: "#3b82f6" }}>PEDIA</span>
                </div>
                <div style={{
                    fontSize: 12,
                    color: "#93c5fd",
                    fontWeight: 700,
                    background: "rgba(37, 99, 235, 0.1)",
                    padding: "6px 16px",
                    borderRadius: 20,
                    border: "1px solid rgba(37, 99, 235, 0.2)",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                }}>
                    Cadastro Profissional
                </div>
            </header>

            {/* Hero Section */}
            <section style={{
                textAlign: "center",
                padding: "80px 24px 60px",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Gradient orbs */}
                <div style={{ position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)", pointerEvents: "none" }}></div>

                <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", animation: "fadeUp 0.6s ease-out" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "8px 16px",
                        background: "rgba(37, 99, 235, 0.1)",
                        border: "1px solid rgba(37, 99, 235, 0.2)",
                        borderRadius: 24,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#93c5fd",
                        marginBottom: 24,
                        textTransform: "uppercase",
                        letterSpacing: "1.5px",
                    }}>
                        <Sparkles size={14} /> Profissionalize sua Carreira
                    </div>
                    <h1
                        style={{
                            fontSize: "clamp(34px, 5vw, 52px)",
                            fontWeight: 800,
                            lineHeight: 1.1,
                            letterSpacing: "-1.5px",
                            marginBottom: 20,
                            color: "#fff",
                        }}
                    >
                        Destaque-se no<br />
                        <span style={{
                            background: "linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>cenário esportivo</span>
                    </h1>
                    <p style={{
                        fontSize: "clamp(15px, 2vw, 18px)",
                        color: "#94a3b8",
                        maxWidth: 560,
                        margin: "0 auto",
                        lineHeight: 1.7
                    }}>
                        Crie seu currículo esportivo profissional, construa um portfólio de destaque
                        e leve sua carreira a outro nível. Selecione sua modalidade abaixo.
                    </p>

                    {/* Trust indicators */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 36, flexWrap: "wrap" }}>
                        {[
                            { icon: <Star size={14} />, text: "Currículo Profissional" },
                            { icon: <Shield size={14} />, text: "Portfólio Digital" },
                            { icon: <Trophy size={14} />, text: "Visibilidade Nacional" },
                        ].map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                                <span style={{ color: "#3b82f6" }}>{item.icon}</span>
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0 24px 80px",
                    maxWidth: 1100,
                    margin: "0 auto",
                    width: "100%",
                }}
            >
                <h2 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px", color: "#475569", marginBottom: 40, textAlign: "center" }}>
                    Selecione sua Modalidade
                </h2>

                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#94a3b8", padding: 60 }}>
                        <Loader2 size={32} color="#3b82f6" style={{ animation: "spin 1s linear infinite" }} />
                        <span style={{ fontWeight: 500 }}>Carregando modalidades...</span>
                    </div>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 20,
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
                                    background: "#13131a",
                                    borderRadius: 20,
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    textDecoration: "none",
                                    color: "inherit",
                                    transition: "all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)",
                                    cursor: "pointer",
                                    position: "relative",
                                    overflow: "hidden",
                                    animationDelay: `${idx * 0.05}s`
                                }}
                            >
                                {/* Imagem artística do Stitch */}
                                <div style={{
                                    width: "100%",
                                    height: 180,
                                    position: "relative",
                                    overflow: "hidden",
                                    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
                                }}>
                                    {SPORT_IMAGES[sport.slug] ? (
                                        <Image
                                            src={SPORT_IMAGES[sport.slug]}
                                            alt={`Arte ${sport.name}`}
                                            fill
                                            style={{ objectFit: "cover", opacity: 0.85, transition: "transform 0.5s, opacity 0.5s" }}
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                        />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
                                            {sport.icon && sport.icon.length <= 2 ? sport.icon : "🏆"}
                                        </div>
                                    )}
                                    {/* Gradient overlay */}
                                    <div style={{
                                        position: "absolute", bottom: 0, left: 0, right: 0, height: "60%",
                                        background: "linear-gradient(to top, #13131a, transparent)",
                                    }}></div>
                                </div>

                                {/* Conteúdo do card */}
                                <div style={{ padding: "20px 24px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{sport.name}</h3>
                                        <div className="card-arrow" style={{
                                            width: 32, height: 32, borderRadius: "50%",
                                            background: "rgba(59, 130, 246, 0.1)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all 0.3s", color: "#3b82f6",
                                            border: "1px solid rgba(59, 130, 246, 0.2)",
                                        }}>
                                            <ArrowRight size={14} />
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, flex: 1 }}>
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
                        color: "#475569",
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "center"
                    }}
                >
                    <Trophy size={14} color="#3b82f6" /> A equipe Craquepedia analisará seu perfil e criará materiais profissionais para sua carreira.
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
                    transform: translateY(-6px) scale(1.01);
                    box-shadow: 0 20px 40px rgba(37, 99, 235, 0.15) !important;
                    border-color: rgba(37, 99, 235, 0.3) !important;
                }
                .sport-card:hover img {
                    transform: scale(1.08) !important;
                    opacity: 1 !important;
                }
                .sport-card:hover .card-arrow {
                    background: #2563eb !important;
                    color: #fff !important;
                    transform: scale(1.1) rotate(-45deg);
                    border-color: transparent !important;
                }
            `}</style>
        </div>
    );
}
