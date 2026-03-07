"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Loader2, Eye, ClipboardList } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { STATUS_LABELS, type Submission } from "@/lib/supabase/types";

export default function CadastrosPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");
    const [filterSport, setFilterSport] = useState("todos");

    useEffect(() => {
        async function load() {
            const { data, error } = await supabase
                .from("submissions")
                .select("*")
                .order("created_at", { ascending: false });

            if (data && !error) setSubmissions(data);
            setLoading(false);
        }
        load();
    }, []);

    const sports = Array.from(new Set(submissions.map((s) => s.sport_name)));

    const filtered = submissions.filter((s) => {
        const matchSearch = (s.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.sport_nickname || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === "todos" || s.status === filterStatus;
        const matchSport = filterSport === "todos" || s.sport_name === filterSport;
        return matchSearch && matchStatus && matchSport;
    });

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
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Cadastros Recebidos</h1>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    Formulários enviados por atletas — {submissions.length} cadastro{submissions.length !== 1 ? "s" : ""} no total
                </p>
            </div>

            {/* Filtros */}
            <div style={{
                display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap",
                background: "#fff", padding: "16px 20px", borderRadius: 12,
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
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Filter size={16} color="var(--text-secondary)" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border-color)", fontSize: 13, fontFamily: "inherit" }}
                    >
                        <option value="todos">Todos os Status</option>
                        <option value="pendente">Pendente</option>
                        <option value="em_revisao">Em Revisão</option>
                        <option value="aprovado">Aprovado</option>
                        <option value="rejeitado">Rejeitado</option>
                        <option value="complementar">Complementar</option>
                    </select>
                </div>
                <select
                    value={filterSport}
                    onChange={(e) => setFilterSport(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border-color)", fontSize: 13, fontFamily: "inherit" }}
                >
                    <option value="todos">Todas Modalidades</option>
                    {sports.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Tabela */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid var(--border-color)" }}>
                            <th style={{ textAlign: "left", padding: "14px 20px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Atleta</th>
                            <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Modalidade</th>
                            <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Data</th>
                            <th style={{ textAlign: "left", padding: "14px 16px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Status</th>
                            <th style={{ textAlign: "center", padding: "14px 16px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((sub) => {
                            const statusInfo = STATUS_LABELS[sub.status] || STATUS_LABELS.pendente;
                            return (
                                <tr key={sub.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                    <td style={{ padding: "14px 20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--primary-color)", flexShrink: 0 }}>
                                                {(sub.full_name || "?").charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 14 }}>{sub.full_name}</p>
                                                {sub.sport_nickname && <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{sub.sport_nickname}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 16px", fontSize: 13 }}>{sub.sport_name}</td>
                                    <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-secondary)" }}>
                                        {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{
                                            padding: "4px 12px", borderRadius: 6, fontSize: 11,
                                            fontWeight: 600, background: statusInfo.bg, color: statusInfo.color,
                                        }}>
                                            {statusInfo.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                        <Link
                                            href={`/admin/cadastros/${sub.id}`}
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: 6,
                                                padding: "6px 14px", borderRadius: 8, fontSize: 12,
                                                fontWeight: 600, color: "var(--primary-color)",
                                                background: "rgba(37,99,235,0.08)",
                                            }}
                                        >
                                            <Eye size={14} /> Revisar
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div style={{ padding: 48, textAlign: "center" }}>
                        <ClipboardList size={40} color="var(--text-secondary)" style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Nenhum cadastro encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
