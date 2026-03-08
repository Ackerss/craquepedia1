"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Loader2, Printer, FileDown, Save, Wand2,
    MapPin, Phone, Mail, Calendar, Trophy, User, Activity
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { type Athlete, type AthleteService } from "@/lib/supabase/types";

interface CurriculoData {
    nome_esportivo: string;
    nome_completo: string;
    modalidade: string;
    posicao: string;
    data_nascimento: string;
    idade: string;
    altura: string;
    peso: string;
    lateralidade: string;
    cidade: string;
    estado: string;
    telefone: string;
    email: string;
    instagram: string;
    bio: string;
    conquistas: string;
    historico_esportivo: string;
    links_video: string;
    dados_tecnicos: Record<string, string>;
}

function calcIdade(birthDate: string): string {
    if (!birthDate) return "";
    try {
        const parts = birthDate.split(/[-/]/);
        let d: Date;
        if (parts[0].length === 4) {
            d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        } else {
            d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        const ageDiff = Date.now() - d.getTime();
        const ageDate = new Date(ageDiff);
        return String(Math.abs(ageDate.getUTCFullYear() - 1970));
    } catch {
        return "";
    }
}

export default function CurriculoEditorPage() {
    const params = useParams();
    const router = useRouter();
    const athleteId = params.id as string;

    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [service, setService] = useState<AthleteService | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [generated, setGenerated] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const [cv, setCv] = useState<CurriculoData>({
        nome_esportivo: "", nome_completo: "", modalidade: "", posicao: "",
        data_nascimento: "", idade: "", altura: "", peso: "", lateralidade: "",
        cidade: "", estado: "", telefone: "", email: "", instagram: "",
        bio: "", conquistas: "", historico_esportivo: "", links_video: "",
        dados_tecnicos: {},
    });

    useEffect(() => {
        async function load() {
            const [athleteRes, serviceRes] = await Promise.all([
                supabase.from("athletes").select("*").eq("id", athleteId).single(),
                supabase.from("athlete_services").select("*").eq("athlete_id", athleteId).eq("service_type", "curriculo").single(),
            ]);

            if (athleteRes.data) {
                setAthlete(athleteRes.data as Athlete);
                // Se já tem dados salvos no serviço, usar eles
                if (serviceRes.data?.data && Object.keys(serviceRes.data.data).length > 0) {
                    setCv(serviceRes.data.data as unknown as CurriculoData);
                    setGenerated(true);
                }
            }
            if (serviceRes.data) setService(serviceRes.data as AthleteService);
            setLoading(false);
        }
        load();
    }, [athleteId]);

    const generateFromAthlete = () => {
        if (!athlete) return;
        const gd = (athlete.general_data || {}) as Record<string, string>;
        const sd = (athlete.sport_data || {}) as Record<string, string>;

        const newCv: CurriculoData = {
            nome_esportivo: athlete.sport_nickname || athlete.full_name,
            nome_completo: athlete.full_name,
            modalidade: athlete.sport_name,
            posicao: sd.posicao || sd.posicao_principal || sd.categoria_peso || "",
            data_nascimento: athlete.birth_date || "",
            idade: calcIdade(athlete.birth_date || ""),
            altura: gd.altura || "",
            peso: gd.peso || "",
            lateralidade: sd.pe_dominante || sd.mao_dominante || gd.lateralidade || "",
            cidade: athlete.city || "",
            estado: athlete.state || "",
            telefone: athlete.phone || "",
            email: athlete.email || "",
            instagram: gd.instagram || "",
            bio: gd.bio || "",
            conquistas: gd.conquistas || "",
            historico_esportivo: gd.historico_esportivo || "",
            links_video: gd.links_video || "",
            dados_tecnicos: sd,
        };
        setCv(newCv);
        setGenerated(true);
    };

    const saveCurriculo = async () => {
        setSaving(true);
        if (service) {
            await supabase
                .from("athlete_services")
                .update({
                    data: cv as unknown as Record<string, unknown>,
                    status: "em_andamento",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", service.id);
        }
        setSaving(false);
    };

    const markAsComplete = async () => {
        setSaving(true);
        if (service) {
            await supabase
                .from("athlete_services")
                .update({
                    data: cv as unknown as Record<string, unknown>,
                    status: "concluido",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", service.id);
            setService({ ...service, status: "concluido" });
        }
        setSaving(false);
    };

    const handlePrint = () => {
        window.print();
    };

    const updateField = (field: keyof CurriculoData, value: string) => {
        setCv((prev) => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Carregando...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!athlete) {
        return (
            <div style={{ padding: 48, textAlign: "center" }}>
                <p>Atleta não encontrado.</p>
                <Link href="/admin/curriculos" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Voltar</Link>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 14px", borderRadius: 8,
        border: "1.5px solid var(--border-color)", fontSize: 13,
        fontFamily: "inherit", outline: "none", background: "#fff",
        transition: "border-color 0.2s",
    };

    const labelStyle: React.CSSProperties = {
        display: "block", fontSize: 11, fontWeight: 700,
        color: "var(--text-secondary)", marginBottom: 4,
        textTransform: "uppercase", letterSpacing: "0.5px",
    };

    // PREVIEW MODE
    if (showPreview) {
        return (
            <>
                <style>{`
                    @media print {
                        .no-print { display: none !important; }
                        body { background: white !important; }
                    }
                `}</style>
                {/* Print Controls */}
                <div className="no-print" style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 32px", background: "#fff", borderBottom: "1px solid var(--border-color)",
                }}>
                    <button onClick={() => setShowPreview(false)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-color)", cursor: "pointer", background: "#fff" }}>
                        <ArrowLeft size={16} /> Voltar ao Editor
                    </button>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "#fff", border: "1.5px solid var(--border-color)", cursor: "pointer" }}>
                            <Printer size={16} /> Imprimir A4
                        </button>
                        <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "var(--primary-color)", color: "#fff", border: "none", cursor: "pointer" }}>
                            <FileDown size={16} /> Salvar PDF
                        </button>
                    </div>
                </div>

                {/* CV Preview */}
                <div ref={printRef} style={{ maxWidth: 800, margin: "32px auto", background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
                    {/* Header */}
                    <div style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", color: "#fff", padding: "40px 48px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--primary-color), #7c3aed)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 32, fontWeight: 800, color: "#fff", flexShrink: 0,
                            }}>
                                {(cv.nome_esportivo || cv.nome_completo || "?").charAt(0)}
                            </div>
                            <div>
                                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
                                    {cv.nome_esportivo || cv.nome_completo}
                                </h1>
                                <h2 style={{ fontSize: 16, fontWeight: 400, opacity: 0.8, marginBottom: 12 }}>
                                    {cv.modalidade} {cv.posicao ? `• ${cv.posicao}` : ""}
                                </h2>
                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    {cv.idade && <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 600 }}>{cv.idade} anos</span>}
                                    {cv.altura && <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 600 }}>{cv.altura}</span>}
                                    {cv.peso && <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 600 }}>{cv.peso}</span>}
                                    {cv.lateralidade && <span style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.15)", fontSize: 12, fontWeight: 600 }}>{cv.lateralidade}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", minHeight: 400 }}>
                        {/* Main */}
                        <div style={{ padding: "32px 40px" }}>
                            {cv.bio && (
                                <div style={{ marginBottom: 28 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary-color)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                        <User size={16} /> Apresentação
                                    </h3>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", whiteSpace: "pre-wrap" }}>{cv.bio}</p>
                                </div>
                            )}
                            {cv.historico_esportivo && (
                                <div style={{ marginBottom: 28 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary-color)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                        <Activity size={16} /> Histórico Esportivo
                                    </h3>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", whiteSpace: "pre-wrap" }}>{cv.historico_esportivo}</p>
                                </div>
                            )}
                            {cv.conquistas && (
                                <div style={{ marginBottom: 28 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary-color)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                                        <Trophy size={16} /> Conquistas
                                    </h3>
                                    <p style={{ fontSize: 14, lineHeight: 1.7, color: "#475569", whiteSpace: "pre-wrap" }}>{cv.conquistas}</p>
                                </div>
                            )}
                            {/* Dados Técnicos */}
                            {Object.keys(cv.dados_tecnicos).length > 0 && (
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary-color)", marginBottom: 12 }}>
                                        Dados Técnicos
                                    </h3>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                                        {Object.entries(cv.dados_tecnicos).map(([key, value]) => (
                                            value && (
                                                <div key={key} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                                                    <span style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>{key.replace(/_/g, " ")}</span>
                                                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{String(value)}</p>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div style={{ background: "#f8fafc", padding: "32px 24px", borderLeft: "1px solid var(--border-color)" }}>
                            <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#475569", marginBottom: 16 }}>Contato</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {(cv.cidade || cv.estado) && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <MapPin size={14} color="var(--primary-color)" />
                                        <span style={{ fontSize: 13 }}>{cv.cidade}{cv.estado ? `, ${cv.estado}` : ""}</span>
                                    </div>
                                )}
                                {cv.telefone && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Phone size={14} color="var(--primary-color)" />
                                        <span style={{ fontSize: 13 }}>{cv.telefone}</span>
                                    </div>
                                )}
                                {cv.email && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <Mail size={14} color="var(--primary-color)" />
                                        <span style={{ fontSize: 13 }}>{cv.email}</span>
                                    </div>
                                )}
                                {cv.instagram && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 14 }}>📸</span>
                                        <span style={{ fontSize: 13 }}>{cv.instagram}</span>
                                    </div>
                                )}
                            </div>
                            {cv.data_nascimento && (
                                <div style={{ marginTop: 24 }}>
                                    <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#475569", marginBottom: 12 }}>Dados Pessoais</h3>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <Calendar size={14} color="var(--primary-color)" />
                                        <span style={{ fontSize: 13 }}>{cv.data_nascimento}</span>
                                    </div>
                                </div>
                            )}
                            {cv.links_video && (
                                <div style={{ marginTop: 24 }}>
                                    <h3 style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#475569", marginBottom: 12 }}>Links de Vídeos</h3>
                                    <p style={{ fontSize: 12, color: "#475569", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{cv.links_video}</p>
                                </div>
                            )}
                            {/* Craquepedia Branding */}
                            <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
                                <p style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", letterSpacing: "1px" }}>
                                    CRAQUE<span style={{ color: "var(--primary-color)" }}>PEDIA</span>
                                </p>
                                <p style={{ fontSize: 10, color: "#cbd5e1", marginTop: 4 }}>Gestão Esportiva Profissional</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // EDITOR MODE
    return (
        <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }} className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <Link href="/admin/curriculos" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, fontWeight: 500 }}>
                        <ArrowLeft size={16} /> Voltar aos Currículos
                    </Link>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                        📄 Currículo — {athlete.sport_nickname || athlete.full_name}
                    </h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                        {athlete.sport_name} • {service?.status === "concluido" ? "✅ Concluído" : service?.status === "em_andamento" ? "🔵 Em Andamento" : "🟡 Pendente"}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!generated && (
                        <button
                            onClick={generateFromAthlete}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                                borderRadius: 10, fontSize: 13, fontWeight: 700,
                                background: "linear-gradient(135deg, var(--primary-color), #7c3aed)",
                                color: "#fff", border: "none", cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                            }}
                        >
                            <Wand2 size={16} /> Gerar Automaticamente
                        </button>
                    )}
                    {generated && (
                        <>
                            <button onClick={saveCurriculo} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1.5px solid var(--border-color)", background: "#fff", cursor: "pointer" }}>
                                <Save size={16} /> {saving ? "Salvando..." : "Salvar Rascunho"}
                            </button>
                            <button onClick={() => setShowPreview(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "var(--primary-color)", color: "#fff", border: "none", cursor: "pointer" }}>
                                <FileDown size={16} /> Preview / PDF
                            </button>
                            <button onClick={markAsComplete} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700, background: "#10b981", color: "#fff", border: "none", cursor: "pointer" }}>
                                ✅ Marcar Concluído
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Generate CTA */}
            {!generated && (
                <div style={{
                    background: "#fff", borderRadius: 16, border: "2px dashed var(--border-color)",
                    padding: 48, textAlign: "center", marginBottom: 24,
                }}>
                    <Wand2 size={48} color="var(--primary-color)" style={{ marginBottom: 16 }} />
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Gerar Currículo Automaticamente</h2>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
                        Os dados do formulário do atleta serão usados para preencher o currículo automaticamente. Você poderá editar qualquer campo antes de finalizar.
                    </p>
                    <button
                        onClick={generateFromAthlete}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                            background: "linear-gradient(135deg, var(--primary-color), #7c3aed)",
                            color: "#fff", border: "none", cursor: "pointer",
                            boxShadow: "0 4px 16px rgba(37, 99, 235, 0.3)",
                        }}
                    >
                        <Wand2 size={20} /> Gerar Currículo com Dados do Atleta
                    </button>
                </div>
            )}

            {/* Editor Form */}
            {generated && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Dados Principais */}
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <User size={18} color="var(--primary-color)" /> Dados Principais
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                            <div>
                                <label style={labelStyle}>Nome Esportivo (CV)</label>
                                <input style={inputStyle} value={cv.nome_esportivo} onChange={(e) => updateField("nome_esportivo", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nome Completo</label>
                                <input style={inputStyle} value={cv.nome_completo} onChange={(e) => updateField("nome_completo", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Modalidade</label>
                                <input style={inputStyle} value={cv.modalidade} onChange={(e) => updateField("modalidade", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Posição</label>
                                <input style={inputStyle} value={cv.posicao} onChange={(e) => updateField("posicao", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Data de Nascimento</label>
                                <input style={inputStyle} value={cv.data_nascimento} onChange={(e) => updateField("data_nascimento", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Idade</label>
                                <input style={inputStyle} value={cv.idade} onChange={(e) => updateField("idade", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Altura</label>
                                <input style={inputStyle} value={cv.altura} onChange={(e) => updateField("altura", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Peso</label>
                                <input style={inputStyle} value={cv.peso} onChange={(e) => updateField("peso", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Lateralidade / Pé</label>
                                <input style={inputStyle} value={cv.lateralidade} onChange={(e) => updateField("lateralidade", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Contato */}
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Phone size={18} color="var(--primary-color)" /> Contato
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                            <div>
                                <label style={labelStyle}>Cidade</label>
                                <input style={inputStyle} value={cv.cidade} onChange={(e) => updateField("cidade", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Estado</label>
                                <input style={inputStyle} value={cv.estado} onChange={(e) => updateField("estado", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone / WhatsApp</label>
                                <input style={inputStyle} value={cv.telefone} onChange={(e) => updateField("telefone", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>E-mail</label>
                                <input style={inputStyle} value={cv.email} onChange={(e) => updateField("email", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Instagram</label>
                                <input style={inputStyle} value={cv.instagram} onChange={(e) => updateField("instagram", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Bio e Textos */}
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Activity size={18} color="var(--primary-color)" /> Apresentação e Histórico
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Biografia / Apresentação</label>
                                <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={cv.bio} onChange={(e) => updateField("bio", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Histórico Esportivo</label>
                                <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={cv.historico_esportivo} onChange={(e) => updateField("historico_esportivo", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Conquistas</label>
                                <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={cv.conquistas} onChange={(e) => updateField("conquistas", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Links de Vídeos</label>
                                <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={cv.links_video} onChange={(e) => updateField("links_video", e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                input:focus, textarea:focus { border-color: var(--primary-color) !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
            `}</style>
        </div>
    );
}
