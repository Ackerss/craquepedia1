"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
    SERVICE_STATUS_LABELS,
    type ServiceType,
    type ServiceStatus,
    type AthleteServiceWithAthlete,
} from "@/lib/supabase/types";

interface ServicePageProps {
    serviceType: ServiceType;
    title: string;
    subtitle: string;
    icon: string;
    /** Se true, mostra link para a página de detalhe do serviço */
    hasDetailPage?: boolean;
    /** Renderiza conteúdo extra no card de cada atleta */
    renderExtra?: (service: AthleteServiceWithAthlete) => React.ReactNode;
}

export default function ServiceListPage({
    serviceType,
    title,
    subtitle,
    icon,
    hasDetailPage = false,
    renderExtra,
}: ServicePageProps) {
    const [services, setServices] = useState<AthleteServiceWithAthlete[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("todos");

    useEffect(() => {
        async function load() {
            const { data, error } = await supabase
                .from("athlete_services")
                .select("*, athletes(id, full_name, sport_nickname, sport_name, city, state, photo_url)")
                .eq("service_type", serviceType)
                .order("updated_at", { ascending: false });

            if (data && !error) {
                setServices(data as unknown as AthleteServiceWithAthlete[]);
            }
            setLoading(false);
        }
        load();
    }, [serviceType]);

    const updateServiceStatus = async (serviceId: string, newStatus: ServiceStatus) => {
        const { error } = await supabase
            .from("athlete_services")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", serviceId);

        if (!error) {
            setServices((prev) =>
                prev.map((s) => (s.id === serviceId ? { ...s, status: newStatus } : s))
            );
        }
    };

    const filtered = services.filter((s) => {
        const athlete = s.athletes;
        const matchSearch =
            (athlete?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (athlete?.sport_nickname || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === "todos" || s.status === filterStatus;
        return matchSearch && matchStatus;
    });

    // Agrupar por status
    const grouped = {
        pendente: filtered.filter((s) => s.status === "pendente"),
        em_andamento: filtered.filter((s) => s.status === "em_andamento"),
        concluido: filtered.filter((s) => s.status === "concluido"),
        nao_aplicavel: filtered.filter((s) => s.status === "nao_aplicavel"),
    };

    const counts = {
        pendente: services.filter((s) => s.status === "pendente").length,
        em_andamento: services.filter((s) => s.status === "em_andamento").length,
        concluido: services.filter((s) => s.status === "concluido").length,
        total: services.length,
    };

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Carregando...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }} className="animate-fade-in">
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
                    {icon} {title}
                </h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{subtitle}</p>
            </div>

            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
                {[
                    { label: "Total", value: counts.total, color: "#64748b", bg: "rgba(100,116,139,0.1)" },
                    { label: "Pendentes", value: counts.pendente, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                    { label: "Em Andamento", value: counts.em_andamento, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
                    { label: "Concluídos", value: counts.concluido, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                ].map((stat) => (
                    <div key={stat.label} style={{
                        background: "#fff", borderRadius: 12, padding: "16px 20px",
                        border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 14,
                    }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div style={{
                display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap",
                background: "#fff", padding: "14px 18px", borderRadius: 12,
                border: "1px solid var(--border-color)",
            }}>
                <div style={{ position: "relative", flex: "1 1 280px" }}>
                    <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
                    <input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nome..."
                        style={{
                            width: "100%", padding: "10px 14px 10px 40px", borderRadius: 8,
                            border: "1.5px solid var(--border-color)", fontSize: 14, fontFamily: "inherit", outline: "none",
                        }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border-color)", fontSize: 13, fontFamily: "inherit" }}
                >
                    <option value="todos">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="nao_aplicavel">N/A</option>
                </select>
            </div>

            {/* Lista por Status */}
            {(["pendente", "em_andamento", "concluido", "nao_aplicavel"] as ServiceStatus[]).map((statusKey) => {
                const items = grouped[statusKey];
                if (items.length === 0 && filterStatus !== "todos" && filterStatus !== statusKey) return null;
                if (items.length === 0) return null;
                const statusInfo = SERVICE_STATUS_LABELS[statusKey];

                return (
                    <div key={statusKey} style={{ marginBottom: 28 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                            <span style={{
                                width: 10, height: 10, borderRadius: "50%",
                                background: statusInfo.color, display: "inline-block",
                            }} />
                            <h3 style={{ fontSize: 15, fontWeight: 700 }}>
                                {statusInfo.label} ({items.length})
                            </h3>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                            {items.map((service) => {
                                const athlete = service.athletes;
                                if (!athlete) return null;
                                return (
                                    <div
                                        key={service.id}
                                        style={{
                                            background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)",
                                            padding: 20, transition: "all 0.2s",
                                        }}
                                    >
                                        {/* Athlete Info */}
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                                            <div style={{
                                                width: 42, height: 42, borderRadius: "50%",
                                                background: athlete.photo_url ? "transparent" : "linear-gradient(135deg, var(--primary-color), #7c3aed)",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
                                                overflow: "hidden",
                                            }}>
                                                {athlete.photo_url ? (
                                                    <img src={athlete.photo_url} alt={athlete.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    athlete.full_name.charAt(0)
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                                                    {athlete.sport_nickname || athlete.full_name}
                                                </h4>
                                                <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                                    {athlete.sport_name} {athlete.city ? `• ${athlete.city}` : ""}
                                                </p>
                                            </div>
                                            <span style={{
                                                padding: "4px 10px", borderRadius: 6, fontSize: 11,
                                                fontWeight: 600, background: statusInfo.bg, color: statusInfo.color,
                                            }}>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        {/* Extra content */}
                                        {renderExtra && renderExtra(service)}

                                        {/* Actions */}
                                        <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-color)", flexWrap: "wrap" }}>
                                            {statusKey === "pendente" && (
                                                <button
                                                    onClick={() => updateServiceStatus(service.id, "em_andamento")}
                                                    style={{
                                                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                        background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "none", cursor: "pointer",
                                                    }}
                                                >
                                                    ▶ Iniciar
                                                </button>
                                            )}
                                            {statusKey === "em_andamento" && (
                                                <button
                                                    onClick={() => updateServiceStatus(service.id, "concluido")}
                                                    style={{
                                                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                        background: "rgba(16,185,129,0.1)", color: "#10b981", border: "none", cursor: "pointer",
                                                    }}
                                                >
                                                    ✅ Concluir
                                                </button>
                                            )}
                                            {statusKey === "concluido" && (
                                                <button
                                                    onClick={() => updateServiceStatus(service.id, "em_andamento")}
                                                    style={{
                                                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                        background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "none", cursor: "pointer",
                                                    }}
                                                >
                                                    ↩ Reabrir
                                                </button>
                                            )}
                                            {hasDetailPage && (
                                                <Link
                                                    href={`/admin/${serviceType === "curriculo" ? "curriculos" : serviceType === "portfolio" ? "portfolios" : serviceType === "cartao" ? "cartoes" : "videos"}/${athlete.id}`}
                                                    style={{
                                                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                                        color: "var(--primary-color)", background: "rgba(37,99,235,0.08)",
                                                        display: "inline-flex", alignItems: "center", gap: 4, marginLeft: "auto",
                                                    }}
                                                >
                                                    Abrir <ArrowRight size={14} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {filtered.length === 0 && (
                <div style={{ padding: 48, textAlign: "center", background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)" }}>
                    <p style={{ fontSize: 40, marginBottom: 8 }}>{icon}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Nenhum atleta encontrado.</p>
                </div>
            )}
        </div>
    );
}
