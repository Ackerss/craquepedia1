"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, ArrowLeft, Loader2, Check, User, Phone, MapPin, Instagram, Activity, Dribbble, Target, Flame, Medal, ChevronRight, ChevronLeft, Send, Edit3, Eye, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Sport, SportField } from "@/lib/supabase/types";
import Link from "next/link";

const ESTADOS_BR = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const getFallbackIcon = (slug: string, color: string) => {
    const props = { size: 22, color, strokeWidth: 1.5 };
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

const STEPS = [
    { id: 1, label: "Dados Pessoais", icon: User },
    { id: 2, label: "Contato e Local", icon: MapPin },
    { id: 3, label: "Dados Esportivos", icon: Activity },
    { id: 4, label: "Revisão & Envio", icon: Eye },
];

export default function CadastroEsportePage() {
    const params = useParams();
    const router = useRouter();
    const sportSlug = params.sport as string;

    const [sport, setSport] = useState<Sport | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1);
    const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const [general, setGeneral] = useState({
        full_name: "",
        sport_nickname: "",
        birth_date: "",
        phone: "",
        email: "",
        city: "",
        state: "",
        instagram: "",
        outras_redes: "",
        responsavel: "",
        altura: "",
        peso: "",
        bio: "",
        historico_esportivo: "",
        conquistas: "",
        links_video: "",
    });

    const [sportData, setSportData] = useState<Record<string, string | number>>({});

    useEffect(() => {
        async function loadSport() {
            const { data, error } = await supabase
                .from("sports")
                .select("*")
                .eq("slug", sportSlug)
                .single();

            if (data && !error) {
                setSport(data);
                const initial: Record<string, string | number> = {};
                (data.specific_fields as SportField[]).forEach((f) => {
                    initial[f.key] = f.type === "number" ? 0 : "";
                });
                setSportData(initial);
            } else {
                router.push("/cadastro");
            }
            setLoading(false);
        }
        loadSport();
    }, [sportSlug, router]);

    const handleNextStep = () => {
        if (step === 1) {
            if (!general.full_name || !general.birth_date) {
                alert("Por favor, preencha o Nome Completo e a Data de Nascimento.");
                return;
            }
            if (general.full_name.trim().split(" ").length < 2) {
                alert("Por favor, informe seu Nome Completo real.");
                return;
            }
        } else if (step === 2) {
            if (!general.phone || !general.email || !general.city || !general.state) {
                alert("Por favor, preencha todos os campos obrigatórios (*).");
                return;
            }
        }
        setStep((s) => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePrevStep = () => {
        setStep((s) => s - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async () => {
        // Só permite enviar na etapa de revisão (step 4)
        if (step !== 4) return;
        if (!sport) return;
        setSubmitting(true);

        let photoUrl: string | null = null;

        // Upload da foto se fornecida
        if (photoFile) {
            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${Date.now()}_${general.full_name.replace(/\s+/g, '_')}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('athlete-photos')
                .upload(fileName, photoFile, { cacheControl: '3600', upsert: false });
            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('athlete-photos').getPublicUrl(fileName);
                photoUrl = urlData.publicUrl;
            }
        }

        const finalSportData = { ...sportData };
        Object.entries(multiSelections).forEach(([key, values]) => {
            finalSportData[key] = values.join(", ");
        });

        const { error } = await supabase.from("submissions").insert({
            sport_id: sport.id,
            sport_name: sport.name,
            full_name: general.full_name,
            sport_nickname: general.sport_nickname || null,
            email: general.email || null,
            phone: general.phone || null,
            birth_date: general.birth_date || null,
            city: general.city || null,
            state: general.state || null,
            general_data: {
                instagram: general.instagram,
                outras_redes: general.outras_redes,
                responsavel: general.responsavel,
                altura: general.altura,
                peso: general.peso,
                bio: general.bio,
                historico_esportivo: general.historico_esportivo,
                conquistas: general.conquistas,
                links_video: general.links_video,
            },
            sport_data: finalSportData,
            photo_url: photoUrl,
            status: "pendente",
        });

        setSubmitting(false);
        if (!error) {
            setSuccess(true);
        } else {
            alert("Ocorreu um erro ao enviar o seu cadastro. Por favor, tente novamente.");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <Loader2 size={40} color="var(--primary-color)" className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Carregando formulário...</span>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (success) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                <header style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(0,0,0,0.05)", background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)" }}>
                    <div style={{ background: "linear-gradient(135deg, var(--primary-color), #4f46e5)", padding: 6, borderRadius: 8 }}>
                        <Trophy size={16} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" }}>CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span></span>
                </header>
                <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                    <div style={{ textAlign: "center", maxWidth: 500, background: "#fff", padding: "56px 40px", borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.02)", animation: "fadeUp 0.6s ease-out" }}>
                        <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", boxShadow: "0 0 0 10px rgba(16, 185, 129, 0.05)" }}>
                            <Check size={44} color="#10b981" />
                        </div>
                        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, color: "#0f172a", letterSpacing: "-0.5px" }}>Tudo Certo!</h1>
                        <p style={{ fontSize: 16, color: "#64748b", lineHeight: 1.6, marginBottom: 40 }}>
                            O seu cadastro para <strong>{sport?.name}</strong> foi recebido com sucesso. Nossa equipe analisará o seu perfil esportivo e entraremos em contato assim que possível.
                        </p>
                        <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "16px", background: "var(--primary-color)", color: "#fff", borderRadius: 14, fontWeight: 700, fontSize: 16, transition: "all 0.2s", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)", textDecoration: "none" }}>
                            Voltar ao Início
                        </Link>
                    </div>
                </main>
                <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            </div>
        );
    }

    if (!sport) return null;

    const specificFields = sport.specific_fields as SportField[];

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "14px 18px", borderRadius: 14,
        border: "1.5px solid rgba(0,0,0,0.08)", fontSize: 15, fontFamily: "inherit",
        background: "#f8fafc", transition: "all 0.2s ease-out", outline: "none",
        color: "#0f172a", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.01)"
    };

    const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#475569", marginBottom: 8 };
    const sectionStyle: React.CSSProperties = { background: "#fff", borderRadius: 24, padding: "32px", marginBottom: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" };
    const sectionTitleStyle: React.CSSProperties = { fontSize: 20, fontWeight: 800, marginBottom: 28, color: "#0f172a", display: "flex", alignItems: "center", gap: 12, paddingBottom: 20, borderBottom: "1px solid rgba(0,0,0,0.04)" };
    const fieldGroupStyle: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 };

    const renderMultiSelect = (field: SportField) => {
        const selected = multiSelections[field.key] || [];
        return (
            <div>
                <label style={labelStyle}>{field.label}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {field.options?.map((opt) => (
                        <button
                            type="button" key={opt}
                            onClick={() => {
                                setMultiSelections((prev) => {
                                    const curr = prev[field.key] || [];
                                    if (curr.includes(opt)) return { ...prev, [field.key]: curr.filter((v) => v !== opt) };
                                    return { ...prev, [field.key]: [...curr, opt] };
                                });
                            }}
                            style={{
                                padding: "10px 18px", borderRadius: 10,
                                border: `1.5px solid ${selected.includes(opt) ? sport.color : "rgba(0,0,0,0.08)"}`,
                                background: selected.includes(opt) ? `${sport.color}15` : "#fff",
                                color: selected.includes(opt) ? sport.color : "#475569",
                                fontWeight: selected.includes(opt) ? 700 : 500, fontSize: 14, cursor: "pointer", transition: "all 0.2s",
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc" }}>
            <header style={{ padding: "20px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20, letterSpacing: "-0.5px" }}>
                    <div style={{ background: "linear-gradient(135deg, var(--primary-color), #4f46e5)", padding: 8, borderRadius: 10 }}>
                        <Trophy size={18} color="#fff" />
                    </div>
                    CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 20, background: `${sport.color}15`, color: sport.color, fontWeight: 700, fontSize: 14, border: `1px solid ${sport.color}30` }}>
                    <span>{sport.icon && sport.icon.length <= 2 ? sport.icon : getFallbackIcon(sport.slug, sport.color)}</span> {sport.name}
                </div>
            </header>

            <div style={{ padding: "40px 32px 32px 32px", background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.03)", marginBottom: "32px", overflowX: "auto" }}>
                <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", gap: 0, position: "relative", minWidth: 600 }}>
                    {STEPS.map((stepConfig, idx) => {
                        const StepIcon = stepConfig.icon;
                        const isActive = step === stepConfig.id;
                        const isDone = step > stepConfig.id;
                        return (
                            <div key={stepConfig.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 2 }}>
                                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                    {idx > 0 && <div style={{ flex: 1, height: 4, background: isDone || isActive ? sport.color : "rgba(0,0,0,0.05)", borderRadius: 2, transition: "all 0.4s", marginRight: 8, opacity: isDone || isActive ? 1 : 0.6 }} />}
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? sport.color : isActive ? sport.color : "#fff", color: isDone || isActive ? "#fff" : "#94a3b8", border: `2px solid ${isDone ? sport.color : isActive ? sport.color : "rgba(0,0,0,0.08)"}`, transition: "all 0.4s", flexShrink: 0, boxShadow: isActive ? `0 0 0 6px ${sport.color}15` : "none" }}>
                                        {isDone ? <Check size={20} strokeWidth={3} /> : <StepIcon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                                    </div>
                                    {idx < STEPS.length - 1 && <div style={{ flex: 1, height: 4, background: step > stepConfig.id ? sport.color : "rgba(0,0,0,0.05)", borderRadius: 2, transition: "all 0.4s", marginLeft: 8, opacity: step > stepConfig.id ? 1 : 0.6 }} />}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: isActive || isDone ? 700 : 500, color: isActive ? "#0f172a" : isDone ? sport.color : "#94a3b8", transition: "all 0.3s" }}>{stepConfig.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <main style={{ flex: 1, padding: "0 24px 64px 24px", maxWidth: 850, margin: "0 auto", width: "100%" }}>
                <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "#64748b", marginBottom: 32, fontWeight: 600, transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "var(--primary-color)"} onMouseOut={e => e.currentTarget.style.color = "#64748b"}>
                    <ArrowLeft size={16} /> Voltar à Seleção de Esporte
                </Link>

                <div>
                    {step === 1 && (
                        <div className="animate-fade-in">
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <div style={{ background: `${sport.color}15`, padding: 8, borderRadius: 10, color: sport.color }}><User size={22} /></div>
                                    Informações Pessoais
                                </h2>
                                <p style={{ color: "#64748b", marginBottom: 28, fontSize: 14, lineHeight: 1.5 }}>Esses são seus dados básicos de identificação que irão compor o seu perfil na plataforma.</p>
                                <div style={fieldGroupStyle}>
                                    <div>
                                        <label style={labelStyle}>Nome Completo *</label>
                                        <input style={inputStyle} value={general.full_name} onChange={(e) => setGeneral({ ...general, full_name: e.target.value })} placeholder="Como está no seu documento" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Nome Esportivo / Apelido</label>
                                        <input style={inputStyle} value={general.sport_nickname} onChange={(e) => setGeneral({ ...general, sport_nickname: e.target.value })} placeholder="Como você é conhecido no esporte" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Data de Nascimento *</label>
                                        <input style={inputStyle} type="date" value={general.birth_date} onChange={(e) => setGeneral({ ...general, birth_date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Nome do Responsável Legal</label>
                                        <input style={inputStyle} value={general.responsavel} onChange={(e) => setGeneral({ ...general, responsavel: e.target.value })} placeholder="(Apenas para menores de 18 anos)" />
                                    </div>
                                </div>

                                {/* Upload de Foto */}
                                <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                                    <label style={labelStyle}>Foto de Perfil</label>
                                    <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>Envie uma foto sua em ação ou de rosto para compor seu perfil profissional.</p>
                                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                        <div style={{ position: "relative", width: 90, height: 90, borderRadius: "50%", overflow: "hidden", background: "#f1f5f9", border: `2.5px dashed ${photoPreview ? sport.color : "rgba(0,0,0,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", transition: "all 0.2s" }} onClick={() => document.getElementById('photo-upload')?.click()}>
                                            {photoPreview ? (
                                                <img src={photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <Camera size={28} color="#94a3b8" />
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <button type="button" onClick={() => document.getElementById('photo-upload')?.click()} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: sport.color, background: `${sport.color}10`, border: `1.5px solid ${sport.color}25`, cursor: "pointer", transition: "all 0.2s" }}>
                                                {photoPreview ? "🔄 Trocar Foto" : "📷 Selecionar Foto"}
                                            </button>
                                            {photoFile && <p style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{photoFile.name} ({(photoFile.size / 1024).toFixed(0)} KB)</p>}
                                        </div>
                                        <input
                                            id="photo-upload"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            style={{ display: "none" }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        alert("A foto deve ter no máximo 5MB.");
                                                        return;
                                                    }
                                                    setPhotoFile(file);
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setPhotoPreview(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <div style={{ background: `${sport.color}15`, padding: 8, borderRadius: 10, color: sport.color }}><Phone size={22} /></div>
                                    Contato e Localização
                                </h2>
                                <p style={{ color: "#64748b", marginBottom: 28, fontSize: 14, lineHeight: 1.5 }}>Como nossa equipe e os olheiros poderão entrar em contato com você.</p>
                                <div style={fieldGroupStyle}>
                                    <div>
                                        <label style={labelStyle}>WhatsApp com DDD *</label>
                                        <input style={inputStyle} type="tel" value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} placeholder="(00) 00000-0000" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>E-mail *</label>
                                        <input style={inputStyle} type="email" value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} placeholder="seu.email@exemplo.com" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Cidade *</label>
                                        <input style={inputStyle} value={general.city} onChange={(e) => setGeneral({ ...general, city: e.target.value })} placeholder="Sua cidade atual" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Estado *</label>
                                        <select style={{ ...inputStyle, cursor: "pointer" }} value={general.state} onChange={(e) => setGeneral({ ...general, state: e.target.value })}>
                                            <option value="">Selecione o Estado</option>
                                            {ESTADOS_BR.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-fade-in">
                            {/* Mídia e Trajetória */}
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <div style={{ background: `${sport.color}15`, padding: 8, borderRadius: 10, color: sport.color }}><Instagram size={22} /></div>
                                    Mídia e Trajetória
                                </h2>
                                <p style={{ color: "#64748b", marginBottom: 28, fontSize: 14, lineHeight: 1.5 }}>Mostre um pouco de quem você é e do que você já conquistou.</p>
                                <div style={{ display: "grid", gap: 24 }}>
                                    <div style={fieldGroupStyle}>
                                        <div>
                                            <label style={labelStyle}>Instagram (Link ou @)</label>
                                            <input style={inputStyle} value={general.instagram} onChange={(e) => setGeneral({ ...general, instagram: e.target.value })} placeholder="@seuperfil" />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>Outras Redes (Tiktok, Site)</label>
                                            <input style={inputStyle} value={general.outras_redes} onChange={(e) => setGeneral({ ...general, outras_redes: e.target.value })} placeholder="Links adicionais" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Biografia Curta</label>
                                        <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={general.bio} onChange={(e) => setGeneral({ ...general, bio: e.target.value })} placeholder="Descreva de forma breve quem você é, seu estilo e seus objetivos no esporte..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Histórico de Clubes/Equipes</label>
                                        <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={general.historico_esportivo} onChange={(e) => setGeneral({ ...general, historico_esportivo: e.target.value })} placeholder="Quais equipes você já defendeu? (Liste-as aqui com os anos)" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Principais Conquistas e Títulos</label>
                                        <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={general.conquistas} onChange={(e) => setGeneral({ ...general, conquistas: e.target.value })} placeholder="Medalhas, troféus, convocações..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Links de Vídeos Relacionados</label>
                                        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={general.links_video} onChange={(e) => setGeneral({ ...general, links_video: e.target.value })} placeholder="Cole aqui os links (Youtube, Instagram...) dos seus destaques" />
                                    </div>
                                </div>
                            </div>

                            {/* Dados Técnicos + Altura/Peso */}
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <div style={{ background: `${sport.color}15`, padding: 8, borderRadius: 10, color: sport.color }}><Activity size={22} /></div>
                                    Dados Técnicos: {sport.name}
                                </h2>
                                <p style={{ color: "#64748b", marginBottom: 28, fontSize: 14, lineHeight: 1.5 }}>Detalhes físicos e táticos específicos da sua modalidade.</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24, marginBottom: 24 }}>
                                    <div>
                                        <label style={labelStyle}>Altura</label>
                                        <input style={inputStyle} value={general.altura} onChange={(e) => setGeneral({ ...general, altura: e.target.value })} placeholder="Ex: 1.80m" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Peso</label>
                                        <input style={inputStyle} value={general.peso} onChange={(e) => setGeneral({ ...general, peso: e.target.value })} placeholder="Ex: 75kg" />
                                    </div>
                                </div>
                                {specificFields.length > 0 && (
                                    <>
                                        <div style={{ height: "1px", background: "rgba(0,0,0,0.05)", margin: "32px 0" }} />
                                        <div style={fieldGroupStyle}>
                                            {specificFields.map((field) => {
                                                if (field.type === "select_multi") return <div key={field.key} style={{ gridColumn: "1 / -1" }}>{renderMultiSelect(field)}</div>;
                                                if (field.type === "select") {
                                                    return (
                                                        <div key={field.key}>
                                                            <label style={labelStyle}>{field.label}</label>
                                                            <select style={{ ...inputStyle, cursor: "pointer" }} value={sportData[field.key] || ""} onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })}>
                                                                <option value="">Selecione...</option>
                                                                {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                                            </select>
                                                        </div>
                                                    );
                                                }
                                                if (field.type === "textarea") {
                                                    return (
                                                        <div key={field.key} style={{ gridColumn: "1 / -1" }}>
                                                            <label style={labelStyle}>{field.label}</label>
                                                            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={sportData[field.key] || ""} onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })} placeholder="Sua resposta detalhada" />
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div key={field.key}>
                                                        <label style={labelStyle}>{field.label}</label>
                                                        <input style={inputStyle} type={field.type === "number" ? "number" : "text"} min={field.type === "number" ? "0" : undefined} value={sportData[field.key] || ""} onChange={(e) => setSportData({ ...sportData, [field.key]: field.type === "number" ? (e.target.value ? Number(e.target.value) : "") : e.target.value })} placeholder={field.type === "number" ? "0" : "Sua resposta..."} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-fade-in">
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <div style={{ background: `${sport.color}15`, padding: 8, borderRadius: 10, color: sport.color }}><Eye size={22} /></div>
                                    Revisão do Cadastro
                                </h2>
                                <p style={{ color: "#64748b", marginBottom: 28, fontSize: 14, lineHeight: 1.5 }}>
                                    Confira todos os dados antes de enviar. Se precisar corrigir algo, use o botão <strong>“Etapa Anterior”</strong> para voltar.
                                </p>

                                {/* Dados Pessoais */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>👤 Dados Pessoais</h3>
                                        <button type="button" onClick={() => setStep(1)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: sport.color, background: `${sport.color}10`, border: `1px solid ${sport.color}30`, borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}><Edit3 size={12} /> Editar</button>
                                    </div>
                                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                                        {photoPreview && (
                                            <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                                <img src={photoPreview} alt="Foto" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: `2px solid ${sport.color}` }} />
                                                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Foto de perfil selecionada</span>
                                            </div>
                                        )}
                                        {[
                                            ["Nome", general.full_name],
                                            ["Apelido", general.sport_nickname],
                                            ["Nascimento", general.birth_date],
                                            ["Responsável", general.responsavel],
                                        ].filter(([, v]) => v).map(([label, value]) => (
                                            <div key={label}><span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{label}</span><p style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{value}</p></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contato */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>📍 Contato e Local</h3>
                                        <button type="button" onClick={() => setStep(2)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: sport.color, background: `${sport.color}10`, border: `1px solid ${sport.color}30`, borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}><Edit3 size={12} /> Editar</button>
                                    </div>
                                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                                        {[
                                            ["WhatsApp", general.phone],
                                            ["E-mail", general.email],
                                            ["Cidade", general.city],
                                            ["Estado", general.state],
                                        ].filter(([, v]) => v).map(([label, value]) => (
                                            <div key={label}><span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{label}</span><p style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}>{value}</p></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mídia e Trajetória */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>📸 Mídia, Trajetória e Dados Técnicos</h3>
                                        <button type="button" onClick={() => setStep(3)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: sport.color, background: `${sport.color}10`, border: `1px solid ${sport.color}30`, borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}><Edit3 size={12} /> Editar</button>
                                    </div>
                                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                                        {[
                                            ["Instagram", general.instagram],
                                            ["Outras Redes", general.outras_redes],
                                            ["Altura", general.altura],
                                            ["Peso", general.peso],
                                            ["Biografia", general.bio],
                                            ["Histórico", general.historico_esportivo],
                                            ["Conquistas", general.conquistas],
                                            ["Vídeos", general.links_video],
                                            ...Object.entries(sportData).filter(([, v]) => v !== "" && v !== 0).map(([key, value]) => {
                                                const fieldDef = specificFields.find(f => f.key === key);
                                                return [fieldDef?.label || key, String(value)];
                                            }),
                                        ].filter(([, v]) => v).map(([label, value]) => (
                                            <div key={label} style={{ gridColumn: String(value).length > 50 ? "1 / -1" : undefined }}><span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{label}</span><p style={{ fontSize: 14, fontWeight: 500, color: "#0f172a", whiteSpace: "pre-wrap" }}>{value}</p></div>
                                        ))}
                                        {[general.instagram, general.outras_redes, general.altura, general.peso, general.bio, general.historico_esportivo, general.conquistas, general.links_video].every(v => !v) && Object.values(sportData).every(v => v === "" || v === 0) && (
                                            <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", gridColumn: "1 / -1" }}>Nenhum dado preenchido nesta seção (opcional).</p>
                                        )}
                                    </div>
                                </div>

                                {/* Alerta final */}
                                <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(59,130,246,0.05))", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(16,185,129,0.15)", display: "flex", alignItems: "center", gap: 14 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                        <Check size={20} color="#10b981" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>Tudo pronto para enviar!</p>
                                        <p style={{ fontSize: 13, color: "#64748b" }}>Ao clicar em <strong>"Enviar Cadastro"</strong>, seus dados serão enviados para a nossa equipe de análise.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginTop: 24, background: "#fff", padding: "20px 24px", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.03)" }}>
                        <button
                            type="button" onClick={handlePrevStep} disabled={step === 1}
                            style={{ padding: "14px 24px", background: step === 1 ? "#f8fafc" : "#fff", color: step === 1 ? "#cbd5e1" : "#475569", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: step === 1 ? "not-allowed" : "pointer", border: `1.5px solid ${step === 1 ? "#f1f5f9" : "rgba(0,0,0,0.06)"}`, display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}
                        >
                            <ChevronLeft size={18} /> Etapa Anterior
                        </button>
                        {step < 4 ? (
                            <button
                                type="button" onClick={handleNextStep}
                                style={{ padding: "14px 32px", background: sport.color, color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", border: "none", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s", boxShadow: `0 4px 14px ${sport.color}40` }}
                            >
                                Próxima Etapa <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="button" onClick={handleSubmit} disabled={submitting}
                                style={{ padding: "16px 48px", background: submitting ? "#94a3b8" : "linear-gradient(135deg, #10b981, #059669)", color: "#fff", borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: submitting ? "not-allowed" : "pointer", border: "none", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s", boxShadow: submitting ? "none" : "0 6px 20px rgba(16, 185, 129, 0.35)" }}
                            >
                                {submitting ? <><Loader2 size={20} className="animate-spin" /> Enviando...</> : <><Send size={20} /> Enviar Cadastro</>}
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        input:focus, textarea:focus, select:focus {
          border-color: ${sport?.color || "var(--primary-color)"} !important;
          box-shadow: 0 0 0 4px ${sport?.color || "var(--primary-color)"}20 !important;
          background: #fff !important;
        }
      `}</style>
        </div>
    );
}
