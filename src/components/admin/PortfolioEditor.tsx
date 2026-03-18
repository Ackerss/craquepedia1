"use client";

import React from "react";
import { Plus, Trash2, Image as ImageIcon, Youtube, Activity, Clock, User, Palette, Sparkles, Trophy, Contact, FileText } from "lucide-react";
import type { PortfolioData } from "../../app/admin/portfolios/[id]/page";

interface PortfolioEditorProps {
    data: PortfolioData;
    onChange: (newData: PortfolioData) => void;
    onGenerateBio?: () => void;
}

export default function PortfolioEditor({ data, onChange, onGenerateBio }: PortfolioEditorProps) {
    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 14px", borderRadius: 8,
        border: "1.5px solid var(--border-color)", fontSize: 13,
        fontFamily: "inherit", outline: "none", background: "#fff"
    };
    const labelStyle: React.CSSProperties = {
        display: "block", fontSize: 11, fontWeight: 700,
        color: "var(--text-secondary)", marginBottom: 4, textTransform: "uppercase"
    };
    const sectionStyle: React.CSSProperties = {
        background: "#fff", borderRadius: 16, border: "1px solid var(--border-color)", padding: 24, marginBottom: 20
    };
    const headerStyle: React.CSSProperties = {
        fontSize: 16, fontWeight: 800, marginBottom: 20, display: "flex", alignItems: "center", gap: 8, color: "#0f172a"
    };

    const updateHero = (field: keyof PortfolioData["hero"], value: string) => {
        onChange({ ...data, hero: { ...data.hero, [field]: value } });
    };

    const updateArray = <K extends keyof PortfolioData>(field: K, index: number, itemField: string, value: string) => {
        const newArr = [...(data[field] as Record<string, unknown>[])];
        newArr[index] = { ...newArr[index], [itemField]: value };
        onChange({ ...data, [field]: newArr });
    };

    const removeFromArray = (field: keyof PortfolioData, index: number) => {
        const newArr = [...(data[field] as Record<string, unknown>[])];
        newArr.splice(index, 1);
        onChange({ ...data, [field]: newArr });
    };

    const addToArray = (field: keyof PortfolioData, newItem: Record<string, unknown>) => {
        onChange({ ...data, [field]: [...((data[field] as Record<string, unknown>[]) || []), newItem] });
    };

    const updateContacts = (field: keyof NonNullable<PortfolioData["contacts"]>, value: string) => {
        const currentContacts = data.contacts || { instagram: "", youtube: "", phone: "", email: "" };
        onChange({ ...data, contacts: { ...currentContacts, [field]: value } });
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* CONFIGURAÇÕES GLOBAIS */}
            <div style={sectionStyle}>
                <h3 style={headerStyle}><Palette size={18} color="#7c3aed" /> Configurações de Design</h3>
                <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1, maxWidth: 400 }}>
                        <label style={labelStyle}>Tema Visual Público</label>
                        <select 
                            style={inputStyle} 
                            value={data.theme || "default"} 
                            onChange={e => onChange({ ...data, theme: e.target.value as "default" | "pro-dark" })}
                        >
                            <option value="default">Padrão (Clean & Objetivo)</option>
                            <option value="pro-dark">Premium Impacto (Dark / Cards Flutuantes / Estilo Canva)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* HERÓI / CABEÇALHO */}
            <div style={sectionStyle}>
                <h3 style={headerStyle}><User size={18} color="var(--primary-color)" /> Bloco Principal (Hero)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
                    <div>
                        <label style={labelStyle}>Nome Esportivo (Título)</label>
                        <input style={inputStyle} value={data.hero.title} onChange={e => updateHero("title", e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Subtítulo (Esporte / Posição)</label>
                        <input style={inputStyle} value={data.hero.subtitle} onChange={e => updateHero("subtitle", e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>URL Foto de Perfil (Recortada/Transparente)</label>
                        <input style={inputStyle} value={data.hero.avatarUrl} onChange={e => updateHero("avatarUrl", e.target.value)} placeholder="https://..." />
                    </div>
                    <div>
                        <label style={labelStyle}>URL Imagem de Fundo (Cover)</label>
                        <input style={inputStyle} value={data.hero.coverUrl} onChange={e => updateHero("coverUrl", e.target.value)} placeholder="https://..." />
                    </div>
                    <div style={{ gridColumn: "1 / -1", position: "relative" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>Frase de Efeito / Biografia (Quote)</label>
                            {onGenerateBio && (
                                <button 
                                    onClick={onGenerateBio} 
                                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #ec4899)", color: "#fff", border: "none", cursor: "pointer" }}
                                >
                                    <Sparkles size={12} /> Sintetizar Biografia de Impacto
                                </button>
                            )}
                        </div>
                        <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={data.hero.quote} onChange={e => updateHero("quote", e.target.value)} placeholder="Resumo e introdução detalhada da história do atleta..." />
                    </div>
                </div>
            </div>

            {/* RESUMO PROFISSIONAL */}
            <div style={sectionStyle}>
                <h3 style={headerStyle}><FileText size={18} color="#0ea5e9" /> Resumo Profissional</h3>
                <textarea 
                    style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} 
                    value={data.professional_summary || ""} 
                    onChange={e => onChange({ ...data, professional_summary: e.target.value })} 
                    placeholder="Bio completa e profissional do atleta..." 
                />
            </div>

            {/* CONQUISTAS E TÍTULOS */}
            <div style={sectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ ...headerStyle, marginBottom: 0 }}><Trophy size={18} color="#f59e0b" /> Conquistas e Títulos</h3>
                    <button onClick={() => addToArray("achievements", { id: Date.now().toString(), year: "", title: "", description: "" })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", cursor: "pointer" }}>
                        <Plus size={14} /> Adicionar
                    </button>
                </div>
                {(!data.achievements || data.achievements.length === 0) && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhuma conquista adicionada.</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {(data.achievements || []).map((ach, idx) => (
                        <div key={ach.id} style={{ display: "flex", gap: 16, background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                            <div style={{ width: 80 }}>
                                <label style={labelStyle}>Ano</label>
                                <input style={inputStyle} value={ach.year} onChange={e => updateArray("achievements", idx, "year", e.target.value)} placeholder="2024" />
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                                <div>
                                    <label style={labelStyle}>Título da Conquista</label>
                                    <input style={inputStyle} value={ach.title} onChange={e => updateArray("achievements", idx, "title", e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Detalhes</label>
                                    <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={ach.description || ""} onChange={e => updateArray("achievements", idx, "description", e.target.value)} />
                                </div>
                            </div>
                            <button onClick={() => removeFromArray("achievements", idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", height: "fit-content", marginTop: 24 }}><Trash2 size={18} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* CONTATOS */}
            <div style={sectionStyle}>
                <h3 style={headerStyle}><Contact size={18} color="#10b981" /> Contatos e Redes</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
                    <div>
                        <label style={labelStyle}>Instagram (Arroba ou Link)</label>
                        <input style={inputStyle} value={data.contacts?.instagram || ""} onChange={e => updateContacts("instagram", e.target.value)} placeholder="@atleta" />
                    </div>
                    <div>
                        <label style={labelStyle}>YouTube (Canal ou Vídeo Principal)</label>
                        <input style={inputStyle} value={data.contacts?.youtube || ""} onChange={e => updateContacts("youtube", e.target.value)} placeholder="https://youtube.com/..." />
                    </div>
                    <div>
                        <label style={labelStyle}>Telefone / WhatsApp</label>
                        <input style={inputStyle} value={data.contacts?.phone || ""} onChange={e => updateContacts("phone", e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>E-mail de Contato</label>
                        <input style={inputStyle} value={data.contacts?.email || ""} onChange={e => updateContacts("email", e.target.value)} />
                    </div>
                </div>
            </div>

            {/* ATRIBUTOS TÉCNICOS */}
            <div style={sectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ ...headerStyle, marginBottom: 0 }}><Activity size={18} color="#f59e0b" /> Atributos em Destaque</h3>
                    <button onClick={() => addToArray("attributes", { id: Date.now().toString(), label: "", value: "" })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", cursor: "pointer" }}>
                        <Plus size={14} /> Adicionar
                    </button>
                </div>
                {data.attributes.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhum atributo cadastrado.</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
                    {data.attributes.map((attr, idx) => (
                        <div key={attr.id} style={{ display: "flex", gap: 8, background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                            <div style={{ flex: 1 }}>
                                <input style={{ ...inputStyle, marginBottom: 8, padding: "6px 10px", fontSize: 12 }} placeholder="Ex: Chute" value={attr.label} onChange={e => updateArray("attributes", idx, "label", e.target.value)} />
                                <input style={{ ...inputStyle, padding: "6px 10px", fontSize: 12, fontWeight: "bold" }} placeholder="Ex: 95 / Excelente" value={attr.value} onChange={e => updateArray("attributes", idx, "value", e.target.value)} />
                            </div>
                            <button onClick={() => removeFromArray("attributes", idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* HISTÓRICO / LINHA DO TEMPO */}
            <div style={sectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ ...headerStyle, marginBottom: 0 }}><Clock size={18} color="#8b5cf6" /> Histórico / Linha do Tempo</h3>
                    <button onClick={() => addToArray("history", { id: Date.now().toString(), year: "", title: "", subtitle: "", description: "" })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", cursor: "pointer" }}>
                        <Plus size={14} /> Adicionar
                    </button>
                </div>
                {data.history.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhum item no histórico.</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {data.history.map((hist, idx) => (
                        <div key={hist.id} style={{ display: "flex", gap: 16, background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0" }}>
                            <div style={{ width: 80 }}>
                                <label style={labelStyle}>Ano</label>
                                <input style={inputStyle} value={hist.year} onChange={e => updateArray("history", idx, "year", e.target.value)} placeholder="2024" />
                            </div>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={labelStyle}>Título (Clube, Campeonato)</label>
                                        <input style={inputStyle} value={hist.title} onChange={e => updateArray("history", idx, "title", e.target.value)} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={labelStyle}>Subtítulo (Posição / Prêmio)</label>
                                        <input style={inputStyle} value={hist.subtitle} onChange={e => updateArray("history", idx, "subtitle", e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Descrição Extensa</label>
                                    <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={hist.description} onChange={e => updateArray("history", idx, "description", e.target.value)} />
                                </div>
                            </div>
                            <button onClick={() => removeFromArray("history", idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", height: "fit-content", marginTop: 24 }}><Trash2 size={18} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* GALERIA DE VÍDEOS */}
            <div style={sectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ ...headerStyle, marginBottom: 0 }}><Youtube size={18} color="#ef4444" /> Galeria de Vídeos</h3>
                    <button onClick={() => addToArray("videos", { id: Date.now().toString(), url: "", title: "" })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", cursor: "pointer" }}>
                        <Plus size={14} /> Adicionar
                    </button>
                </div>
                {data.videos.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhum vídeo adicionado.</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {data.videos.map((vid, idx) => (
                        <div key={vid.id} style={{ display: "flex", gap: 8, background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                            <div style={{ flex: 1 }}>
                                <input style={{ ...inputStyle, marginBottom: 8, padding: "6px 10px", fontSize: 12 }} placeholder="Título do Vídeo" value={vid.title} onChange={e => updateArray("videos", idx, "title", e.target.value)} />
                                <input style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }} placeholder="URL (YouTube, Vimeo...)" value={vid.url} onChange={e => updateArray("videos", idx, "url", e.target.value)} />
                            </div>
                            <button onClick={() => removeFromArray("videos", idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* GALERIA DE IMAGENS */}
            <div style={sectionStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <h3 style={{ ...headerStyle, marginBottom: 0 }}><ImageIcon size={18} color="#10b981" /> Galeria de Imagens</h3>
                    <button onClick={() => addToArray("gallery", { id: Date.now().toString(), url: "", caption: "" })} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: "rgba(37,99,235,0.1)", color: "#2563eb", border: "none", cursor: "pointer" }}>
                        <Plus size={14} /> Adicionar
                    </button>
                </div>
                {data.gallery.length === 0 && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Nenhuma imagem adicionada.</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {data.gallery.map((img, idx) => (
                        <div key={img.id} style={{ display: "flex", gap: 12, background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", alignItems: "center" }}>
                            <div style={{ width: 60, height: 60, borderRadius: 6, background: "#e2e8f0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {img.url ? <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={20} color="#94a3b8" />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <input style={{ ...inputStyle, marginBottom: 8, padding: "6px 10px", fontSize: 12 }} placeholder="URL da Imagem" value={img.url} onChange={e => updateArray("gallery", idx, "url", e.target.value)} />
                                <input style={{ ...inputStyle, padding: "6px 10px", fontSize: 12 }} placeholder="Legenda (Texto Alternativo)" value={img.caption} onChange={e => updateArray("gallery", idx, "caption", e.target.value)} />
                            </div>
                            <button onClick={() => removeFromArray("gallery", idx)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 4 }}><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
