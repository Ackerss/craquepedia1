"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, Loader2, CheckCircle, XCircle, AlertTriangle,
    Edit, MessageSquare, User, Phone, Mail, MapPin, Calendar,
    Instagram, FileText, Activity, Save
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { STATUS_LABELS, type Submission } from "@/lib/supabase/types";

export default function RevisaoCadastroPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [submission, setSubmission] = useState<Submission | null>(null);
    const [sportSchema, setSportSchema] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [notes, setNotes] = useState("");
    const [editData, setEditData] = useState<Partial<Submission>>({});

    useEffect(() => {
        async function load() {
            const { data: subData, error: subErr } = await supabase
                .from("submissions")
                .select("*")
                .eq("id", id)
                .single();

            if (subData && !subErr) {
                setSubmission(subData);
                setNotes(subData.admin_notes || "");
                setEditData(subData);

                // Load the specific sport schema
                const { data: sportData } = await supabase
                    .from("sports")
                    .select("specific_fields")
                    .eq("id", subData.sport_id)
                    .single();
                if (sportData) {
                    setSportSchema(sportData.specific_fields || []);
                }
            }
            setLoading(false);
        }
        load();
    }, [id]);

    const updateStatus = async (newStatus: string) => {
        setSaving(true);
        const { error } = await supabase
            .from("submissions")
            .update({
                status: newStatus,
                admin_notes: notes,
                reviewed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (!error) {
            // Se aprovado, criar atleta automaticamente
            if (newStatus === "aprovado" && submission) {
                await supabase.from("athletes").insert({
                    submission_id: submission.id,
                    sport_id: submission.sport_id,
                    sport_name: submission.sport_name,
                    full_name: submission.full_name,
                    sport_nickname: submission.sport_nickname,
                    email: submission.email,
                    phone: submission.phone,
                    birth_date: submission.birth_date,
                    city: submission.city,
                    state: submission.state,
                    general_data: submission.general_data,
                    sport_data: submission.sport_data,
                    status: "ativo",
                });
            }
            setSubmission({ ...submission!, status: newStatus as Submission["status"], admin_notes: notes });
        }
        setSaving(false);
    };

    const saveEdits = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("submissions")
            .update({
                full_name: editData.full_name,
                sport_nickname: editData.sport_nickname,
                email: editData.email,
                phone: editData.phone,
                birth_date: editData.birth_date,
                city: editData.city,
                state: editData.state,
                general_data: editData.general_data,
                sport_data: editData.sport_data,
                admin_notes: notes,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (!error) {
            setSubmission({ ...submission!, ...editData, admin_notes: notes });
            setEditMode(false);
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Carregando cadastro...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!submission) {
        return (
            <div style={{ padding: 48, textAlign: "center" }}>
                <p>Cadastro não encontrado.</p>
                <Link href="/admin/cadastros">Voltar</Link>
            </div>
        );
    }

    const statusInfo = STATUS_LABELS[submission.status] || STATUS_LABELS.pendente;
    const generalData = (submission.general_data || {}) as Record<string, string>;
    const sportData = (submission.sport_data || {}) as Record<string, unknown>;

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 14px", borderRadius: 8,
        border: "1.5px solid var(--border-color)", fontSize: 13,
        fontFamily: "inherit", outline: "none", background: editMode ? "#fff" : "#f8fafc",
    };

    const renderField = (label: string, value: string | undefined, key?: string, editable?: boolean) => (
        <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
            {editMode && editable ? (
                <input
                    style={inputStyle}
                    value={value || ""}
                    onChange={(e) => {
                        if (key) setEditData({ ...editData, [key]: e.target.value });
                    }}
                />
            ) : (
                <p style={{ fontSize: 14, fontWeight: 500, color: value ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    {value || "—"}
                </p>
            )}
        </div>
    );

    return (
        <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }} className="animate-fade-in">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
                <div>
                    <Link href="/admin/cadastros" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", marginBottom: 12, fontWeight: 500 }}>
                        <ArrowLeft size={16} /> Voltar aos cadastros
                    </Link>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{submission.full_name}</h1>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{submission.sport_name}</span>
                        <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: statusInfo.bg, color: statusInfo.color }}>
                            {statusInfo.label}
                        </span>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                            Recebido em {new Date(submission.created_at).toLocaleDateString("pt-BR")}
                        </span>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {!editMode ? (
                        <button onClick={() => setEditMode(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "1.5px solid var(--border-color)", background: "#fff", cursor: "pointer" }}>
                            <Edit size={16} /> Editar
                        </button>
                    ) : (
                        <button onClick={saveEdits} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, background: "var(--primary-color)", color: "#fff", cursor: "pointer", border: "none" }}>
                            <Save size={16} /> {saving ? "Salvando..." : "Salvar Edições"}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
                {/* Dados do cadastro */}
                <div>
                    {/* Dados Pessoais */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <User size={18} color="var(--primary-color)" /> Dados Pessoais
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                            {renderField("Nome Completo", editMode ? editData.full_name : submission.full_name, "full_name", true)}
                            {renderField("Nome Esportivo", editMode ? editData.sport_nickname : submission.sport_nickname, "sport_nickname", true)}
                            {renderField("Data de Nascimento", submission.birth_date || "")}
                            {renderField("Altura", generalData.altura)}
                            {renderField("Peso", generalData.peso)}
                            {renderField("Responsável", generalData.responsavel)}
                        </div>
                    </div>

                    {/* Contato */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Phone size={18} color="var(--primary-color)" /> Contato
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                            {renderField("WhatsApp", editMode ? editData.phone : submission.phone, "phone", true)}
                            {renderField("E-mail", editMode ? editData.email : submission.email, "email", true)}
                            {renderField("Cidade", editMode ? editData.city : submission.city, "city", true)}
                            {renderField("Estado", editMode ? editData.state : submission.state, "state", true)}
                        </div>
                    </div>

                    {/* Redes sociais */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Instagram size={18} color="var(--primary-color)" /> Redes & Bio
                        </h3>
                        {renderField("Instagram", generalData.instagram)}
                        {renderField("Outras Redes", generalData.outras_redes)}
                        {renderField("Biografia", generalData.bio)}
                        {renderField("Histórico Esportivo", generalData.historico_esportivo)}
                        {renderField("Conquistas", generalData.conquistas)}
                        {renderField("Links de Vídeo", generalData.links_video)}
                    </div>

                    {/* Dados do esporte */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Activity size={18} color="var(--primary-color)" /> Dados de {submission.sport_name}
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                            {sportSchema.length > 0 ? sportSchema.map((field) => (
                                <div key={field.key} style={{ marginBottom: 12, gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto' }}>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase" }}>
                                        {field.label}
                                    </label>
                                    {editMode ? (
                                        field.type === 'textarea' ? (
                                            <textarea
                                                style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                                                value={String((editData.sport_data as any)?.[field.key] || "")}
                                                onChange={(e) => setEditData({ ...editData, sport_data: { ...(editData.sport_data as any), [field.key]: e.target.value } })}
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                style={inputStyle}
                                                value={String((editData.sport_data as any)?.[field.key] || "")}
                                                onChange={(e) => setEditData({ ...editData, sport_data: { ...(editData.sport_data as any), [field.key]: e.target.value } })}
                                            >
                                                <option value="">Selecione...</option>
                                                {field.options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        ) : (
                                            <input
                                                style={inputStyle}
                                                type={field.type === "number" ? "number" : "text"}
                                                value={String((editData.sport_data as any)?.[field.key] || "")}
                                                onChange={(e) => setEditData({ ...editData, sport_data: { ...(editData.sport_data as any), [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value } })}
                                            />
                                        )
                                    ) : (
                                        <p style={{ fontSize: 14, fontWeight: 500 }}>
                                            {Array.isArray(sportData[field.key]) ? (sportData[field.key] as string[]).join(", ") : String(sportData[field.key] || "—")}
                                        </p>
                                    )}
                                </div>
                            )) : Object.entries(sportData).map(([key, value]) => (
                                <div key={key} style={{ marginBottom: 12 }}>
                                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase" }}>
                                        {key.replace(/_/g, " ")}
                                    </label>
                                    <p style={{ fontSize: 14, fontWeight: 500 }}>
                                        {Array.isArray(value) ? value.join(", ") : String(value || "—")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div>
                    {/* Ações */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Ações</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <button
                                onClick={() => updateStatus("aprovado")}
                                disabled={saving || submission.status === "aprovado"}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "12px 16px", borderRadius: 10, fontSize: 13,
                                    fontWeight: 600, border: "none", cursor: "pointer",
                                    background: submission.status === "aprovado" ? "#e2e8f0" : "#10b981",
                                    color: submission.status === "aprovado" ? "var(--text-secondary)" : "#fff",
                                    width: "100%", justifyContent: "center",
                                }}
                            >
                                <CheckCircle size={16} /> {submission.status === "aprovado" ? "Já Aprovado" : "Aprovar Cadastro"}
                            </button>
                            <button
                                onClick={() => updateStatus("em_revisao")}
                                disabled={saving}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "12px 16px", borderRadius: 10, fontSize: 13,
                                    fontWeight: 600, border: "1.5px solid var(--border-color)",
                                    cursor: "pointer", background: "#fff", color: "var(--primary-color)",
                                    width: "100%", justifyContent: "center",
                                }}
                            >
                                <Edit size={16} /> Marcar como Em Revisão
                            </button>
                            <button
                                onClick={() => updateStatus("complementar")}
                                disabled={saving}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "12px 16px", borderRadius: 10, fontSize: 13,
                                    fontWeight: 600, border: "1.5px solid #f59e0b",
                                    cursor: "pointer", background: "rgba(245,158,11,0.08)", color: "#f59e0b",
                                    width: "100%", justifyContent: "center",
                                }}
                            >
                                <AlertTriangle size={16} /> Pedir Complemento
                            </button>
                            <button
                                onClick={() => { if (confirm("Tem certeza que deseja rejeitar?")) updateStatus("rejeitado"); }}
                                disabled={saving}
                                style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    padding: "12px 16px", borderRadius: 10, fontSize: 13,
                                    fontWeight: 600, border: "1.5px solid #ef4444",
                                    cursor: "pointer", background: "rgba(239,68,68,0.08)", color: "#ef4444",
                                    width: "100%", justifyContent: "center",
                                }}
                            >
                                <XCircle size={16} /> Rejeitar
                            </button>
                        </div>
                    </div>

                    {/* Notas */}
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                            <MessageSquare size={16} /> Notas Internas
                        </h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{
                                width: "100%", padding: "12px 14px", borderRadius: 8,
                                border: "1.5px solid var(--border-color)", fontSize: 13,
                                fontFamily: "inherit", minHeight: 120, resize: "vertical",
                                outline: "none",
                            }}
                            placeholder="Adicione notas de revisão aqui..."
                        />
                        <button
                            onClick={async () => {
                                await supabase.from("submissions").update({ admin_notes: notes, updated_at: new Date().toISOString() }).eq("id", id);
                                setSubmission({ ...submission, admin_notes: notes });
                            }}
                            style={{
                                marginTop: 8, padding: "8px 16px", borderRadius: 8,
                                fontSize: 12, fontWeight: 600, border: "none",
                                background: "var(--bg-app)", cursor: "pointer",
                            }}
                        >
                            Salvar Notas
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
