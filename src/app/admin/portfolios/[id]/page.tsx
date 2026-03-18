"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Wand2, Eye } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { type Athlete, type AthleteService } from "@/lib/supabase/types";
import PortfolioEditor from "@/components/admin/PortfolioEditor";

export interface PortfolioData {
    hero: {
        avatarUrl: string;
        coverUrl: string;
        title: string;
        subtitle: string;
        quote: string;
        club: string;
    };
    professional_summary?: string;
    achievements?: Array<{ id: string; year: string; title: string; description?: string }>;
    contacts?: {
        instagram?: string;
        youtube?: string;
        phone?: string;
        email?: string;
    };
    gallery: Array<{ id: string; url: string; caption: string }>;
    videos: Array<{ id: string; url: string; title: string }>;
    history: Array<{ id: string; year: string; title: string; subtitle: string; description: string }>;
    attributes: Array<{ id: string; label: string; value: string }>;
    theme?: "default" | "pro-dark";
}

export default function PortfolioEditorPage() {
    const params = useParams();
    const router = useRouter();
    const athleteId = params.id as string;

    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [service, setService] = useState<AthleteService | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generated, setGenerated] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [portfolioData, setPortfolioData] = useState<PortfolioData>({
        hero: { avatarUrl: "", coverUrl: "", title: "", subtitle: "", quote: "", club: "" },
        professional_summary: "",
        achievements: [],
        contacts: { instagram: "", youtube: "", phone: "", email: "" },
        gallery: [],
        videos: [],
        history: [],
        attributes: [],
        theme: "default",
    });

    useEffect(() => {
        if (!isDirty) return;
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        async function load() {
            const [athleteRes, serviceRes] = await Promise.all([
                supabase.from("athletes").select("*").eq("id", athleteId).single(),
                supabase.from("athlete_services").select("*").eq("athlete_id", athleteId).eq("service_type", "portfolio").single(),
            ]);

            if (athleteRes.data) {
                setAthlete(athleteRes.data as Athlete);
                if (serviceRes.data?.data && Object.keys(serviceRes.data.data).length > 0) {
                    setPortfolioData(serviceRes.data.data as unknown as PortfolioData);
                    setGenerated(true);
                }
            }
            if (serviceRes.data) setService(serviceRes.data as AthleteService);
            setLoading(false);
        }
        load();
    }, [athleteId]);

    const generateFromAthlete = async () => {
        if (!athlete) return;
        setSaving(true);
        const gd = (athlete.general_data || {}) as Record<string, string>;
        const sd = (athlete.sport_data || {}) as Record<string, string>;
        
        // Helper to parse history/achievements strings into list
        const parseList = (text: string) => {
            if (!text) return [];
            return text.split('\n').map(s => s.trim()).filter(Boolean);
        };

        const conquistasList = parseList(gd.conquistas || "");
        const achievementsItems = conquistasList.map((c, i) => ({
            id: `gen-ach-${i}`,
            year: c.match(/^(\d{4})/) ? c.substring(0,4) : "",
            title: c.replace(/^(\d{4})[\s-:]*/, "").substring(0, 40) + (c.length > 40 ? "..." : ""),
            description: c
        }));

        const historicosList = parseList(gd.historico || "");
        const historyItems = historicosList.map((h, i) => ({
            id: `gen-hist-${i}`,
            year: h.match(/^(\d{4})/) ? h.substring(0,4) : "",
            title: h.replace(/^(\d{4})[\s-:]*/, "").split(' - ')[0] || "Clube/Time",
            subtitle: h.split(' - ')[1] || "",
            description: h
        }));

        const attrs = Object.entries(sd).filter(([k,v]) => v && k !== "posicao").map(([k,v], i) => ({
            id: `gen-attr-${i}`,
            label: k.replace(/_/g, " "),
            value: String(v)
        }));

        const newPortfolio: PortfolioData = {
            hero: {
                avatarUrl: athlete.photo_url || "",
                coverUrl: "",
                title: athlete.sport_nickname || athlete.full_name,
                subtitle: `${athlete.sport_name}${sd.posicao ? ` • ${sd.posicao}` : ""}`,
                quote: gd.bio?.substring(0, 150) || "",
                club: athlete.city || "", // Or any club field if it exists
            },
            professional_summary: gd.bio || "",
            achievements: achievementsItems,
            contacts: {
                instagram: gd.instagram || "",
                youtube: gd.youtube || "",
                phone: athlete.phone || "",
                email: athlete.email || ""
            },
            gallery: athlete.photo_url ? [{ id: "gen-img-1", url: athlete.photo_url, caption: "Foto de Perfil" }] : [],
            videos: gd.links_video ? [{ id: "gen-vid-1", url: gd.links_video, title: "Vídeo Destacado" }] : [],
            history: historyItems,
            attributes: attrs,
            theme: "default",
        };

        setPortfolioData(newPortfolio);
        setGenerated(true);
        setIsDirty(false); // Saved directly below
        
        if (service) {
            await supabase
                .from("athlete_services")
                .update({
                    data: newPortfolio as unknown as Record<string, unknown>,
                    status: "em_andamento",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", service.id);
            setService({ ...service, status: "em_andamento" });
        }
        setSaving(false);
    };

    const savePortfolio = async (status: "em_andamento" | "concluido" = "em_andamento") => {
        setSaving(true);
        if (service) {
            await supabase
                .from("athlete_services")
                .update({
                    data: portfolioData as unknown as Record<string, unknown>,
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", service.id);
            setIsDirty(false);
            setService({ ...service, status });
        }
        setSaving(false);
    };

    const handleGenerateBio = () => {
        if (!athlete) return;
        const gd = (athlete.general_data || {}) as Record<string, string>;
        const sd = (athlete.sport_data || {}) as Record<string, string>;
        
        const years = gd.tempo_treino || gd.anos_experiencia ? `mais de ${(gd.tempo_treino || gd.anos_experiencia)} de experiência` : "vasta trajetória";
        const historyText = gd.conquistas ? "colecionando títulos expressivos e reconhecimento" : "sempre mantendo o foco em resultados reais";
        
        const bioText = `${athlete.sport_nickname || athlete.full_name} é um verdadeiro destaque no cenário de ${athlete.sport_name}. Atuando estrategicamente como ${sd.posicao || "atleta profissional"}, possui ${years}, ${historyText}. Este portfólio reflete a dedicação, a excelência técnica e o comprometimento absoluto com a alta performance.`;
        
        setPortfolioData(prev => ({
            ...prev,
            hero: { ...prev.hero, quote: bioText }
        }));
        setIsDirty(true);
    };

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Carregando...
            </div>
        );
    }

    if (!athlete) {
        return (
            <div style={{ padding: 48, textAlign: "center" }}>
                <p>Atleta não encontrado.</p>
                <Link href="/admin/portfolios" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Voltar</Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }} className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <Link href="/admin/portfolios" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--primary-color)", marginBottom: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1.5px solid var(--primary-color)", background: "rgba(37,99,235,0.06)", textDecoration: "none" }}>
                        <ArrowLeft size={16} /> ← Voltar a Portfólios
                    </Link>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                        🎨 Editor de Portfólio — {athlete.sport_nickname || athlete.full_name}
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                        Molde a apresentação pública deste atleta.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!generated ? (
                        <button onClick={generateFromAthlete} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg, var(--primary-color), #7c3aed)", color: "#fff", border: "none", cursor: "pointer" }}>
                            <Wand2 size={16} /> Gerar Base Automática
                        </button>
                    ) : (
                        <>
                            <button onClick={() => window.open(`/p/${athleteId}`, "_blank")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1.5px solid var(--border-color)", background: "#fff", cursor: "pointer" }}>
                                <Eye size={16} /> Ver Publicado
                            </button>
                            <button onClick={() => savePortfolio("em_andamento")} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1.5px solid var(--border-color)", background: "#fff", cursor: "pointer" }}>
                                <Save size={16} /> {saving ? "Aguarde..." : "Salvar Rascunho"}
                            </button>
                            <button onClick={() => savePortfolio("concluido")} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "#10b981", color: "#fff", border: "none", cursor: "pointer" }}>
                                ✅ Finalizar e Publicar
                            </button>
                        </>
                    )}
                </div>
            </div>

            {!generated ? (
                <div style={{ background: "#fff", borderRadius: 16, border: "2px dashed var(--border-color)", padding: 48, textAlign: "center" }}>
                    <Wand2 size={48} color="var(--primary-color)" style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Vazio por aqui!</h2>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
                        Comece gerando os dados automaticamente usando as tabelas e respostas de cadastro do atleta. Depois você pode melhorar fotos, textos e blocos manualmente.
                    </p>
                    <button onClick={generateFromAthlete} style={{ padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: "linear-gradient(135deg, var(--primary-color), #7c3aed)", color: "#fff", border: "none", cursor: "pointer" }}>
                        <Wand2 size={20} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />
                        Iniciar com Dados do Atleta
                    </button>
                </div>
            ) : (
                <PortfolioEditor 
                    data={portfolioData} 
                    onChange={(newData) => { setPortfolioData(newData); setIsDirty(true); }} 
                    onGenerateBio={handleGenerateBio}
                />
            )}
        </div>
    );
}
