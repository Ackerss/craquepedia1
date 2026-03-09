"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Loader2, Eye, ClipboardList, Trash2, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { STATUS_LABELS, type Submission } from "@/lib/supabase/types";

const SPORT_EMOJI: Record<string, string> = {
    "futebol": "⚽", "futsal": "⚽", "futebol / futsal": "⚽",
    "basquete": "🏀", "vôlei": "🏐", "volei": "🏐",
    "tênis": "🎾", "tenis": "🎾", "natação": "🏊", "natacao": "🏊",
    "atletismo": "🏃", "ciclismo": "🚴", "surf": "🏄",
    "ginástica": "🤸", "ginastica": "🤸", "handebol": "🤾",
    "artes marciais": "🥋", "jiu-jitsu": "🥋", "judô": "🥋", "karate": "🥋",
    "boxe": "🥊", "mma": "🥊", "muay thai": "🥊",
    "golfe": "⛳", "rugby": "🏉", "beisebol": "⚾",
    "esgrima": "🤺", "skate": "🛹", "snowboard": "🏂",
    "hóquei": "🏒", "polo aquático": "🤽", "remo": "🚣",
    "escalada": "🧗", "tênis de mesa": "🏓", "badminton": "🏸",
};
function getSportEmoji(name: string): string {
    if (!name) return "🏅";
    const key = name.toLowerCase().trim();
    if (SPORT_EMOJI[key]) return SPORT_EMOJI[key];
    for (const [sport, emoji] of Object.entries(SPORT_EMOJI)) {
        if (key.includes(sport) || sport.includes(key)) return emoji;
    }
    return "🏅";
}

export default function CadastrosPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");
    const [filterSport, setFilterSport] = useState("todos");
    const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteTarget || deleteConfirmText !== "EXCLUIR") return;
        setDeleting(true);
        try {
            await supabase.from("submissions").delete().eq("id", deleteTarget.id);
            setSubmissions(prev => prev.filter(s => s.id !== deleteTarget.id));
        } catch (err) {
            console.error("Erro ao excluir:", err);
        } finally {
            setDeleteTarget(null);
            setDeleteConfirmText("");
            setDeleting(false);
        }
    };

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
                    <option value="todos">🏅 Todas Modalidades</option>
                    {sports.map((s) => <option key={s} value={s}>{getSportEmoji(s)} {s}</option>)}
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
                                            <div style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: (sub as unknown as Record<string, unknown>).photo_url ? "transparent" : "var(--bg-app)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "var(--primary-color)", flexShrink: 0, overflow: "hidden" }}>
                                                {(sub as unknown as Record<string, unknown>).photo_url ? (
                                                    <img src={(sub as unknown as Record<string, unknown>).photo_url as string} alt={sub.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    (sub.full_name || "?").charAt(0)
                                                )}
                                                {!!(sub as unknown as Record<string, unknown>).photo_url && (
                                                    <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderRadius: "50%", background: "#10b981", border: "2px solid #fff" }} title="Tem foto" />
                                                )}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 600, fontSize: 14 }}>{sub.full_name}</p>
                                                {sub.sport_nickname && <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{sub.sport_nickname}</p>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 16px", fontSize: 13 }}>{getSportEmoji(sub.sport_name)} {sub.sport_name}</td>
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
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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
                                            <button
                                                onClick={() => setDeleteTarget(sub)}
                                                title="Excluir cadastro"
                                                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "#ef4444", cursor: "pointer", transition: "all 0.2s", fontSize: 0 }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
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

            {/* Modal de Confirmação de Exclusão */}
            {deleteTarget && (
                <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 440, width: "90%", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <AlertTriangle size={20} color="#ef4444" />
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Excluir Cadastro</h3>
                            </div>
                            <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                        </div>
                        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 8 }}>
                            Você está prestes a excluir permanentemente o cadastro de:
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                            {deleteTarget.full_name} ({deleteTarget.sport_name})
                        </p>
                        <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>
                            ⚠️ Esta ação é irreversível.
                        </p>
                        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
                            Digite <strong>EXCLUIR</strong> para confirmar:
                        </p>
                        <input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Digite EXCLUIR"
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border-color)", fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 20 }}
                            autoFocus
                        />
                        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                            <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--border-color)", background: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteConfirmText !== "EXCLUIR" || deleting}
                                style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: deleteConfirmText === "EXCLUIR" ? "#ef4444" : "#e2e8f0", color: deleteConfirmText === "EXCLUIR" ? "#fff" : "#94a3b8", fontSize: 13, fontWeight: 700, cursor: deleteConfirmText === "EXCLUIR" ? "pointer" : "not-allowed", transition: "all 0.2s" }}
                            >
                                {deleting ? "Excluindo..." : "Excluir Permanentemente"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
