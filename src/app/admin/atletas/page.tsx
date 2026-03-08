"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Plus, Loader2, Users, MapPin, Eye, Instagram, Trash2, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { STATUS_LABELS, type Athlete } from "@/lib/supabase/types";

export default function AtletasPage() {
    const [athletes, setAthletes] = useState<Athlete[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSport, setFilterSport] = useState("todos");
    const [filterStatus, setFilterStatus] = useState("todos");
    const [deleteTarget, setDeleteTarget] = useState<Athlete | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!deleteTarget || deleteConfirmText !== "EXCLUIR") return;
        setDeleting(true);
        try {
            // Deleta serviços vinculados primeiro
            await supabase.from("athlete_services").delete().eq("athlete_id", deleteTarget.id);
            // Deleta o atleta
            await supabase.from("athletes").delete().eq("id", deleteTarget.id);
            setAthletes(prev => prev.filter(a => a.id !== deleteTarget.id));
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
                .from("athletes")
                .select("*")
                .order("created_at", { ascending: false });

            if (data && !error) setAthletes(data);
            setLoading(false);
        }
        load();
    }, []);

    const sports = Array.from(new Set(athletes.map((a) => a.sport_name)));

    const filtered = athletes.filter((a) => {
        const matchSearch =
            a.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.sport_nickname || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchSport = filterSport === "todos" || a.sport_name === filterSport;
        const matchStatus = filterStatus === "todos" || a.status === filterStatus;
        return matchSearch && matchSport && matchStatus;
    });

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Carregando atletas...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }} className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Atletas</h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                        {athletes.length} atleta{athletes.length !== 1 ? "s" : ""} cadastrado{athletes.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <Link href="/admin/atletas/novo" style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                    background: "var(--primary-color)", color: "#fff", borderRadius: 10,
                    fontSize: 14, fontWeight: 600, textDecoration: "none",
                }}>
                    <Plus size={16} /> Cadastrar Atleta
                </Link>
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
                <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border-color)", fontSize: 13, fontFamily: "inherit" }}>
                    <option value="todos">Todas Modalidades</option>
                    {sports.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid var(--border-color)", fontSize: 13, fontFamily: "inherit" }}>
                    <option value="todos">Todos os Status</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="pendente">Pendente</option>
                </select>
            </div>

            {/* Grid de Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {filtered.map((athlete) => {
                    const generalData = (athlete.general_data || {}) as Record<string, string>;
                    const statusInfo = STATUS_LABELS[athlete.status] || STATUS_LABELS.ativo;
                    return (
                        <Link
                            key={athlete.id}
                            href={`/admin/atletas/${athlete.id}/editar`}
                            style={{
                                background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)",
                                padding: 20, textDecoration: "none", color: "inherit",
                                transition: "all 0.2s", cursor: "pointer",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: "50%",
                                    background: "linear-gradient(135deg, var(--primary-color), #7c3aed)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#fff", fontWeight: 700, fontSize: 18, flexShrink: 0,
                                }}>
                                    {athlete.full_name.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                                        {athlete.sport_nickname || athlete.full_name}
                                    </h3>
                                    <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                        {athlete.sport_name}
                                    </p>
                                </div>
                                <span style={{
                                    padding: "4px 10px", borderRadius: 6, fontSize: 11,
                                    fontWeight: 600, background: statusInfo.bg, color: statusInfo.color,
                                }}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "var(--text-secondary)" }}>
                                {(athlete.city || athlete.state) && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <MapPin size={14} /> {athlete.city}{athlete.state ? `, ${athlete.state}` : ""}
                                    </div>
                                )}
                                {generalData.instagram && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <Instagram size={14} /> {generalData.instagram}
                                    </div>
                                )}
                            </div>
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                                    Cadastrado em {new Date(athlete.created_at).toLocaleDateString("pt-BR")}
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(athlete); }}
                                        title="Excluir atleta"
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.05)", color: "#ef4444", cursor: "pointer", transition: "all 0.2s", fontSize: 0 }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary-color)", display: "flex", alignItems: "center", gap: 4 }}>
                                        <Eye size={14} /> Ver / Editar
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ padding: 48, textAlign: "center", background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)" }}>
                    <Users size={40} color="var(--text-secondary)" style={{ marginBottom: 12, opacity: 0.5 }} />
                    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Nenhum atleta encontrado.</p>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
            {deleteTarget && (
                <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 32, maxWidth: 440, width: "90%", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <AlertTriangle size={20} color="#ef4444" />
                                </div>
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Excluir Atleta</h3>
                            </div>
                            <button onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
                        </div>
                        <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 8 }}>
                            Você está prestes a excluir permanentemente o atleta:
                        </p>
                        <p style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 16, padding: "10px 14px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                            {deleteTarget.sport_nickname || deleteTarget.full_name}
                        </p>
                        <p style={{ fontSize: 13, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>
                            ⚠️ Esta ação é irreversível. Todos os serviços vinculados serão excluídos.
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
