"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardList, CheckCircle, AlertCircle, Loader2, ArrowRight, FileText, Palette, CreditCard, Video } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { STATUS_LABELS, SERVICE_TYPES, type ServiceType } from "@/lib/supabase/types";

interface DashboardStats {
    totalAthletes: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    sportCounts: { sport_name: string; count: number }[];
    recentSubmissions: {
        id: string;
        full_name: string;
        sport_name: string;
        status: string;
        created_at: string;
    }[];
    serviceCounts: Record<string, { total: number; pendente: number; em_andamento: number; concluido: number }>;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            const [athletesRes, subsRes, recentRes, servicesRes] = await Promise.all([
                supabase.from("athletes").select("id, sport_name", { count: "exact" }),
                supabase.from("submissions").select("id, status, sport_name", { count: "exact" }),
                supabase.from("submissions").select("id, full_name, sport_name, status, created_at").order("created_at", { ascending: false }).limit(8),
                supabase.from("athlete_services").select("service_type, status"),
            ]);

            const submissions = subsRes.data || [];
            const athletes = athletesRes.data || [];
            const services = servicesRes.data || [];

            // Sport counts from athletes
            const sportMap: Record<string, number> = {};
            athletes.forEach((a) => {
                sportMap[a.sport_name] = (sportMap[a.sport_name] || 0) + 1;
            });
            const sportCounts = Object.entries(sportMap).map(([sport_name, count]) => ({ sport_name, count })).sort((a, b) => b.count - a.count);

            // Service counts
            const serviceCounts: Record<string, { total: number; pendente: number; em_andamento: number; concluido: number }> = {};
            services.forEach((s) => {
                if (!serviceCounts[s.service_type]) {
                    serviceCounts[s.service_type] = { total: 0, pendente: 0, em_andamento: 0, concluido: 0 };
                }
                serviceCounts[s.service_type].total++;
                if (s.status === "pendente") serviceCounts[s.service_type].pendente++;
                else if (s.status === "em_andamento") serviceCounts[s.service_type].em_andamento++;
                else if (s.status === "concluido") serviceCounts[s.service_type].concluido++;
            });

            setStats({
                totalAthletes: athletesRes.count || 0,
                totalSubmissions: subsRes.count || 0,
                pendingSubmissions: submissions.filter((s) => s.status === "pendente" || s.status === "complementar").length,
                approvedSubmissions: submissions.filter((s) => s.status === "aprovado").length,
                rejectedSubmissions: submissions.filter((s) => s.status === "rejeitado").length,
                sportCounts,
                recentSubmissions: recentRes.data || [],
                serviceCounts,
            });
            setLoading(false);
        }
        loadStats();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Carregando dashboard...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        { label: "Atletas Oficiais", value: stats.totalAthletes, icon: Users, color: "#2563eb", bg: "rgba(37,99,235,0.1)" },
        { label: "Cadastros Recebidos", value: stats.totalSubmissions, icon: ClipboardList, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
        { label: "Pendentes", value: stats.pendingSubmissions, icon: AlertCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
        { label: "Aprovados", value: stats.approvedSubmissions, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    ];

    const serviceIcons: Record<string, React.ReactNode> = {
        curriculo: <FileText size={16} />,
        portfolio: <Palette size={16} />,
        cartao: <CreditCard size={16} />,
        video: <Video size={16} />,
    };

    const serviceLinks: Record<string, string> = {
        curriculo: "/admin/curriculos",
        portfolio: "/admin/portfolios",
        cartao: "/admin/cartoes",
        video: "/admin/videos",
    };

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }} className="animate-fade-in">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Dashboard</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    Visão geral da plataforma Craquepedia
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
                {statCards.map((card, idx) => (
                    <div key={idx} style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", display: "flex", alignItems: "center", gap: 16, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", color: card.color }}>
                            <card.icon size={22} />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 2 }}>{card.label}</p>
                            <h3 style={{ fontSize: 28, fontWeight: 800 }}>{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Progresso dos Serviços */}
            <div style={{ background: "#fff", borderRadius: 14, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", overflow: "hidden", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid var(--border-color)" }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>📊 Progresso dos Serviços</h3>
                    <Link href="/admin/entregas" style={{ fontSize: 12, color: "var(--primary-color)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        Ver detalhes <ArrowRight size={14} />
                    </Link>
                </div>
                <div style={{ padding: "16px 24px" }}>
                    {(["curriculo", "portfolio", "cartao", "video"] as ServiceType[]).map((type) => {
                        const data = stats.serviceCounts[type] || { total: 0, pendente: 0, em_andamento: 0, concluido: 0 };
                        const pct = data.total > 0 ? Math.round((data.concluido / data.total) * 100) : 0;
                        return (
                            <Link key={type} href={serviceLinks[type]} style={{ textDecoration: "none", color: "inherit" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: "1px solid #f8fafc" }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(37,99,235,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color)" }}>
                                        {serviceIcons[type]}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{SERVICE_TYPES[type].label}</span>
                                            <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                                                <span style={{ color: "#f59e0b" }}>🟡 {data.pendente}</span>
                                                <span style={{ color: "#3b82f6" }}>🔵 {data.em_andamento}</span>
                                                <span style={{ color: "#10b981" }}>✅ {data.concluido}</span>
                                            </div>
                                        </div>
                                        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{
                                                width: `${pct}%`, height: "100%",
                                                background: pct === 100 ? "#10b981" : "var(--primary-color)",
                                                borderRadius: 3, transition: "width 0.5s",
                                            }} />
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 800, color: pct === 100 ? "#10b981" : "var(--primary-color)", minWidth: 40, textAlign: "right" }}>
                                        {pct}%
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
                {/* Últimos cadastros */}
                <div style={{ background: "#fff", borderRadius: 14, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid var(--border-color)" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>📋 Últimos Cadastros Recebidos</h3>
                        <Link href="/admin/cadastros" style={{ fontSize: 12, color: "var(--primary-color)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            Ver todos <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div>
                        {stats.recentSubmissions.map((sub) => {
                            const statusInfo = STATUS_LABELS[sub.status] || STATUS_LABELS.pendente;
                            return (
                                <Link
                                    key={sub.id}
                                    href={`/admin/cadastros/${sub.id}`}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "14px 24px",
                                        borderBottom: "1px solid var(--border-color)",
                                        textDecoration: "none",
                                        color: "inherit",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-app)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--primary-color)" }}>
                                            {(sub.full_name || "?").charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: 14 }}>{sub.full_name}</p>
                                            <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{sub.sport_name}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <span style={{
                                            padding: "4px 10px",
                                            borderRadius: 6,
                                            fontSize: 11,
                                            fontWeight: 600,
                                            background: statusInfo.bg,
                                            color: statusInfo.color,
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                                            {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                        {stats.recentSubmissions.length === 0 && (
                            <p style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                                Nenhum cadastro recebido ainda.
                            </p>
                        )}
                    </div>
                </div>

                {/* Por modalidade */}
                <div style={{ background: "#fff", borderRadius: 14, boxShadow: "var(--shadow-sm)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-color)" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏆 Atletas por Modalidade</h3>
                    </div>
                    <div style={{ padding: "8px 0" }}>
                        {stats.sportCounts.map((s) => (
                            <div key={s.sport_name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px" }}>
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{s.sport_name}</span>
                                <span style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-color)" }}>{s.count}</span>
                            </div>
                        ))}
                        {stats.sportCounts.length === 0 && (
                            <p style={{ padding: 24, textAlign: "center", color: "var(--text-secondary)", fontSize: 14 }}>
                                Nenhum atleta cadastrado ainda.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
