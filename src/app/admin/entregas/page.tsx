"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    Loader2, ChevronRight, MessageCircle, Download, Send,
    Eye, ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
    SERVICE_TYPES, SERVICE_STATUS_LABELS,
    type Athlete, type AthleteService, type ServiceType,
} from "@/lib/supabase/types";

interface AthleteWithServices extends Athlete {
    services: AthleteService[];
}

const SERVICE_ORDER: ServiceType[] = ["formulario", "curriculo", "portfolio", "cartao", "video", "youtube"];

// Helper to build whatsapp message for an athlete
function buildWhatsAppDeliveryMessage(athlete: Athlete, services: AthleteService[], origin: string): string {
    const nome = athlete.sport_nickname || athlete.full_name;
    const completedServices = services.filter(s => s.status === "concluido");
    const profileUrl = `${origin}/atletas/${athlete.id}`;

    const lines = [
        `🏆 *CRAQUEPEDIA* — Entrega de Materiais`,
        ``,
        `Olá *${nome}*! Seus materiais estão prontos! 🎉`,
        ``,
    ];

    if (completedServices.length > 0) {
        lines.push(`📦 *Materiais prontos:*`);
        completedServices.forEach(s => {
            const info = SERVICE_TYPES[s.service_type as ServiceType];
            if (info) {
                lines.push(`  ✅ ${info.icon} ${info.label}`);
            }
        });
        lines.push(``);
    }

    // Links diretos
    const hasCartao = services.find(s => s.service_type === "cartao" && s.status === "concluido");
    const hasCurriculo = services.find(s => s.service_type === "curriculo" && s.status === "concluido");

    if (hasCartao || hasCurriculo) {
        lines.push(`🔗 *Acesse aqui:*`);
        lines.push(`${profileUrl}`);
        lines.push(``);
    }

    lines.push(`_Gerado pela Craquepedia_`);

    return lines.filter(l => l !== undefined).join("%0a");
}

function formatWhatsAppUrl(phone: string, message: string): string {
    const digits = phone.replace(/\D/g, "");
    const num = digits.startsWith("55") ? digits : "55" + digits;
    return `https://wa.me/${num}?text=${message}`;
}

