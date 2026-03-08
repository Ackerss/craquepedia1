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

    const [isExporting, setIsExporting] = useState(false);

    // PREVIEW MODE
    if (showPreview) {
        const exportToPDF = async () => {
            if (!printRef.current) return;
            setIsExporting(true);
            try {
                // Importa dinamicamente para evitar erro de 'window is not defined' no SSR (Next.js)
                const html2pdf = (await import("html2pdf.js")).default;

                const element = printRef.current;
                const opt = {
                    margin: 0,
                    filename: `${cv.nome_esportivo || cv.nome_completo || "Atleta"}_Curriculo.pdf`.replace(/\s+/g, '_'),
                    image: { type: 'jpeg' as const, quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
                };

                await html2pdf().set(opt).from(element).save();
            } catch (error) {
                console.error("Erro ao gerar PDF:", error);
                alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
            } finally {
                setIsExporting(false);
            }
        };

        return (
            <>
                <style>{`
                    @media print {
                        @page { margin: 0; size: A4 portrait; }
                        .no-print, aside, nav, header { display: none !important; }
                        
                        /* Fix wrapper constraints to allow full page print */
                        body, html, main, .flex-1, .h-screen, .overflow-y-auto { 
                            height: auto !important; 
                            min-height: auto !important; 
                            overflow: visible !important; 
                            background: white !important;
                        }

                        /* Container cinza vira branco e remove padding na impressao */
                        .preview-bg {
                            background: white !important;
                            padding: 0 !important;
                            display: block !important;
                        }
                        
                        /* A folha A4 toma 100% da impressão e perde a sombra */
                        .a4-page {
                            box-shadow: none !important;
                            width: 210mm !important;
                            height: 297mm !important;
                            min-height: 297mm !important;
                            margin: 0 !important;
                            position: relative !important;
                            page-break-after: always;
                        }
                    }

                    /* Na Tela Normal: Container cinza em volta do A4 para destacar a "folha" */
                    @media screen {
                        .preview-bg {
                            background: #f1f5f9;
                            min-height: 100vh;
                            padding: 40px;
                            display: flex;
                            justify-content: center;
                        }
                        /* Formato exato do A4 na tela (ratio 210/297) */
                        .a4-page {
                            width: 210mm;
                            min-height: 297mm;
                            background: white;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                            position: relative;
                            overflow: hidden;
                            font-family: inherit;
                        }
                    }
                `}</style>
                {/* Print Controls */}
                <div className="no-print" style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 32px", background: "#fff", borderBottom: "1px solid var(--border-color)",
                    position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}>
                    <button onClick={() => setShowPreview(false)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", cursor: "pointer", background: "#fff", transition: "0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                        <ArrowLeft size={16} /> Voltar ao Editor
                    </button>
                    <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "#fff", border: "1.5px solid var(--border-color)", cursor: "pointer", transition: "0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                            <Printer size={16} /> Imprimir (Navegador)
                        </button>
                        <button onClick={exportToPDF} disabled={isExporting} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "linear-gradient(135deg, var(--primary-color), #7c3aed)", color: "#fff", border: "none", cursor: isExporting ? "wait" : "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)", opacity: isExporting ? 0.7 : 1 }}>
                            {isExporting ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <FileDown size={16} />}
                            {isExporting ? "Gerando PDF..." : "Salvar PDF Perfeito"}
                        </button>
                    </div>
                </div>

                {/* CV Preview Background Container */}
                <div className="preview-bg">
                    {/* The A4 Page */}
                    <div ref={printRef} className="a4-page">

                        {/* Header Premium Scout */}
                        <div style={{
                            position: "relative",
                            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                            color: "#fff",
                            padding: "50px 60px",
                            display: "flex", alignItems: "center", gap: 32,
                            boxShadow: "inset 0 -10px 20px rgba(0,0,0,0.1)"
                        }}>
                            {/* Decorative element */}
                            <div style={{ position: "absolute", right: -50, top: -50, width: 250, height: 250, background: "rgba(255,255,255,0.02)", borderRadius: "50%" }}></div>
                            <div style={{ position: "absolute", right: 100, bottom: -20, width: 100, height: 100, border: "2px solid rgba(255,255,255,0.05)", borderRadius: "50%" }}></div>

                            <div style={{
                                width: 110, height: 110, borderRadius: "50%",
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 42, fontWeight: 800, color: "#fff", flexShrink: 0,
                                boxShadow: "0 10px 30px rgba(59, 130, 246, 0.4)",
                                border: "4px solid rgba(255,255,255,0.1)",
                                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                            }}>
                                {(cv.nome_esportivo || cv.nome_completo || "?").charAt(0)}
                            </div>

                            <div style={{ zIndex: 1, position: "relative" }}>
                                <div style={{ display: "inline-block", padding: "4px 12px", background: "rgba(59, 130, 246, 0.2)", border: "1px solid rgba(59, 130, 246, 0.4)", color: "#93c5fd", borderRadius: 20, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>
                                    {cv.modalidade || "Modalidade Não Informada"}
                                </div>
                                <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
                                    {cv.nome_esportivo || cv.nome_completo}
                                </h1>
                                {cv.posicao && (
                                    <h2 style={{ fontSize: 18, fontWeight: 400, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 10 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }}></div>
                                        {cv.posicao}
                                    </h2>
                                )}
                            </div>
                        </div>

                        {/* Physical Profile Highlight Bar */}
                        <div style={{
                            background: "#2563eb",
                            color: "white",
                            padding: "16px 60px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div style={{ display: "flex", gap: "48px" }}>
                                {cv.idade && (
                                    <div>
                                        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8, marginBottom: 2 }}>Idade</p>
                                        <p style={{ fontSize: 16, fontWeight: 800 }}>{cv.idade} <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.9 }}>anos</span></p>
                                    </div>
                                )}
                                {cv.altura && (
                                    <div>
                                        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8, marginBottom: 2 }}>Altura</p>
                                        <p style={{ fontSize: 16, fontWeight: 800 }}>{cv.altura}</p>
                                    </div>
                                )}
                                {cv.peso && (
                                    <div>
                                        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8, marginBottom: 2 }}>Peso</p>
                                        <p style={{ fontSize: 16, fontWeight: 800 }}>{cv.peso}</p>
                                    </div>
                                )}
                                {cv.lateralidade && (
                                    <div>
                                        <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.8, marginBottom: 2 }}>Pé / Mão Dominante</p>
                                        <p style={{ fontSize: 16, fontWeight: 800, textTransform: "capitalize" }}>{cv.lateralidade}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Body Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", minHeight: "calc(297mm - 270px)" }}> /* Subtrai Header (aprox 200px) e Bar (aprox 70px) */

                            {/* Left Column (Main Content) */}
                            <div style={{ padding: "40px 50px 40px 60px" }}>

                                {cv.bio && (
                                    <div style={{ marginBottom: 36 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                                <User size={16} />
                                            </div>
                                            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#0f172a" }}>
                                                Apresentação
                                            </h3>
                                        </div>
                                        <p style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", textAlign: "justify" }}>{cv.bio}</p>
                                    </div>
                                )}

                                {cv.historico_esportivo && (
                                    <div style={{ marginBottom: 36 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(37,99,235,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563eb" }}>
                                                <Activity size={16} />
                                            </div>
                                            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#0f172a" }}>
                                                Histórico Esportivo
                                            </h3>
                                        </div>
                                        <div style={{ paddingLeft: 16, borderLeft: "2px solid #e2e8f0" }}>
                                            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", whiteSpace: "pre-wrap" }}>{cv.historico_esportivo}</p>
                                        </div>
                                    </div>
                                )}

                                {cv.conquistas && (
                                    <div style={{ marginBottom: 36 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#d97706" }}>
                                                <Trophy size={16} />
                                            </div>
                                            <h3 style={{ fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#0f172a" }}>
                                                Conquistas Principais
                                            </h3>
                                        </div>
                                        <div style={{ background: "#fafafa", borderRadius: 12, padding: "20px 24px", border: "1px solid #e2e8f0" }}>
                                            <p style={{ fontSize: 14, lineHeight: 1.8, color: "#334155", whiteSpace: "pre-wrap" }}>{cv.conquistas}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column (Sidebar) */}
                            <div style={{ background: "#f8fafc", borderLeft: "1px solid #e2e8f0", padding: "40px" }}>

                                <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b", marginBottom: 20 }}>Contato</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
                                    {(cv.cidade || cv.estado) && (
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <MapPin size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{cv.cidade}{cv.cidade && cv.estado ? " - " : ""}{cv.estado}</span>
                                        </div>
                                    )}
                                    {cv.telefone && (
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <Phone size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{cv.telefone}</span>
                                        </div>
                                    )}
                                    {cv.email && (
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <Mail size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, wordBreak: "break-all" }}>{cv.email}</span>
                                        </div>
                                    )}
                                    {cv.instagram && (
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <span style={{ fontSize: 15, width: 16, textAlign: "center", color: "#3b82f6" }}>📸</span>
                                            <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{cv.instagram}</span>
                                        </div>
                                    )}
                                </div>

                                {cv.data_nascimento && (
                                    <div style={{ marginBottom: 40 }}>
                                        <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b", marginBottom: 16 }}>Dados Pessoais</h3>
                                        <div style={{ display: "flex", gap: 12 }}>
                                            <Calendar size={16} color="#3b82f6" style={{ marginTop: 2, flexShrink: 0 }} />
                                            <div>
                                                <p style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Nascimento</p>
                                                <p style={{ fontSize: 13, color: "#334155", fontWeight: 500 }}>{cv.data_nascimento}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dados Técnicos Específicos */}
                                {Object.keys(cv.dados_tecnicos).filter(k =>
                                    k !== 'posicao' && k !== 'posicao_principal' && k !== 'categoria_peso' && k !== 'pe_dominante' && k !== 'mao_dominante' && cv.dados_tecnicos[k]
                                ).length > 0 && (
                                        <div style={{ marginBottom: 40 }}>
                                            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b", marginBottom: 16 }}>
                                                Atributos Técnicos
                                            </h3>
                                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                                {Object.entries(cv.dados_tecnicos)
                                                    .filter(([key, value]) => key !== 'posicao' && key !== 'posicao_principal' && key !== 'categoria_peso' && key !== 'pe_dominante' && key !== 'mao_dominante' && value)
                                                    .map(([key, value]) => (
                                                        <div key={key}>
                                                            <span style={{ display: "block", fontSize: 10, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px", marginBottom: 4 }}>{key.replace(/_/g, " ")}</span>
                                                            <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{String(value)}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                {cv.links_video && (
                                    <div style={{ marginBottom: 40, background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                                        <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#64748b", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                                            Vídeos & Links
                                        </h3>
                                        <p style={{ fontSize: 11, color: "#3b82f6", whiteSpace: "pre-wrap", wordBreak: "break-all", fontWeight: 500 }}>{cv.links_video}</p>
                                    </div>
                                )}

                                {/* Watermark Footer dentro do A4 */}
                                <div style={{ position: "absolute", bottom: 40, right: 40, background: "#fff", padding: "12px 20px", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                    <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: "1px", color: "#0f172a" }}>
                                        CRAQUE<span style={{ color: "#2563eb" }}>PEDIA</span>
                                    </p>
                                </div>
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
