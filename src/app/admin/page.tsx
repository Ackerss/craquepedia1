"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ClipboardList, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { STATUS_LABELS } from "@/lib/supabase/types";

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
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            const [athletesRes, subsRes, recentRes] = await Promise.all([
                supabase.from("athletes").select("id, sport_name", { count: "exact" }),
                supabase.from("submissions").select("id, status, sport_name", { count: "exact" }),
                supabase.from("submissions").select("id, full_name, sport_name, status, created_at").order("created_at", { ascending: false }).limit(8),
            ]);

            const submissions = subsRes.data || [];
            const athletes = athletesRes.data || [];

            // Sport counts from athletes
            const sportMap: Record<string, number> = {};
            athletes.forEach((a) => {
                sportMap[a.sport_name] = (sportMap[a.sport_name] || 0) + 1;
            });
            const sportCounts = Object.entries(sportMap).map(([sport_name, count]) => ({ sport_name, count })).sort((a, b) => b.count - a.count);

            setStats({
                totalAthletes: athletesRes.count || 0,
                totalSubmissions: subsRes.count || 0,
                pendingSubmissions: submissions.filter((s) => s.status === "pendente" || s.status === "complementar").length,
                approvedSubmissions: submissions.filter((s) => s.status === "aprovado").length,
                rejectedSubmissions: submissions.filter((s) => s.status === "rejeitado").length,
                sportCounts,
                recentSubmissions: recentRes.data || [],
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