export default function EntregasPage() {
    const [athletes, setAthletes] = useState<AthleteWithServices[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedAthlete, setExpandedAthlete] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const [athletesRes, servicesRes] = await Promise.all([
                supabase.from("athletes").select("*").order("full_name"),
                supabase.from("athlete_services").select("*"),
            ]);

            const athletesList = (athletesRes.data || []) as Athlete[];
            const servicesList = (servicesRes.data || []) as AthleteService[];

            const merged: AthleteWithServices[] = athletesList.map((a) => ({
                ...a,
                services: servicesList.filter((s) => s.athlete_id === a.id),
            }));

            setAthletes(merged);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Carregando...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Calcular progresso global
    const totalServices = athletes.reduce((acc, a) => acc + a.services.length, 0);
    const completedServices = athletes.reduce((acc, a) => acc + a.services.filter((s) => s.status === "concluido").length, 0);
    const progressPercent = totalServices > 0 ? Math.round((completedServices / totalServices) * 100) : 0;

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }} className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>✅ Entregas / Status Geral</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    Visão completa de todos os atletas e o progresso de cada serviço. Envie materiais diretamente pelo WhatsApp.
                </p>
            </div>

            {/* Progresso Global */}
            <div style={{
                background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)",
                padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 20,
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>Progresso Geral</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "var(--primary-color)" }}>{progressPercent}%</span>
                    </div>
                    <div style={{ height: 8, background: "var(--bg-app)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                            width: `${progressPercent}%`, height: "100%",
                            background: "linear-gradient(90deg, var(--primary-color), #10b981)",
                            borderRadius: 4, transition: "width 0.5s ease",
                        }} />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>
                        {completedServices} de {totalServices} serviços concluídos
                    </p>
                </div>
            </div>

            {/* Tabela Esteira */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", overflow: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                            <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", position: "sticky", left: 0, background: "#fff", zIndex: 1 }}>
                                Atleta
                            </th>
                            {SERVICE_ORDER.map((type) => (
                                <th key={type} style={{ textAlign: "center", padding: "14px 12px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", minWidth: 100 }}>
                                    {SERVICE_TYPES[type].icon} {SERVICE_TYPES[type].label}
                                </th>
                            ))}
                            <th style={{ textAlign: "center", padding: "14px 12px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                                Progresso
                            </th>
                            <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {athletes.map((athlete) => {
                            const totalA = athlete.services.length;
                            const completedA = athlete.services.filter((s) => s.status === "concluido").length;
                            const pct = totalA > 0 ? Math.round((completedA / totalA) * 100) : 0;
                            const isExpanded = expandedAthlete === athlete.id;
                            const hasPhone = !!athlete.phone;
                            const hasCompleted = completedA > 0;

                            return (
                                <React.Fragment key={athlete.id}>
                                    <tr style={{ borderBottom: isExpanded ? "none" : "1px solid var(--border-color)" }}>
                                        <td style={{ padding: "12px 20px", position: "sticky", left: 0, background: "#fff", zIndex: 1 }}>
                                            <Link href={`/admin/atletas/${athlete.id}/editar`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
                                                <div style={{
                                                    width: 34, height: 34, borderRadius: "50%",
                                                    background: athlete.photo_url ? "transparent" : "linear-gradient(135deg, var(--primary-color), #7c3aed)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
                                                    overflow: "hidden",
                                                }}>
                                                    {athlete.photo_url ? (
                                                        <img src={athlete.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        athlete.full_name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 600, fontSize: 13 }}>{athlete.sport_nickname || athlete.full_name}</p>
                                                    <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{athlete.sport_name}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        {SERVICE_ORDER.map((type) => {
                                            const service = athlete.services.find((s) => s.service_type === type);
                                            const status = service?.status || "pendente";
                                            const info = SERVICE_STATUS_LABELS[status as keyof typeof SERVICE_STATUS_LABELS];
                                            return (
                                                <td key={type} style={{ textAlign: "center", padding: "12px 8px" }}>
                                                    <span style={{
                                                        padding: "4px 10px", borderRadius: 6, fontSize: 10,
                                                        fontWeight: 600, background: info.bg, color: info.color,
                                                        whiteSpace: "nowrap",
                                                    }}>
                                                        {info.label}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                        <td style={{ textAlign: "center", padding: "12px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                                                <div style={{ width: 60, height: 6, background: "var(--bg-app)", borderRadius: 3, overflow: "hidden" }}>
                                                    <div style={{
                                                        width: `${pct}%`, height: "100%",
                                                        background: pct === 100 ? "#10b981" : "var(--primary-color)",
                                                        borderRadius: 3,
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: pct === 100 ? "#10b981" : "var(--text-secondary)" }}>
                                                    {pct}%
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "center", padding: "12px 16px" }}>
                                            <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                                                <button
                                                    onClick={() => setExpandedAthlete(isExpanded ? null : athlete.id)}
                                                    style={{
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        padding: "6px 12px", borderRadius: 6, fontSize: 11,
                                                        fontWeight: 600, border: "1px solid var(--border-color)",
                                                        background: isExpanded ? "var(--primary-color)" : "#fff",
                                                        color: isExpanded ? "#fff" : "var(--text-secondary)",
                                                        cursor: "pointer", transition: "0.2s",
                                                    }}
                                                >
                                                    <Send size={12} /> Entregar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Expanded Delivery Panel */}
                                    {isExpanded && (
                                        <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                                            <td colSpan={SERVICE_ORDER.length + 3} style={{ padding: 0 }}>
                                                <div style={{
                                                    background: "linear-gradient(135deg, #f8fafc, #f1f5f9)",
                                                    padding: "20px 24px",
                                                    borderTop: "1px dashed var(--border-color)",
                                                }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                                                        <div>
                                                            <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                                                                📦 Entregar materiais para {athlete.sport_nickname || athlete.full_name}
                                                            </h4>
                                                            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                                                {hasPhone ? `📱 ${athlete.phone}` : "⚠️ Sem telefone cadastrado"}
                                                                {athlete.email ? ` • 📧 ${athlete.email}` : ""}
                                                            </p>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                            {/* WhatsApp - enviar tudo de uma vez */}
                                                            {hasPhone && hasCompleted && (
                                                                <a
                                                                    href={formatWhatsAppUrl(
                                                                        athlete.phone!,
                                                                        buildWhatsAppDeliveryMessage(athlete, athlete.services, origin)
                                                                    )}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        display: "flex", alignItems: "center", gap: 6,
                                                                        padding: "8px 16px", borderRadius: 8,
                                                                        background: "#25d366", color: "#fff",
                                                                        fontSize: 12, fontWeight: 700,
                                                                        textDecoration: "none", transition: "0.2s",
                                                                    }}
                                                                >
                                                                    <MessageCircle size={14} /> Enviar Tudo via WhatsApp
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Service-specific actions */}
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
                                                        {athlete.services.map((service) => {
                                                            const info = SERVICE_TYPES[service.service_type as ServiceType];
                                                            const statusInfo = SERVICE_STATUS_LABELS[service.status as keyof typeof SERVICE_STATUS_LABELS];
                                                            if (!info) return null;

                                                            const isCartao = service.service_type === "cartao";
                                                            const isCurriculo = service.service_type === "curriculo";
                                                            const isCompleted = service.status === "concluido";

                                                            return (
                                                                <div key={service.id} style={{
                                                                    background: "#fff", borderRadius: 10,
                                                                    border: "1px solid var(--border-color)",
                                                                    padding: "14px 16px",
                                                                    display: "flex", flexDirection: "column", gap: 10,
                                                                }}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                        <span style={{ fontSize: 13, fontWeight: 700 }}>
                                                                            {info.icon} {info.label}
                                                                        </span>
                                                                        <span style={{
                                                                            padding: "3px 8px", borderRadius: 6, fontSize: 10,
                                                                            fontWeight: 600, background: statusInfo.bg, color: statusInfo.color,
                                                                        }}>
                                                                            {statusInfo.label}
                                                                        </span>
                                                                    </div>

                                                                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                                        {/* Link para abrir o serviço */}
                                                                        {isCartao && (
                                                                            <Link
                                                                                href={`/admin/cartoes/${athlete.id}`}
                                                                                style={{
                                                                                    display: "flex", alignItems: "center", gap: 4,
                                                                                    padding: "5px 10px", borderRadius: 6, fontSize: 11,
                                                                                    fontWeight: 600, background: "linear-gradient(135deg, #0f172a, #1e40af)",
                                                                                    color: "#fff", textDecoration: "none",
                                                                                }}
                                                                            >
                                                                                <Eye size={11} /> Abrir
                                                                            </Link>
                                                                        )}
                                                                        {isCurriculo && (
                                                                            <Link
                                                                                href={`/admin/curriculos/${athlete.id}`}
                                                                                style={{
                                                                                    display: "flex", alignItems: "center", gap: 4,
                                                                                    padding: "5px 10px", borderRadius: 6, fontSize: 11,
                                                                                    fontWeight: 600, background: "linear-gradient(135deg, #0f172a, #1e40af)",
                                                                                    color: "#fff", textDecoration: "none",
                                                                                }}
                                                                            >
                                                                                <Eye size={11} /> Abrir
                                                                            </Link>
                                                                        )}

                                                                        {/* WhatsApp individual por serviço */}
                                                                        {hasPhone && isCompleted && (
                                                                            <a
                                                                                href={formatWhatsAppUrl(
                                                                                    athlete.phone!,
                                                                                    [
                                                                                        `🏆 *CRAQUEPEDIA*`,
                                                                                        ``,
                                                                                        `Olá *${athlete.sport_nickname || athlete.full_name}*!`,
                                                                                        `Seu material *${info.label}* está pronto! ✅`,
                                                                                        ``,
                                                                                        `🔗 Acesse: ${origin}/atletas/${athlete.id}`,
                                                                                        ``,
                                                                                        `_Craquepedia_`,
                                                                                    ].join("%0a")
                                                                                )}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                style={{
                                                                                    display: "flex", alignItems: "center", gap: 4,
                                                                                    padding: "5px 10px", borderRadius: 6, fontSize: 11,
                                                                                    fontWeight: 600, background: "#25d366", color: "#fff",
                                                                                    textDecoration: "none",
                                                                                }}
                                                                            >
                                                                                <MessageCircle size={11} /> WhatsApp
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {athletes.length === 0 && (
                    <div style={{ padding: 48, textAlign: "center" }}>
                        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Nenhum atleta cadastrado ainda.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
