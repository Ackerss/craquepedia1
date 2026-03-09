"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Athlete, Sport, SportField } from "@/lib/supabase/types";

export default function EditarAtletaPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [athlete, setAthlete] = useState<Athlete | null>(null);
    const [sports, setSports] = useState<Sport[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [general, setGeneral] = useState({
        full_name: "", sport_nickname: "", birth_date: "", phone: "", email: "",
        city: "", state: "", status: "ativo" as string,
    });
    const [selectedSportId, setSelectedSportId] = useState<string>("");
    const [generalData, setGeneralData] = useState<Record<string, string>>({});
    const [sportData, setSportData] = useState<Record<string, string | number>>({});
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            const [athleteRes, sportsRes] = await Promise.all([
                supabase.from("athletes").select("*").eq("id", id).single(),
                supabase.from("sports").select("*").order("name"),
            ]);

            if (athleteRes.data) {
                const a = athleteRes.data;
                setAthlete(a);
                setGeneral({
                    full_name: a.full_name || "",
                    sport_nickname: a.sport_nickname || "",
                    birth_date: a.birth_date || "",
                    phone: a.phone || "",
                    email: a.email || "",
                    city: a.city || "",
                    state: a.state || "",
                    status: a.status || "ativo",
                });
                setSelectedSportId(a.sport_id);
                setGeneralData((a.general_data || {}) as Record<string, string>);
                setSportData((a.sport_data || {}) as Record<string, string | number>);
                if (a.photo_url) setPhotoPreview(a.photo_url);
            }
            if (sportsRes.data) setSports(sportsRes.data);
            setLoading(false);
        }
        load();
    }, [id]);

    const handleSave = async () => {
        if (!athlete) return;
        setSaving(true);

        let photoUrl = athlete.photo_url || null;

        // Upload de nova foto se alterada
        if (photoFile) {
            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${Date.now()}_${general.full_name.replace(/\s+/g, '_')}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('athlete-photos')
                .upload(fileName, photoFile, { cacheControl: '3600', upsert: false });
            if (!uploadError) {
                const { data: urlData } = supabase.storage.from('athlete-photos').getPublicUrl(fileName);
                photoUrl = urlData.publicUrl;
            }
        }

        const newSportName = sports.find(s => s.id === selectedSportId)?.name || athlete.sport_name;

        const { error } = await supabase.from("athletes").update({
            full_name: general.full_name,
            sport_nickname: general.sport_nickname,
            birth_date: general.birth_date,
            phone: general.phone,
            email: general.email,
            city: general.city,
            state: general.state,
            status: general.status,
            sport_id: selectedSportId,
            sport_name: newSportName,
            general_data: generalData,
            sport_data: sportData,
            photo_url: photoUrl,
            updated_at: new Date().toISOString(),
        }).eq("id", id);

        setSaving(false);
        if (!error) {
            router.push("/admin/atletas");
        } else {
            alert("Erro: " + error.message);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja excluir este atleta?")) return;
        await supabase.from("athletes").delete().eq("id", id);
        router.push("/admin/atletas");
    };

    if (loading) {
        return (
            <div style={{ padding: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!athlete) {
        return (<div style={{ padding: 48, textAlign: "center" }}><p>Atleta não encontrado.</p><Link href="/admin/atletas">Voltar</Link></div>);
    }

    const currentSport = sports.find((s) => s.id === selectedSportId);
    const specificFields = currentSport?.specific_fields as SportField[] || [];

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "11px 14px", borderRadius: 8, border: "1.5px solid var(--border-color)",
        fontSize: 14, fontFamily: "inherit", outline: "none",
    };
    const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 };

    return (
        <div style={{ padding: "28px 32px", maxWidth: 800, margin: "0 auto" }} className="animate-fade-in">
            <Link href="/admin/atletas" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--primary-color)", marginBottom: 16, fontWeight: 700, padding: "8px 16px", borderRadius: 8, border: "1.5px solid var(--primary-color)", background: "rgba(37,99,235,0.06)", transition: "all 0.2s", textDecoration: "none" }}>
                <ArrowLeft size={16} /> ← Voltar aos Atletas
            </Link>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800 }}>{athlete.sport_nickname || athlete.full_name}</h1>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{athlete.sport_name}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    {general.phone && (() => {
                        const digits = general.phone.replace(/\D/g, "");
                        const whatsNum = digits.startsWith("55") ? digits : (digits.length >= 10 ? "55" + digits : digits);
                        const msg = encodeURIComponent(`Olá ${general.full_name}! 👋\n\nSomos da *CRAQUEPEDIA*. Gostaríamos de conversar sobre o seu perfil esportivo de *${athlete.sport_name}*.\n\nPodemos falar agora?`);
                        return (
                            <a href={`https://wa.me/${whatsNum}?text=${msg}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", background: "#25D366", textDecoration: "none", boxShadow: "0 2px 8px rgba(37,211,102,0.3)" }}>
                                💬 WhatsApp
                            </a>
                        );
                    })()}
                    <button onClick={handleDelete} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#ef4444", border: "1px solid #ef444440", cursor: "pointer", background: "rgba(239,68,68,0.05)" }}>
                        <Trash2 size={14} /> Excluir
                    </button>
                </div>
            </div>

            {/* Dados pessoais */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>👤 Dados Pessoais</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div><label style={labelStyle}>Nome Completo *</label><input style={inputStyle} required value={general.full_name} onChange={(e) => setGeneral({ ...general, full_name: e.target.value })} /></div>
                    <div><label style={labelStyle}>Nome Esportivo</label><input style={inputStyle} value={general.sport_nickname} onChange={(e) => setGeneral({ ...general, sport_nickname: e.target.value })} /></div>
                    <div>
                        <label style={labelStyle}>Data de Nascimento</label>
                        <div style={{ position: "relative" }}>
                            <input style={inputStyle} type="text" inputMode="numeric" placeholder="DD/MM/AAAA" maxLength={10}
                                value={general.birth_date ? (() => {
                                    const parts = general.birth_date.split("-");
                                    return parts.length === 3 && parts[0].length === 4 ? `${parts[2]}/${parts[1]}/${parts[0]}` : general.birth_date;
                                })() : ""}
                                onChange={(e) => {
                                    let v = e.target.value.replace(/\D/g, "");
                                    if (v.length > 8) v = v.slice(0, 8);
                                    if (v.length >= 5) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4);
                                    else if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                                    const match = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
                                    if (match) setGeneral({ ...general, birth_date: `${match[3]}-${match[2]}-${match[1]}` });
                                    else setGeneral({ ...general, birth_date: v });
                                }}
                            />
                            <input type="date" style={{ position: "absolute", right: 0, top: 0, width: 42, height: "100%", opacity: 0, cursor: "pointer" }}
                                value={general.birth_date.match(/^\d{4}-\d{2}-\d{2}$/) ? general.birth_date : ""}
                                onChange={(e) => setGeneral({ ...general, birth_date: e.target.value })}
                            />
                            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: 16 }}>📅</span>
                        </div>
                    </div>
                    <div><label style={labelStyle}>WhatsApp</label><input style={inputStyle} value={general.phone} onChange={(e) => setGeneral({ ...general, phone: e.target.value })} /></div>
                    <div><label style={labelStyle}>E-mail</label><input style={inputStyle} type="email" value={general.email} onChange={(e) => setGeneral({ ...general, email: e.target.value })} /></div>
                    <div><label style={labelStyle}>Cidade</label><input style={inputStyle} value={general.city} onChange={(e) => setGeneral({ ...general, city: e.target.value })} /></div>
                    <div><label style={labelStyle}>Estado</label><input style={inputStyle} value={general.state} onChange={(e) => setGeneral({ ...general, state: e.target.value })} /></div>
                    <div>
                        <label style={labelStyle}>Esporte/Modalidade</label>
                        <select style={inputStyle} value={selectedSportId} onChange={(e) => setSelectedSportId(e.target.value)}>
                            {sports.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Status</label>
                        <select style={inputStyle} value={general.status} onChange={(e) => setGeneral({ ...general, status: e.target.value })}>
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                            <option value="pendente">Pendente</option>
                        </select>
                    </div>
                </div>

                {/* Upload de Foto */}
                <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Foto de Perfil</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4 }}>
                        <div style={{ position: "relative", width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#f1f5f9", border: `2px dashed ${photoPreview ? "var(--primary-color)" : "var(--border-color)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }} onClick={() => document.getElementById('admin-photo-upload')?.click()}>
                            {photoPreview ? (
                                <img src={photoPreview} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <Camera size={24} color="#94a3b8" />
                            )}
                        </div>
                        <div>
                            <button type="button" onClick={() => document.getElementById('admin-photo-upload')?.click()} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "var(--primary-color)", background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.2)", cursor: "pointer" }}>
                                {photoPreview ? "🔄 Trocar Foto" : "📷 Selecionar Foto"}
                            </button>
                            {photoFile && <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4 }}>{photoFile.name}</p>}
                        </div>
                        <input
                            id="admin-photo-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    if (file.size > 5 * 1024 * 1024) { alert("Máximo 5MB."); return; }
                                    setPhotoFile(file);
                                    const reader = new FileReader();
                                    reader.onloadend = () => setPhotoPreview(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Dados gerais */}
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>📋 Informações Gerais</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div><label style={labelStyle}>Instagram</label><input style={inputStyle} value={generalData.instagram || ""} onChange={(e) => setGeneralData({ ...generalData, instagram: e.target.value })} /></div>
                    <div><label style={labelStyle}>Altura</label><input style={inputStyle} value={generalData.altura || ""} onChange={(e) => setGeneralData({ ...generalData, altura: e.target.value })} /></div>
                    <div><label style={labelStyle}>Peso</label><input style={inputStyle} value={generalData.peso || ""} onChange={(e) => setGeneralData({ ...generalData, peso: e.target.value })} /></div>
                </div>
                <div style={{ marginTop: 16 }}>
                    <label style={labelStyle}>Biografia</label>
                    <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={generalData.bio || ""} onChange={(e) => setGeneralData({ ...generalData, bio: e.target.value })} />
                </div>
            </div>

            {/* Campos do esporte */}
            {specificFields.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                        {currentSport?.icon} Dados Técnicos de {currentSport?.name}
                    </h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {specificFields.map((field) => {
                            if (field.type === "select") {
                                return (
                                    <div key={field.key}>
                                        <label style={labelStyle}>{field.label}</label>
                                        <select style={inputStyle} value={String(sportData[field.key] || "")} onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })}>
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
                                        <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={String(sportData[field.key] || "")} onChange={(e) => setSportData({ ...sportData, [field.key]: e.target.value })} />
                                    </div>
                                );
                            }
                            return (
                                <div key={field.key}>
                                    <label style={labelStyle}>{field.label}</label>
                                    <input style={inputStyle} type={field.type === "number" ? "number" : "text"} value={String(sportData[field.key] || "")} onChange={(e) => setSportData({ ...sportData, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })} />
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
                <button onClick={handleSave} disabled={saving} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "14px 28px",
                    background: saving ? "#94a3b8" : "var(--primary-color)", color: "#fff",
                    borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", border: "none",
                }}>
                    {saving ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Salvando...</> : <><Save size={18} /> Salvar Alterações</>}
                </button>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } input:focus, textarea:focus, select:focus { border-color: var(--primary-color) !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important; }`}</style>
        </div>
    );
}
