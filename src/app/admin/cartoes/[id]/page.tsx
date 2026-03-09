"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Loader2, Save, Wand2, Eye, EyeOff,
    MapPin, Phone, Mail, Instagram, Youtube, Globe,
    Share2, Download, CheckCircle2, Sparkles, ExternalLink,
    User, MessageCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { type Athlete, type AthleteService } from "@/lib/supabase/types";

// ============================
// TYPES
// ============================

interface CartaoData {
    nome_esportivo: string;
    nome_completo: string;
    modalidade: string;
    posicao: string;
    cidade: string;
    estado: string;
    telefone: string;
    whatsapp: string;
    email: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    site: string;
    portfolio_url: string;
    bio_curta: string;
    photo_url: string;
    conquista_destaque: string;
}

const EMPTY_CARTAO: CartaoData = {
    nome_esportivo: "", nome_completo: "", modalidade: "", posicao: "",
    cidade: "", estado: "", telefone: "", whatsapp: "", email: "",
    instagram: "", youtube: "", tiktok: "", site: "", portfolio_url: "",
    bio_curta: "", photo_url: "", conquista_destaque: "",
};

// ============================
// HELPERS
// ============================

function formatWhatsAppLink(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    const num = digits.startsWith("55") ? digits : "55" + digits;
    return `https://wa.me/${num}`;
}

function formatInstagramLink(handle: string): string {
    const clean = handle.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
    return `https://instagram.com/${clean}`;
}

function formatYouTubeLink(yt: string): string {
    if (yt.startsWith("http")) return yt;
    return `https://youtube.com/${yt}`;
}

function formatTikTokLink(tt: string): string {
    const clean = tt.startsWith("@") ? tt : `@${tt}`;
    return `https://tiktok.com/${clean}`;
}

function formatSiteLink(url: string): string {
    if (url.startsWith("http")) return url;
    return `https://${url}`;
}

// ============================
// QR CODE COMPONENT (API-based)
// ============================

