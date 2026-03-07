"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, ArrowLeft, Loader2, Check, User, Phone, Mail, MapPin, Calendar, Instagram, FileText, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Sport, SportField } from "@/lib/supabase/types";
import Link from "next/link";

const ESTADOS_BR = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function CadastroEsportePage() {
    const params = useParams();
    const router = useRouter();
    const sportSlug = params.sport as string;

    const [sport, setSport] = useState<Sport | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [step, setStep] = useState(1); // 1 = dados pessoais, 2 = dados do esporte
    const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});

    // Form data
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
                // Initialize sport-specific fields
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sport) return;
        setSubmitting(true);

        // Merge multi-select values into sportData
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
            status: "pendente",
        });

        setSubmitting(false);
        if (!error) {
            setSuccess(true);
        } else {
            alert("Erro ao enviar formulário. Tente novamente.");
            console.error(error);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (success) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <header style={{ padding: "16px 32px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--border-color)", background: "#fff" }}>
                    <Trophy size={22} color="var(--primary-color)" />
                    <span style={{ fontWeight: 700, fontSize: 18 }}>CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span></span>
                </header>
                <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
                    <div style={{ textAlign: "center", maxWidth: 480, background: "#fff", padding: 48, borderRadius: 20, boxShadow: "var(--shadow-lg)" }}>
                        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                            <Check size={36} color="#10b981" />
                        </div>
                        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Cadastro Enviado!</h1>
                        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 32 }}>
                            Seus dados foram recebidos com sucesso. Nossa equipe vai analisar seu perfil e entrará em contato pelo WhatsApp em breve.
                        </p>
                        <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "var(--primary-color)", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>
                            Voltar ao início
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    if (!sport) return null;

    const specificFields = sport.specific_fields as SportField[];

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "12px 16px",
        borderRadius: 10,
        border: "1.5px solid var(--border-color)",
        fontSize: 14,
        fontFamily: "inherit",
        background: "#fafbfc",
        transition: "all 0.2s",
        outline: "none",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-primary)",
        marginBottom: 6,
    };

    const sectionStyle: React.CSSProperties = {
        marginBottom: 32,
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 16,
        paddingBottom: 8,
        borderBottom: "2px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        gap: 8,
    };

    const fieldGroupStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
    };

    const renderMultiSelect = (field: SportField) => {
        const selected = multiSelections[field.key] || [];
        return (
            <div>
                <label style={labelStyle}>{field.label}</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {field.options?.map((opt) => (
                        <button
                            type="button"
                            key={opt}
                            onClick={() => {
                                setMultiSelections((prev) => {
                                    const curr = prev[field.key] || [];
                                    if (curr.includes(opt)) {
                                        return { ...prev, [field.key]: curr.filter((v) => v !== opt) };
                                    }
                                    return { ...prev, [field.key]: [...curr, opt] };
                                });
                            }}
                            style={{
                                padding: "8px 16px",
                                borderRadius: 8,
                                border: `1.5px solid ${selected.includes(opt) ? sport.color : "var(--border-color)"}`,
                                background: selected.includes(opt) ? `${sport.color}15` : "#fff",
                                color: selected.includes(opt) ? sport.color : "var(--text-primary)",
                                fontWeight: selected.includes(opt) ? 600 : 400,
                                fontSize: 13,
                                cursor: "pointer",
                                transition: "all 0.2s",
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
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <header style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 18 }}>
                    <Trophy size={22} color="var(--primary-color)" />
                    CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, background: `${sport.color}15`, color: sport.color, fontWeight: 600, fontSize: 14 }}>
                    <span>{sport.icon}</span> {sport.name}
                </div>
            </header>

            {/* Progress Bar */}
            <div style={{ padding: "0 32px", background: "#fff", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", gap: 0, padding: "16px 0" }}>
                    {["Dados Pessoais", "Dados do Esporte"].map((label, idx) => {
                        const stepNum = idx + 1;
                        const isActive = step === stepNum;
                        const isDone = step > stepNum;
                        return (
                            <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
                                    {idx > 0 && (
                                        <div style={{ flex: 1, height: 3, background: isDone || isActive ? sport.color : "var(--border-color)", borderRadius: 2, transition: "all 0.3s" }} />
                                    )}
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 13,
                                            fontWeight: 700,
                                            background: isDone ? sport.color : isActive ? sport.color : "var(--border-color)",
                                            color: isDone || isActive ? "#fff" : "var(--text-secondary)",
                                            transition: "all 0.3s",
                                            flexShrink: 0,
                                        }}
                                    >
                                        {isDone ? <Check size={16} /> : stepNum}
                                    </div>
                                    {idx < 1 && (
                                        <div style={{ flex: 1, height: 3, background: step > 1 ? sport.color : "var(--border-color)", borderRadius: 2, transition: "all 0.3s" }} />
                                    )}
                                </div>
                                <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? sport.color : "var(--text-secondary)" }}>{label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form */}
            <main style={{ flex: 1, padding: "32px 24px", maxWidth: 750, margin: "0 auto", width: "100%" }}>
                <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", marginBottom: 24, fontWeight: 500 }}>
                    <ArrowLeft size={16} /> Voltar à seleção de modalidade
                </Link>

                <form onSubmit={handleSubmit}>
                    {step === 1 && (
                        <div className="animate-fade-in">
                            {/* Dados Pessoais */}
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <User size={18} color={sport.color} /> Informações Pessoais
                                </h2>
                                <div style={fieldGroupStyle}>
                                    <div>
                                        <label style={labelStyle}>Nome Completo *</label>
                                        <input style={inputStyle} required value={general.full_name} onChange={(e) => setGeneral({ ...general, full_name: e.target.value })} placeholder="Seu nome completo" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Nome Esportivo</label>
                                        <input style={inputStyle} value={general.sport_nickname} onChange={(e) => setGeneral({ ...general, sport_nickname: e.target.value })} placeholder="Como é conhecido no esporte" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Data de Nascimento *</label>
                                        <input style={inputStyle} type="date" required value={general.birth_date} onChange={(e) => setGeneral({ ...general, birth_date: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Altura</label>
                                        <input style={inputStyle} value={general.altura} onChange={(e) => setGeneral({ ...general, altura: e.target.value })} placeholder="Ex: 1.80m" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Peso</label>
                                        <input style={inputStyle} value={general.peso} onChange={(e) => setGeneral({ ...general, peso: e.target.value })} placeholder="Ex: 75kg" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Nome do Responsável (se menor)</label>
                                        <input style={inputStyle} value={general.responsavel} onChange={(e) => setGeneral({ ...general, responsavel: e.target.value })} placeholder="Se menor de 18 anos" />
                                    </div>
                                </div>
                            </div>

                            {/* Contato */}
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <Phone size={18} color={sport.color} /> Contato
                                </h2>
                                <div style={fieldGroupStyle}>
                                    <div>
                                        <label style={labelStyle}>WhatsApp com DDD *</label>
                                        <input style={inputStyle} type="tel" required value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} placeholder="(00) 00000-0000" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>E-mail *</label>
                                        <input style={inputStyle} type="email" required value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} placeholder="seuemail@email.com" />
                                    </div>
                                </div>
                            </div>

                            {/* Localização */}
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <MapPin size={18} color={sport.color} /> Localização
                                </h2>
                                <div style={fieldGroupStyle}>
                                    <div>
                                        <label style={labelStyle}>Cidade *</label>
                                        <input style={inputStyle} required value={general.city} onChange={(e) => setGeneral({ ...general, city: e.target.value })} placeholder="Sua cidade" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Estado *</label>
                                        <select style={inputStyle} required value={general.state} onChange={(e) => setGeneral({ ...general, state: e.target.value })}>
                                            <option value="">Selecione...</option>
                                            {ESTADOS_BR.map((uf) => (
                                                <option key={uf} value={uf}>{uf}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Redes Sociais */}
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <Instagram size={18} color={sport.color} /> Redes Sociais
                                </h2>
                                <div style={fieldGroupStyle}>
                                    <div>
                                        <label style={labelStyle}>Instagram</label>
                                        <input style={inputStyle} value={general.instagram} onChange={(e) => setGeneral({ ...general, instagram: e.target.value })} placeholder="@seuinstagram" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Outras redes / portfólio</label>
                                        <input style={inputStyle} value={general.outras_redes} onChange={(e) => setGeneral({ ...general, outras_redes: e.target.value })} placeholder="YouTube, TikTok, site pessoal..." />
                                    </div>
                                </div>
                            </div>

                            {/* Biografia */}
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <FileText size={18} color={sport.color} /> Sobre Você
                                </h2>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Biografia Curta</label>
                                    <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={general.bio} onChange={(e) => setGeneral({ ...general, bio: e.target.value })} placeholder="Conte um pouco sobre sua trajetória esportiva..." />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Histórico Esportivo</label>
                                    <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={general.historico_esportivo} onChange={(e) => setGeneral({ ...general, historico_esportivo: e.target.value })} placeholder="Clubes, equipes, seleções que participou..." />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={labelStyle}>Principais Conquistas</label>
                                    <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={general.conquistas} onChange={(e) => setGeneral({ ...general, conquistas: e.target.value })} placeholder="Títulos, medalhas, prêmios..." />
                                </div>
                                <div>
                                    <label style={labelStyle}>Links de Vídeo</label>
                                    <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={general.links_video} onChange={(e) => setGeneral({ ...general, links_video: e.target.value })} placeholder="Cole links de YouTube, Instagram, etc." />
                                </div>
                            </div>

                            {/* Botão próximo */}
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!general.full_name || !general.phone || !general.email || !general.city || !general.state || !general.birth_date) {
                                            alert("Preencha todos os campos obrigatórios (*) antes de continuar.");
                                            return;
                                        }
                                        setStep(2);
                                        window.scrollTo(0, 0);
                                    }}
                                    style={{
                                        padding: "14px 32px",
                                        background: sport.color,
                                        color: "#fff",
                                        borderRadius: 10,
                                        fontWeight: 700,
                                        fontSize: 15,
                                        cursor: "pointer",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        transition: "all 0.2s",
                                    }}
                                >
                                    Próximo: Dados do Esporte →
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-fade-in">
                            {/* Campos específicos do esporte */}
                            <div style={sectionStyle}>
                                <h2 style={sectionTitleStyle}>
                                    <Activity size={18} color={sport.color} />
                                    <span>{sport.icon}</span> Dados de {sport.name}
                                </h2>
                                <div style={fieldGroupStyle}>
                                    {specificFields.map((field) => {
                                        if (field.type === "select_multi") {
                                            return <div key={field.key} style={{ gridColumn: "1 / -1" }}>{renderMultiSelect(field)}</div>;
                                        }

                                        if (field.type === "select") {
                                            return (
                                                <div key={field.key}>
                                                    <label style={labelStyle}>{field.label}</label>
                                                    <select
                                                        style={inputStyle}
                                                        value={sportData[field.key] || ""}
                                                        onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })}
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {field.options?.map((opt) => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        }

                                        if (field.type === "textarea") {
                                            return (
                                                <div key={field.key} style={{ gridColumn: "1 / -1" }}>
                                                    <label style={labelStyle}>{field.label}</label>
                                                    <textarea
                                                        style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                                                        value={sportData[field.key] || ""}
                                                        onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })}
                                                        placeholder={`Preencha ${field.label.toLowerCase()}`}
                                                    />
                                                </div>
                                            );
                                        }

                                        if (field.type === "number") {
                                            return (
                                                <div key={field.key}>
                                                    <label style={labelStyle}>{field.label}</label>
                                                    <input
                                                        style={inputStyle}
                                                        type="number"
                                                        min="0"
                                                        value={sportData[field.key] || ""}
                                                        onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value ? Number(e.target.value) : "" })}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={field.key}>
                                                <label style={labelStyle}>{field.label}</label>
                                                <input
                                                    style={inputStyle}
                                                    value={sportData[field.key] || ""}
                                                    onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })}
                                                    placeholder={`Preencha ${field.label.toLowerCase()}`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Botões */}
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); window.scrollTo(0, 0); }}
                                    style={{
                                        padding: "14px 24px",
                                        background: "var(--bg-app)",
                                        color: "var(--text-primary)",
                                        borderRadius: 10,
                                        fontWeight: 600,
                                        fontSize: 14,
                                        cursor: "pointer",
                                        border: "1.5px solid var(--border-color)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    ← Voltar
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    style={{
                                        padding: "14px 32px",
                                        background: submitting ? "#94a3b8" : sport.color,
                                        color: "#fff",
                                        borderRadius: 10,
                                        fontWeight: 700,
                                        fontSize: 15,
                                        cursor: submitting ? "not-allowed" : "pointer",
                                        border: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} /> Enviar Cadastro
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </main>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input:focus, textarea:focus, select:focus {
          border-color: ${sport?.color || "var(--primary-color)"} !important;
          box-shadow: 0 0 0 3px ${sport?.color || "var(--primary-color)"}20 !important;
        }
      `}</style>
        </div>
    );
}
