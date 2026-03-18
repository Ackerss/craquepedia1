"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, Play, Trophy, MapPin, Instagram, Youtube, User, Activity, FileText, Phone, Mail, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { type Athlete } from "@/lib/supabase/types";
import type { PortfolioData } from "../../admin/portfolios/[id]/page";
import Link from "next/link";

// Cores baseadas em esportes
const SPORT_COLORS: Record<string, string> = {
    "Futebol": "#10b981", "Futsal": "#3b82f6", "Vôlei": "#f59e0b",
    "Basquete": "#f97316", "Tênis": "#8b5cf6", "MMA/Lutas": "#ef4444",
    "Natação": "#06b6d4", "Atletismo": "#84cc16", "Judô": "#eab308",
};

export default function PortfolioPublicPage() {
    const params = useParams();
    const athleteId = params.id as string;

    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [accentColor, setAccentColor] = useState("#3b82f6");

    useEffect(() => {
        async function load() {
            const [athleteRes, serviceRes] = await Promise.all([
                supabase.from("athletes").select("*").eq("id", athleteId).single(),
                supabase.from("athlete_services").select("data").eq("athlete_id", athleteId).eq("service_type", "portfolio").single(),
            ]);

            if (athleteRes.data) {
                setAthlete(athleteRes.data as Athlete);
                // Busca a cor pelo esporte (case insensível)
                const sportName = athleteRes.data.sport_name;
                const matchColor = Object.entries(SPORT_COLORS).find(([k]) => k.toLowerCase() === sportName?.toLowerCase());
                if (matchColor) setAccentColor(matchColor[1]);
            }
            if (serviceRes.data?.data) {
                setPortfolio(serviceRes.data.data as unknown as PortfolioData);
            }
            setLoading(false);
        }
        load();
    }, [athleteId]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#020617", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!portfolio || !athlete || Object.keys(portfolio).length === 0 || !portfolio.hero) {
        return (
            <div style={{ minHeight: "100vh", background: "#020617", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#f8fafc" }}>
                <Activity size={48} color="#475569" style={{ marginBottom: 16 }} />
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Portfólio Indisponível</h1>
                <p style={{ color: "#94a3b8" }}>Este atleta ainda não possui um portfólio digital publicado ou os dados estão vazios.</p>
            </div>
        );
    }

    const { hero, attributes = [], history = [], gallery = [], videos = [], theme = "default", professional_summary, achievements = [], contacts } = portfolio;
    const isPro = theme === "pro-dark";

    return (
        <div style={{
            minHeight: "100vh",
            background: "#020617",
            color: "#f8fafc",
            fontFamily: "Inter, system-ui, sans-serif",
            overflowX: "hidden"
        }}>
            {/* HERÓI PRINCIPAL */}
            <section style={{
                position: "relative",
                minHeight: "80vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "80px 20px",
                background: hero.coverUrl ? `linear-gradient(to bottom, rgba(2,6,23,0.3), #020617), url(${hero.coverUrl}) center/cover no-repeat` : "#020617"
            }}>
                {/* Overlay Gradient Animado se não houver cover */}
                {!hero.coverUrl && (
                    <div style={{
                        position: "absolute", inset: 0,
                        background: `radial-gradient(circle at center, ${accentColor}15 0%, transparent 60%)`,
                        opacity: 0.8,
                        zIndex: 0
                    }} />
                )}

                <div style={{
                    position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto",
                    display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
                }}>
                    <div style={{
                        width: 140, height: 140, borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))",
                        backdropFilter: "blur(10px)",
                        border: `2px solid ${accentColor}50`,
                        overflow: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: 24,
                        boxShadow: `0 0 40px ${accentColor}30`,
                    }}>
                        {hero.avatarUrl ? (
                            <img src={hero.avatarUrl} alt={hero.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <User size={60} color={accentColor} />
                        )}
                    </div>
                    
                    <div style={{
                        display: "inline-block", padding: "6px 16px", borderRadius: 30,
                        background: `${accentColor}1A`, border: `1px solid ${accentColor}40`,
                        color: accentColor, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2,
                        marginBottom: 16
                    }}>
                        {hero.subtitle}
                    </div>

                    <h1 style={{
                        fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900,
                        lineHeight: 1.1, marginBottom: 24, letterSpacing: "-1px",
                        background: `linear-gradient(to right, #ffffff, ${accentColor}dd)`,
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                    }}>
                        {hero.title}
                    </h1>

                    {hero.club && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 16, marginBottom: 32 }}>
                            <MapPin size={18} color={accentColor} /> {hero.club}
                        </div>
                    )}

                    {hero.quote && (
                        <p style={{
                            fontSize: "clamp(16px, 2vw, 20px)", color: "#cbd5e1", maxWidth: 700,
                            lineHeight: 1.6, fontStyle: "italic", fontWeight: 300,
                            borderLeft: `3px solid ${accentColor}`, paddingLeft: 20, textAlign: "left"
                        }}>
                            "{hero.quote}"
                        </p>
                    )}

                    {/* REDES SOCIAIS E CONTATOS (HERO) */}
                    {contacts && (contacts.phone || contacts.email || contacts.instagram || contacts.youtube) && (
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 32 }}>
                            {contacts.phone && (() => {
                                const digits = contacts.phone.replace(/\D/g, "");
                                const whatsNum = digits.startsWith("55") ? digits : (digits.length >= 10 ? "55" + digits : digits);
                                return (
                                    <a href={`https://wa.me/${whatsNum}`} target="_blank" rel="noopener noreferrer" style={{ cursor: "pointer", padding: "10px 20px", borderRadius: 30, background: "#25D366", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 8, transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                                        <Phone size={16} /> Falar no WhatsApp
                                    </a>
                                );
                            })()}
                            {contacts.email && (
                                <a href={`mailto:${contacts.email}`} style={{ cursor: "pointer", padding: "10px 20px", borderRadius: 30, background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8, transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                                    <Mail size={16} /> E-mail
                                </a>
                            )}
                            {contacts.instagram && (
                                <a href={`https://instagram.com/${contacts.instagram.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{ cursor: "pointer", padding: "10px 20px", borderRadius: 30, background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8, transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                                    <Instagram size={16} /> Instagram
                                </a>
                            )}
                            {contacts.youtube && (
                                <a href={contacts.youtube} target="_blank" rel="noopener noreferrer" style={{ cursor: "pointer", padding: "10px 20px", borderRadius: 30, background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 8, transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"} onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                                    <Youtube size={16} /> Vídeos
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* CONTEÚDO */}
            <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px" }}>
                
                {/* RESUMO PROFISSIONAL */}
                {professional_summary && (
                    <section style={{ marginBottom: 80, maxWidth: 900, margin: "0 auto 80px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, justifyContent: "center" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor }}>
                                <FileText size={20} />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Perfil do Atleta</h2>
                        </div>
                        <p style={{
                            fontSize: "clamp(16px, 2vw, 18px)", color: "#e2e8f0",
                            lineHeight: 1.8, textAlign: "justify", whiteSpace: "pre-wrap",
                            background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                            padding: 32, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)"
                        }}>
                            {professional_summary}
                        </p>
                    </section>
                )}

                {/* ATRIBUTOS */}
                {attributes && attributes.length > 0 && (
                    <section style={{ marginBottom: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor }}>
                                <Activity size={20} />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Raio-X Técnico</h2>
                        </div>
                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16
                        }}>
                            {attributes.map(attr => (
                                <div key={attr.id} style={{
                                    background: isPro ? `${accentColor}08` : "rgba(255,255,255,0.02)", 
                                    border: isPro ? `1px solid ${accentColor}30` : "1px solid rgba(255,255,255,0.05)",
                                    boxShadow: isPro ? `0 4px 20px ${accentColor}10` : "none",
                                    borderRadius: 16, padding: 24, transition: "transform 0.3s, background 0.3s, box-shadow 0.3s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; if(isPro) { e.currentTarget.style.background = `${accentColor}15`; e.currentTarget.style.boxShadow = `0 8px 30px ${accentColor}25`; } else { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; } }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "none"; if(isPro) { e.currentTarget.style.background = `${accentColor}08`; e.currentTarget.style.boxShadow = `0 4px 20px ${accentColor}10`; } else { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; } }}>
                                    <div style={{ fontSize: 12, color: isPro ? accentColor : "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>{attr.label}</div>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc" }}>{attr.value}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* VÍDEOS */}
                {videos && videos.length > 0 && (
                    <section style={{ marginBottom: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor }}>
                                <Play size={20} fill="currentColor" />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Highlights</h2>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                            {videos.map(vid => {
                                // Simple YouTube embed extraction
                                let embedUrl = vid.url || "";
                                if (embedUrl.includes("youtube.com/watch?v=")) embedUrl = embedUrl.replace("watch?v=", "embed/");
                                else if (embedUrl.includes("youtu.be/")) embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");

                                return (
                                    <div key={vid.id} style={{
                                        background: "rgba(255,255,255,0.02)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)"
                                    }}>
                                        <div style={{ aspectRatio: "16/9", background: "#000" }}>
                                            <iframe src={embedUrl} width="100%" height="100%" frameBorder="0" allowFullScreen style={{ border: "none" }}></iframe>
                                        </div>
                                        {vid.title && <div style={{ padding: "16px 20px", fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{vid.title}</div>}
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* CONQUISTAS */}
                {achievements && achievements.length > 0 && (
                    <section style={{ marginBottom: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor }}>
                                <Trophy size={20} />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Conquistas e Títulos</h2>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                            {achievements.map((ach) => (
                                <div key={ach.id} style={{ display: "flex", gap: 16, background: isPro ? `${accentColor}08` : "rgba(255,255,255,0.02)", padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", transition: "0.2s", boxShadow: isPro ? `0 4px 15px ${accentColor}10` : "none" }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; if(isPro) e.currentTarget.style.background = `${accentColor}1A`; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; if(isPro) e.currentTarget.style.background = `${accentColor}08`; }}>
                                    {ach.year && (
                                        <div style={{ width: 48, height: 48, borderRadius: 10, background: `${accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor, fontWeight: 800, fontSize: 13, flexShrink: 0, border: `1px solid ${accentColor}30` }}>
                                            {ach.year}
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", marginBottom: 6 }}>{ach.title}</h3>
                                        {ach.description && <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.5 }}>{ach.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* HISTÓRICO / CARREIRA */}
                {history && history.length > 0 && (
                    <section style={{ marginBottom: 80 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accentColor}20`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor }}>
                                <Clock size={20} />
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Trajetória</h2>
                        </div>
                        <div style={{ position: "relative", paddingLeft: 24 }}>
                            {/* Linha vertical */}
                            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.1)", borderRadius: 2 }} />
                            
                            {history.map((item, idx) => (
                                <div key={item.id} style={{ position: "relative", paddingBottom: idx === history.length - 1 ? 0 : 40 }}>
                                    {/* Bolinha */}
                                    <div style={{ position: "absolute", left: -31, top: 4, width: 14, height: 14, borderRadius: "50%", background: isPro ? accentColor : "#020617", border: `3px solid ${accentColor}`, boxShadow: isPro ? `0 0 12px ${accentColor}` : "none", transition: "0.3s" }} />
                                    
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                                            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc" }}>{item.title}</h3>
                                            {(item.year || item.subtitle) && (
                                                <span style={{ fontSize: 13, color: accentColor, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: `${accentColor}20` }}>
                                                    {item.year}{item.year && item.subtitle ? " • " : ""}{item.subtitle}
                                                </span>
                                            )}
                                        </div>
                                        {item.description && <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.6, marginTop: 8 }}>{item.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* GALERIA */}
                {gallery && gallery.length > 0 && (
                    <section style={{ marginBottom: 80 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Galeria de Ação</h2>
                        <style>{`
                            .portfolio-masonry { column-count: 1; column-gap: 16px; }
                            @media (min-width: 640px) { .portfolio-masonry { column-count: 2; } }
                            @media (min-width: 1024px) { .portfolio-masonry { column-count: 3; } }
                            .portfolio-masonry-item {
                                break-inside: avoid; margin-bottom: 16px; border-radius: 16px;
                                overflow: hidden; position: relative;
                                border: 1px solid rgba(255,255,255,0.05); background: #0f172a;
                                transition: transform 0.3s, box-shadow 0.3s;
                            }
                            .portfolio-masonry-item:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.5); }
                        `}</style>
                        <div className="portfolio-masonry">
                            {gallery.map(img => (
                                <div key={img.id} className="portfolio-masonry-item">
                                    <img src={img.url} alt={img.caption || "Foto do atleta"} style={{ width: "100%", display: "block", objectFit: "cover" }} />
                                    {img.caption && (
                                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "30px 16px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.9))", fontSize: 13, fontWeight: 600, color: "#fff" }}>
                                            {img.caption}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </main>

            {/* FOOTER */}
            <footer style={{
                borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px 24px", textAlign: "center", color: "#64748b"
            }}>
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
                    {typeof (athlete.general_data as Record<string, unknown>)?.instagram === 'string' && (
                        <a href={`https://instagram.com/${((athlete.general_data as Record<string, unknown>).instagram as string).replace("@","")}`} target="_blank" rel="noreferrer" style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f8fafc", transition: "0.2s" }} onMouseEnter={e=>e.currentTarget.style.background=accentColor} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                            <Instagram size={20} />
                        </a>
                    )}
                </div>
                <p style={{ fontSize: 13, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                    Powered by <Link href="/" style={{ color: "#3b82f6", textDecoration: "none" }}>CRAQUEPEDIA</Link>
                </p>
            </footer>
        </div>
    );
}
