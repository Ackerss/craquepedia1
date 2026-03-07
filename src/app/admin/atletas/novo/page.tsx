"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Sport, SportField } from "@/lib/supabase/types";
import Link from "next/link";

export default function NovoAtletaPage() {
    const router = useRouter();
    const [sports, setSports] = useState<Sport[]>([]);
    const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [general, setGeneral] = useState({
        full_name: "", sport_nickname: "", birth_date: "", phone: "", email: "",
        city: "", state: "", instagram: "", bio: "", altura: "", peso: "",
    });
    const [sportData, setSportData] = useState<Record<string, string | number>>({});

    useEffect(() => {
        async function load() {
            const { data } = await supabase.from("sports").select("*").order("name");
            if (data) setSports(data);
            setLoading(false);
        }
        load();
    }, []);

    const handleSportChange = (sportId: string) => {
        const sport = sports.find((s) => s.id === sportId) || null;
        setSelectedSport(sport);
        if (sport) {
            const initial: Record<string, string | number> = {};
            (sport.specific_fields as SportField[]).forEach((f) => { initial[f.key] = ""; });
            setSportData(initial);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSport) return;
        setSaving(true);

        const { error } = await supabase.from("athletes").insert({
            sport_id: selectedSport.id,
            sport_name: selectedSport.name,
            full_name: general.full_name,
            sport_nickname: general.sport_nickname || null,
            email: general.email || null,
            phone: general.phone || null,
            birth_date: general.birth_date || null,
            city: general.city || null,
            state: general.state || null,
            general_data: { instagram: general.instagram, bio: general.bio, altura: general.altura, peso: general.peso },
            sport_data: sportData,
            status: "ativo",
        });

        setSaving(false);
        if (!error) router.push("/admin/atletas");
        else alert("Erro ao salvar: " + error.message);
    };

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} /> Carregando...
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "11px 14px", borderRadius: 8, border: "1.5px solid var(--border-color)",
        fontSize: 14, fontFamily: "inherit", outline: "none",
    };
    const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };

    return (
        <div style={{ padding: "28px 32px", maxWidth: 800, margin: "0 auto" }} className="animate-fade-in">
            <Link href="/admin/atletas" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, fontWeight: 500 }}>
                <ArrowLeft size={16} /> Voltar aos atletas
            </Link>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Cadastrar Novo Atleta</h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 28 }}>Preencha os dados para criar um atleta manualmente.</p>

            <form onSubmit={handleSubmit}>
                {/* Modalidade */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏆 Modalidade</h3>
                    <select required value={selectedSport?.id || ""} onChange={(e) => handleSportChange(e.target.value)} style={inputStyle}>
                        <option value="">Selecione o esporte...</option>
                        {sports.map((s) => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                    </select>
                </div>

                {/* Dados pessoais */}
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>👤 Dados Pessoais</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div><label style={labelStyle}>Nome Completo *</label><input style={inputStyle} required value={general.full_name} onChange={(e) => setGeneral({ ...general, full_name: e.target.value })} /></div>
                        <div><label style={labelStyle}>Nome Esportivo</label><input style={inputStyle} value={general.sport_nickname} onChange={(e) => setGeneral({ ...general, sport_nickname: e.target.value })} /></div>
                        <div><label style={labelStyle}>Data de Nascimento</label><input style={inputStyle} type="date" value={general.birth_date} onChange={(e) => setGeneral({ ...general, birth_date: e.target.value })} /></div>
                        <div><label style={labelStyle}>WhatsApp</label><input style={inputStyle} value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} /></div>
                        <div><label style={labelStyle}>E-mail</label><input style={inputStyle} type="email" value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} /></div>
                        <div><label style={labelStyle}>Cidade</label><input style={inputStyle} value={general.city} onChange={(e) => setGeneral({ ...general, city: e.target.value })} /></div>
                        <div><label style={labelStyle}>Estado</label><input style={inputStyle} value={general.state} onChange={(e) => setGeneral({ ...general, state: e.target.value })} /></div>
                        <div><label style={labelStyle}>Altura</label><input style={inputStyle} value={general.altura} onChange={(e) => setGeneral({ ...general, altura: e.target.value })} /></div>
                        <div><label style={labelStyle}>Peso</label><input style={inputStyle} value={general.peso} onChange={(e) => setGeneral({ ...general, peso: e.target.value })} /></div>
                        <div><label style={labelStyle}>Instagram</label><input style={inputStyle} value={general.instagram} onChange={(e) => setGeneral({ ...general, instagram: e.target.value })} /></div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <label style={labelStyle}>Biografia</label>
                        <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={general.bio} onChange={(e) => setGeneral({ ...general, bio: e.target.value })} />
                    </div>
                </div>

                {/* Campos específicos do esporte */}
                {selectedSport && (
                    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                            {selectedSport.icon} Dados de {selectedSport.name}
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {(selectedSport.specific_fields as SportField[]).map((field) => {
                                if (field.type === "select") {
                                    return (
                                        <div key={field.key}>
                                            <label style={labelStyle}>{field.label}</label>
                                            <select style={inputStyle} value={sportData[field.key] || ""} onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })}>
                                                <option value="">Selecione...</option>
                                                {field.options?.map((opt) => <option key={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    );
                                }
                                if (field.type === "textarea") {
                                    return (
                                        <div key={field.key} style={{ gridColumn: "1 / -1" }}>
                                            <label style={labelStyle}>{field.label}</label>
                                            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={sportData[field.key] || ""} onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })} />
                                        </div>
                                    );
                                }
                                return (
                                    <div key={field.key}>
                                        <label style={labelStyle}>{field.label}</label>
                                        <input style={inputStyle} type={field.type === "number" ? "number" : "text"} value={sportData[field.key] || ""} onChange={(e) => setSportData({ ...sportData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <button type="submit" disabled={saving || !selectedSport} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "14px 28px",
                    background: saving || !selectedSport ? "#94a3b8" : "var(--primary-color)",
                    color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15,
                    cursor: saving || !selectedSport ? "not-allowed" : "pointer", border: "none",
                }}>
                    {saving ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</> : <><Save size={18} /> Salvar Atleta</>}
                </button>
            </form>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } input:focus, textarea:focus, select:focus { border-color: var(--primary-color) !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important; }`}</style>
        </div>
    );
}