function QRCodeImage({ data, size = 120 }: { data: string; size?: number }) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=0f172a&color=ffffff&format=svg`;
    return (
        <img
            src={url}
            alt="QR Code"
            width={size}
            height={size}
            style={{ borderRadius: 8, background: "#0f172a" }}
        />
    );
}

// ============================
// SOCIAL LINK BUTTON
// ============================

function SocialButton({ href, icon, label, color, bg }: {
    href: string; icon: React.ReactNode; label: string; color: string; bg: string;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", borderRadius: 12,
                background: bg, color, textDecoration: "none",
                fontSize: 13, fontWeight: 600,
                transition: "all 0.2s", border: "1px solid rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
        >
            {icon}
            <span style={{ flex: 1 }}>{label}</span>
            <ExternalLink size={13} style={{ opacity: 0.5 }} />
        </a>
    );
}

// ============================
// TIKTOK ICON
// ============================

function TikTokIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .55.04.81.1v-3.51a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.86a8.32 8.32 0 0 0 4.76 1.49V6.89a4.85 4.85 0 0 1-1-.2z" />
        </svg>
    );
}

// ============================
// MAIN PAGE COMPONENT
// ============================

export default function CartaoEditorPage() {
    const params = useParams();
    const athleteId = params.id as string;

    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [service, setService] = useState<AthleteService | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [generated, setGenerated] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const [cartao, setCartao] = useState<CartaoData>({ ...EMPTY_CARTAO });

    // ---- Load ----
    useEffect(() => {
        async function load() {
            const [athleteRes, serviceRes] = await Promise.all([
                supabase.from("athletes").select("*").eq("id", athleteId).single(),
                supabase.from("athlete_services").select("*").eq("athlete_id", athleteId).eq("service_type", "cartao").single(),
            ]);

            if (athleteRes.data) {
                setAthlete(athleteRes.data as Athlete);
                if (serviceRes.data?.data && Object.keys(serviceRes.data.data).length > 0) {
                    setCartao(serviceRes.data.data as unknown as CartaoData);
                    setGenerated(true);
                }
            }
            if (serviceRes.data) setService(serviceRes.data as AthleteService);
            setLoading(false);
        }
        load();
    }, [athleteId]);

    // ---- Generate from athlete ----
    const generateFromAthlete = () => {
        if (!athlete) return;
        const gd = (athlete.general_data || {}) as Record<string, string>;
        const sd = (athlete.sport_data || {}) as Record<string, string>;

        const newCartao: CartaoData = {
            nome_esportivo: athlete.sport_nickname || athlete.full_name,
            nome_completo: athlete.full_name,
            modalidade: athlete.sport_name || "",
            posicao: sd.posicao || sd.posicao_principal || sd.categoria_peso || "",
            cidade: athlete.city || "",
            estado: athlete.state || "",
            telefone: athlete.phone || "",
            whatsapp: athlete.phone || "",
            email: athlete.email || "",
            instagram: gd.instagram || "",
            youtube: gd.youtube || "",
            tiktok: gd.tiktok || "",
            site: gd.site || gd.website || "",
            portfolio_url: gd.portfolio || gd.portfolio_url || "",
            bio_curta: gd.bio ? (gd.bio.length > 100 ? gd.bio.substring(0, 97) + "..." : gd.bio) : "",
            photo_url: athlete.photo_url || "",
            conquista_destaque: gd.conquistas
                ? gd.conquistas.split("\n")[0]
                : (athlete.achievements && athlete.achievements.length > 0)
                    ? `${athlete.achievements[0].titulo} (${athlete.achievements[0].ano})`
                    : "",
        };
        setCartao(newCartao);
        setGenerated(true);
    };

    // ---- Save ----
    const saveCartao = async () => {
        setSaving(true);
        if (service) {
            await supabase
                .from("athlete_services")
                .update({
                    data: cartao as unknown as Record<string, unknown>,
                    status: "em_andamento",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", service.id);

            // Sync relevant fields back to athlete profile
            if (athlete) {
                const currentGd = (athlete.general_data || {}) as Record<string, string>;
                await supabase
                    .from("athletes")
                    .update({
                        sport_nickname: cartao.nome_esportivo || athlete.sport_nickname,
                        phone: cartao.telefone || athlete.phone,
                        email: cartao.email || athlete.email,
                        city: cartao.cidade || athlete.city,
                        state: cartao.estado || athlete.state,
                        photo_url: cartao.photo_url || athlete.photo_url,
                        general_data: {
                            ...currentGd,
                            instagram: cartao.instagram || currentGd.instagram || "",
                            youtube: cartao.youtube || currentGd.youtube || "",
                            tiktok: cartao.tiktok || currentGd.tiktok || "",
                            site: cartao.site || currentGd.site || "",
                            portfolio: cartao.portfolio_url || currentGd.portfolio || "",
                        },
                    })
                    .eq("id", athlete.id);
            }
        }
        setSaving(false);
    };

    const markAsComplete = async () => {
        setSaving(true);
        if (service) {
            await supabase
                .from("athlete_services")
                .update({
                    data: cartao as unknown as Record<string, unknown>,
                    status: "concluido",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", service.id);
            setService({ ...service, status: "concluido" });
        }
        setSaving(false);
    };

    const updateField = (field: keyof CartaoData, value: string) => {
        setCartao((prev) => ({ ...prev, [field]: value }));
    };

    // ---- Download card as image ----
    const downloadCardImage = async () => {
        if (!cardRef.current) return;
        try {
            const html2canvas = (await import("html2canvas")).default;
            const canvas = await html2canvas(cardRef.current, {
                scale: 2, useCORS: true, backgroundColor: "#ffffff",
                logging: false,
            });
            const link = document.createElement("a");
            link.download = `cartao-${(cartao.nome_esportivo || cartao.nome_completo || "atleta").toLowerCase().replace(/\s+/g, "-")}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Erro ao gerar imagem:", err);
            alert("Erro ao gerar a imagem. Tente novamente.");
        }
    };

    // ---- Share via WhatsApp ----
    const shareViaWhatsApp = () => {
        const phone = cartao.whatsapp || cartao.telefone;
        const nome = cartao.nome_esportivo || cartao.nome_completo;
        const profileUrl = `${window.location.origin}/atletas/${athleteId}`;
        const message = [
            `🏆 *CRAQUEPEDIA* — Cartão Digital`,
            ``,
            `Olá ${nome}! Segue seu cartão digital profissional:`,
            ``,
            `📇 *${nome}*`,
            cartao.modalidade ? `⚽ ${cartao.modalidade}${cartao.posicao ? ` • ${cartao.posicao}` : ""}` : "",
            (cartao.cidade || cartao.estado) ? `📍 ${cartao.cidade}${cartao.cidade && cartao.estado ? ", " : ""}${cartao.estado}` : "",
            cartao.conquista_destaque ? `🏆 ${cartao.conquista_destaque}` : "",
            ``,
            `🔗 Acesse seu perfil completo:`,
            profileUrl,
            ``,
            `_Gerado pela Craquepedia_`,
        ].filter(Boolean).join("%0a");

        if (phone) {
            const digits = phone.replace(/\D/g, "");
            const num = digits.startsWith("55") ? digits : "55" + digits;
            window.open(`https://wa.me/${num}?text=${message}`, "_blank");
        } else {
            window.open(`https://wa.me/?text=${message}`, "_blank");
        }
    };

    // ---- Loading / Error ----
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
                <Link href="/admin/cartoes" style={{ color: "var(--primary-color)", fontWeight: "bold" }}>Voltar</Link>
            </div>
        );
    }

    // ============================
    // INPUT STYLES
    // ============================

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

    // ============================
    // CARD PREVIEW RENDER
    // ============================

    if (showPreview) {
        const socialLinks: { href: string; icon: React.ReactNode; label: string; color: string; bg: string }[] = [];

        if (cartao.whatsapp || cartao.telefone) {
            socialLinks.push({
                href: formatWhatsAppLink(cartao.whatsapp || cartao.telefone),
                icon: <MessageCircle size={18} />,
                label: "WhatsApp",
                color: "#25d366",
                bg: "rgba(37, 211, 102, 0.08)",
            });
        }
        if (cartao.instagram) {
            socialLinks.push({
                href: formatInstagramLink(cartao.instagram),
                icon: <Instagram size={18} />,
                label: cartao.instagram.startsWith("@") ? cartao.instagram : `@${cartao.instagram}`,
                color: "#e1306c",
                bg: "rgba(225, 48, 108, 0.08)",
            });
        }
        if (cartao.youtube) {
            socialLinks.push({
                href: formatYouTubeLink(cartao.youtube),
                icon: <Youtube size={18} />,
                label: "YouTube",
                color: "#ff0000",
                bg: "rgba(255, 0, 0, 0.06)",
            });
        }
        if (cartao.tiktok) {
            socialLinks.push({
                href: formatTikTokLink(cartao.tiktok),
                icon: <TikTokIcon size={18} />,
                label: cartao.tiktok.startsWith("@") ? cartao.tiktok : `@${cartao.tiktok}`,
                color: "#000",
                bg: "rgba(0, 0, 0, 0.04)",
            });
        }
        if (cartao.site) {
            socialLinks.push({
                href: formatSiteLink(cartao.site),
                icon: <Globe size={18} />,
                label: cartao.site.replace(/^https?:\/\//, ""),
                color: "#2563eb",
                bg: "rgba(37, 99, 235, 0.06)",
            });
        }
        if (cartao.portfolio_url) {
            socialLinks.push({
                href: formatSiteLink(cartao.portfolio_url),
                icon: <Share2 size={18} />,
                label: "Portfólio",
                color: "#8b5cf6",
                bg: "rgba(139, 92, 246, 0.06)",
            });
        }
        if (cartao.email) {
            socialLinks.push({
                href: `mailto:${cartao.email}`,
                icon: <Mail size={18} />,
                label: cartao.email,
                color: "#64748b",
                bg: "rgba(100, 116, 139, 0.06)",
            });
        }
        if (cartao.telefone) {
            socialLinks.push({
                href: `tel:${cartao.telefone}`,
                icon: <Phone size={18} />,
                label: cartao.telefone,
                color: "#0ea5e9",
                bg: "rgba(14, 165, 233, 0.06)",
            });
        }

        const cardShareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/atletas/${athleteId}`;

        return (
            <div className="animate-fade-in">
                {/* Controls Bar */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "16px 32px", background: "#fff", borderBottom: "1px solid var(--border-color)",
                    position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                }}>
                    <button
                        onClick={() => setShowPreview(false)}
                        style={{
                            display: "flex", alignItems: "center", gap: 6, fontSize: 13,
                            fontWeight: 600, color: "var(--text-secondary)", padding: "10px 20px",
                            borderRadius: 8, border: "1px solid var(--border-color)", cursor: "pointer",
                            background: "#fff", transition: "0.2s",
                        }}
                    >
                        <EyeOff size={16} /> Voltar ao Editor
                    </button>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button
                            onClick={downloadCardImage}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                                borderRadius: 8, fontSize: 13, fontWeight: 700,
                                background: "#fff", border: "1.5px solid var(--border-color)",
                                cursor: "pointer", transition: "0.2s",
                            }}
                        >
                            <Download size={16} /> Baixar Imagem
                        </button>
                        <button
                            onClick={shareViaWhatsApp}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                                borderRadius: 8, fontSize: 13, fontWeight: 700,
                                background: "#25d366", color: "#fff", border: "none",
                                cursor: "pointer", transition: "0.2s",
                            }}
                        >
                            <MessageCircle size={16} /> Enviar WhatsApp
                        </button>
                        <button
                            onClick={saveCartao}
                            disabled={saving}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                                borderRadius: 8, fontSize: 13, fontWeight: 700,
                                background: "#fff", border: "1.5px solid var(--border-color)",
                                cursor: "pointer", transition: "0.2s",
                            }}
                        >
                            <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                            onClick={markAsComplete}
                            disabled={saving}
                            style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                                borderRadius: 10, fontSize: 13, fontWeight: 700,
                                background: "#10b981", color: "#fff", border: "none",
                                cursor: "pointer",
                            }}
                        >
                            <CheckCircle2 size={16} /> Concluir
                        </button>
                    </div>
                </div>

                {/* Card Preview Area */}
                <div style={{
                    background: "linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)",
                    minHeight: "calc(100vh - 56px)", padding: "40px 20px",
                    display: "flex", justifyContent: "center", alignItems: "flex-start",
                }}>
                    {/* Card Container */}
                    <div
                        ref={cardRef}
                        style={{
                            width: "100%", maxWidth: 420,
                            borderRadius: 24, overflow: "hidden",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.08)",
                            background: "#fff",
                            fontFamily: "'Outfit', sans-serif",
                        }}
                    >
                        {/* ===== HEADER ===== */}
                        <div style={{
                            position: "relative",
                            background: "linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #1e3a5f 100%)",
                            padding: "40px 28px 24px",
                            textAlign: "center",
                            overflow: "hidden",
                        }}>
                            {/* Decorative shapes */}
                            <div style={{
                                position: "absolute", top: -60, right: -60,
                                width: 200, height: 200, borderRadius: "50%",
                                background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
                            }} />
                            <div style={{
                                position: "absolute", bottom: -30, left: -30,
                                width: 120, height: 120, borderRadius: "50%",
                                border: "2px solid rgba(255,255,255,0.04)",
                            }} />

                            {/* Sport Badge */}
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                padding: "5px 14px", borderRadius: 20,
                                background: "rgba(37, 99, 235, 0.2)",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                color: "#93c5fd", fontSize: 11, fontWeight: 800,
                                textTransform: "uppercase", letterSpacing: "1.5px",
                                marginBottom: 20, position: "relative", zIndex: 1,
                            }}>
                                <Sparkles size={12} />
                                {cartao.modalidade || "Atleta"}
                            </div>

                            {/* Photo */}
                            <div style={{
                                width: 110, height: 110, borderRadius: "50%",
                                margin: "0 auto 16px",
                                background: cartao.photo_url ? "transparent" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 44, fontWeight: 800, color: "#fff",
                                boxShadow: "0 8px 32px rgba(37, 99, 235, 0.35), 0 0 0 4px rgba(255,255,255,0.08)",
                                overflow: "hidden", position: "relative", zIndex: 1,
                            }}>
                                {cartao.photo_url ? (
                                    <img src={cartao.photo_url} alt={cartao.nome_esportivo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    (cartao.nome_esportivo || cartao.nome_completo || "?").charAt(0)
                                )}
                            </div>

                            {/* Name */}
                            <h1 style={{
                                fontSize: 26, fontWeight: 800, color: "#fff",
                                marginBottom: 4, letterSpacing: "-0.3px",
                                position: "relative", zIndex: 1,
                                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                            }}>
                                {cartao.nome_esportivo || cartao.nome_completo}
                            </h1>

                            {/* Position & Location */}
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                gap: 12, fontSize: 13, color: "#94a3b8",
                                position: "relative", zIndex: 1, flexWrap: "wrap",
                            }}>
                                {cartao.posicao && (
                                    <span style={{ fontWeight: 600, color: "#cbd5e1" }}>
                                        {cartao.posicao}
                                    </span>
                                )}
                                {cartao.posicao && (cartao.cidade || cartao.estado) && (
                                    <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#475569" }} />
                                )}
                                {(cartao.cidade || cartao.estado) && (
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <MapPin size={12} />
                                        {cartao.cidade}{cartao.cidade && cartao.estado ? ", " : ""}{cartao.estado}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* ===== BIO + CONQUISTA ===== */}
                        {(cartao.bio_curta || cartao.conquista_destaque) && (
                            <div style={{ padding: "20px 28px 0" }}>
                                {cartao.bio_curta && (
                                    <p style={{
                                        fontSize: 14, lineHeight: 1.6, color: "#475569",
                                        textAlign: "center", fontStyle: "italic",
                                        margin: "0 0 12px",
                                    }}>
                                        &ldquo;{cartao.bio_curta}&rdquo;
                                    </p>
                                )}
                                {cartao.conquista_destaque && (
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: 8,
                                        padding: "10px 14px", borderRadius: 10,
                                        background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,179,8,0.04))",
                                        border: "1px solid rgba(245,158,11,0.15)",
                                        justifyContent: "center",
                                    }}>
                                        <span style={{ fontSize: 16 }}>🏆</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e" }}>
                                            {cartao.conquista_destaque}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== SOCIAL LINKS ===== */}
                        {socialLinks.length > 0 && (
                            <div style={{ padding: "20px 28px 0" }}>
                                <p style={{
                                    fontSize: 10, fontWeight: 800, textTransform: "uppercase",
                                    letterSpacing: "1.5px", color: "#94a3b8", marginBottom: 10,
                                    textAlign: "center",
                                }}>
                                    Links & Contato
                                </p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {socialLinks.map((link, i) => (
                                        <SocialButton key={i} {...link} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ===== QR CODE + FOOTER ===== */}
                        <div style={{
                            padding: "24px 28px 28px",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                        }}>
                            {/* Divider */}
                            <div style={{
                                width: 40, height: 3, borderRadius: 2,
                                background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                                marginBottom: 4,
                            }} />

                            {/* QR Code */}
                            <QRCodeImage data={cardShareUrl} size={100} />

                            <p style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "0.5px" }}>
                                Escaneie para acessar o perfil
                            </p>

                            {/* Brand Watermark */}
                            <div style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "6px 14px", borderRadius: 8,
                                background: "#f8fafc",
                            }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", letterSpacing: "0.5px" }}>
                                    CRAQUE<span style={{ color: "#2563eb" }}>PEDIA</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============================
    // EDITOR MODE
    // ============================

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }} className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <Link href="/admin/cartoes" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, fontWeight: 500 }}>
                        <ArrowLeft size={16} /> Voltar aos Cartões
                    </Link>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                        💳 Cartão Digital — {athlete.sport_nickname || athlete.full_name}
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
                                background: "linear-gradient(135deg, #0f172a, #1e40af)",
                                color: "#fff", border: "none", cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.3)",
                            }}
                        >
                            <Wand2 size={16} /> Gerar Automaticamente
                        </button>
                    )}
                    {generated && (
                        <>
                            <button
                                onClick={generateFromAthlete}
                                style={{
                                    display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                                    borderRadius: 10, fontSize: 13, fontWeight: 600,
                                    border: "1.5px solid var(--border-color)", background: "#fff", cursor: "pointer",
                                    color: "var(--text-secondary)",
                                }}
                            >
                                <Wand2 size={16} /> Regenerar
                            </button>
                            <button onClick={saveCartao} disabled={saving} style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                                borderRadius: 10, fontSize: 13, fontWeight: 600,
                                border: "1.5px solid var(--border-color)", background: "#fff", cursor: "pointer",
                            }}>
                                <Save size={16} /> {saving ? "Salvando..." : "Salvar Rascunho"}
                            </button>
                            <button onClick={() => setShowPreview(true)} style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                                borderRadius: 10, fontSize: 13, fontWeight: 700,
                                background: "linear-gradient(135deg, #0f172a, #1e40af)",
                                color: "#fff", border: "none", cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.3)",
                            }}>
                                <Eye size={16} /> Preview do Cartão
                            </button>
                            <button onClick={markAsComplete} disabled={saving} style={{
                                display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                                borderRadius: 10, fontSize: 13, fontWeight: 700,
                                background: "#10b981", color: "#fff", border: "none", cursor: "pointer",
                            }}>
                                <CheckCircle2 size={16} /> Marcar Concluído
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
                    <div style={{
                        width: 80, height: 80, borderRadius: 20,
                        background: "linear-gradient(135deg, #0f172a, #1e40af)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px",
                    }}>
                        <Wand2 size={36} color="#fff" />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Gerar Cartão Digital</h2>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>
                        Os dados do atleta serão usados para preencher o cartão automaticamente. Você poderá editar todos os campos e personalizar antes de finalizar.
                    </p>
                    <button
                        onClick={generateFromAthlete}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                            background: "linear-gradient(135deg, #0f172a, #1e40af)",
                            color: "#fff", border: "none", cursor: "pointer",
                            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.3)",
                        }}
                    >
                        <Wand2 size={20} /> Gerar Cartão com Dados do Atleta
                    </button>
                </div>
            )}

            {/* Editor Form */}
            {generated && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                    {/* Quick Preview Mini */}
                    <div style={{
                        background: "linear-gradient(135deg, #0f172a, #1e3a5f)",
                        borderRadius: 16, padding: "24px 28px",
                        display: "flex", alignItems: "center", gap: 20,
                        color: "#fff",
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: "50%",
                            background: cartao.photo_url ? "transparent" : "linear-gradient(135deg, #2563eb, #7c3aed)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 800, flexShrink: 0, overflow: "hidden",
                            boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
                        }}>
                            {cartao.photo_url ? (
                                <img src={cartao.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                (cartao.nome_esportivo || "?").charAt(0)
                            )}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 2 }}>
                                {cartao.nome_esportivo || cartao.nome_completo || "Atleta"}
                            </h3>
                            <p style={{ fontSize: 13, color: "#94a3b8" }}>
                                {cartao.modalidade}{cartao.posicao ? ` • ${cartao.posicao}` : ""}
                                {cartao.cidade ? ` • ${cartao.cidade}` : ""}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowPreview(true)}
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "10px 18px", borderRadius: 10,
                                background: "rgba(255,255,255,0.1)", color: "#fff",
                                fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.1)",
                                cursor: "pointer", whiteSpace: "nowrap",
                            }}
                        >
                            <Eye size={14} /> Ver Cartão
                        </button>
                    </div>

                    {/* Identidade */}
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <User size={18} color="var(--primary-color)" /> Identidade
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                            <div>
                                <label style={labelStyle}>Nome Esportivo</label>
                                <input style={inputStyle} value={cartao.nome_esportivo} onChange={(e) => updateField("nome_esportivo", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nome Completo</label>
                                <input style={inputStyle} value={cartao.nome_completo} onChange={(e) => updateField("nome_completo", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Modalidade</label>
                                <input style={inputStyle} value={cartao.modalidade} onChange={(e) => updateField("modalidade", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Posição / Categoria</label>
                                <input style={inputStyle} value={cartao.posicao} onChange={(e) => updateField("posicao", e.target.value)} />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>URL da Foto</label>
                                <input style={inputStyle} value={cartao.photo_url} onChange={(e) => updateField("photo_url", e.target.value)} placeholder="https://..." />
                            </div>
                        </div>
                    </div>

                    {/* Localização & Contato */}
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <MapPin size={18} color="var(--primary-color)" /> Localização & Contato
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                            <div>
                                <label style={labelStyle}>Cidade</label>
                                <input style={inputStyle} value={cartao.cidade} onChange={(e) => updateField("cidade", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Estado</label>
                                <input style={inputStyle} value={cartao.estado} onChange={(e) => updateField("estado", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone</label>
                                <input style={inputStyle} value={cartao.telefone} onChange={(e) => updateField("telefone", e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>WhatsApp</label>
                                <input style={inputStyle} value={cartao.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)} placeholder="Número com DDD" />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>E-mail</label>
                                <input style={inputStyle} value={cartao.email} onChange={(e) => updateField("email", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Redes & Links */}
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Share2 size={18} color="var(--primary-color)" /> Redes Sociais & Links
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
                            <div>
                                <label style={labelStyle}>Instagram</label>
                                <input style={inputStyle} value={cartao.instagram} onChange={(e) => updateField("instagram", e.target.value)} placeholder="@usuario" />
                            </div>
                            <div>
                                <label style={labelStyle}>YouTube</label>
                                <input style={inputStyle} value={cartao.youtube} onChange={(e) => updateField("youtube", e.target.value)} placeholder="Canal ou URL" />
                            </div>
                            <div>
                                <label style={labelStyle}>TikTok</label>
                                <input style={inputStyle} value={cartao.tiktok} onChange={(e) => updateField("tiktok", e.target.value)} placeholder="@usuario" />
                            </div>
                            <div>
                                <label style={labelStyle}>Site / Página</label>
                                <input style={inputStyle} value={cartao.site} onChange={(e) => updateField("site", e.target.value)} placeholder="https://..." />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>Portfólio / Link Extra</label>
                                <input style={inputStyle} value={cartao.portfolio_url} onChange={(e) => updateField("portfolio_url", e.target.value)} placeholder="https://..." />
                            </div>
                        </div>
                    </div>

                    {/* Destaque */}
                    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Sparkles size={18} color="#f59e0b" /> Destaque
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Frase Curta / Bio do Cartão</label>
                                <input
                                    style={inputStyle}
                                    value={cartao.bio_curta}
                                    onChange={(e) => updateField("bio_curta", e.target.value)}
                                    placeholder="Ex: Atacante veloz com faro de gol"
                                    maxLength={120}
                                />
                                <p style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 4 }}>
                                    {cartao.bio_curta.length}/120 caracteres
                                </p>
                            </div>
                            <div>
                                <label style={labelStyle}>Conquista em Destaque</label>
                                <input
                                    style={inputStyle}
                                    value={cartao.conquista_destaque}
                                    onChange={(e) => updateField("conquista_destaque", e.target.value)}
                                    placeholder="Ex: Artilheiro do Paulistão 2024"
                                />
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
