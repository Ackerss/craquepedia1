"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { ATLETAS } from "@/data/mockData";

type MaterialKey = "curriculo" | "portfolio" | "cartaoDigital" | "videoHighlight" | "bannerRedes";

const MATERIAL_CONFIG: Record<MaterialKey, { label: string; emoji: string; desc: string; bg: string }> = {
    curriculo: { label: "Currículo Esportivo", emoji: "📄", desc: "PDF profissional com histórico completo", bg: "rgba(59, 130, 246, 0.1)" },
    portfolio: { label: "Portfólio Digital", emoji: "🎨", desc: "Página web com fotos, vídeos e conquistas", bg: "rgba(139, 92, 246, 0.1)" },
    cartaoDigital: { label: "Cartão Digital", emoji: "💳", desc: "Linktree esportivo com QR Code", bg: "rgba(16, 185, 129, 0.1)" },
    videoHighlight: { label: "Vídeo Highlight", emoji: "🎬", desc: "Compilação de melhores momentos", bg: "rgba(249, 115, 22, 0.1)" },
    bannerRedes: { label: "Banner para Redes", emoji: "📱", desc: "Arte para Instagram, Twitter e Facebook", bg: "rgba(236, 72, 153, 0.1)" },
};

const FILTROS = ["Todos", "Gerado", "Em Produção", "Pendente"];

const COLORS: Record<string, string> = {
    Futebol: "#10b981", Futsal: "#3b82f6", Vôlei: "#f59e0b",
    Basquete: "#f97316", Tênis: "#8b5cf6", "MMA/Lutas": "#ef4444",
    Natação: "#06b6d4", Atletismo: "#84cc16", Judô: "#eab308",
};

function getMaterialStatus(done: boolean, etapa: string): string {
    if (done) return "Gerado";
    if (etapa === "Formulário Recebido" || etapa === "Em Cadastro") return "Pendente";
    return "Em Produção";
}

export default function EntregasPage() {
    const [filtro, setFiltro] = useState("Todos");

    const allMateriais = ATLETAS.flatMap((at) =>
        (Object.keys(at.materiaisEntregues) as MaterialKey[]).map((key) => ({
            atletaId: at.id,
            atletaNome: at.nomeEsportivo,
            atletaSport: at.sport,
            atletaAvatar: at.avatar,
            materialKey: key,
            done: at.materiaisEntregues[key],
            status: getMaterialStatus(at.materiaisEntregues[key], at.pipelineEtapa),
        }))
    );

    const totalGerados = allMateriais.filter((m) => m.status === "Gerado").length;
    const totalProducao = allMateriais.filter((m) => m.status === "Em Produção").length;
    const totalPendente = allMateriais.filter((m) => m.status === "Pendente").length;

    return (
        <div className="page-container animate-fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 className="page-title">Central de Entregas</h1>
                    <p className="page-subtitle">
                        Visão geral de todos os materiais gerados para cada atleta.
                    </p>
                </div>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "var(--accent-color)" }}>{totalGerados}</div>
                    <div className={styles.statLabel}>Materiais Gerados</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "var(--warning-color)" }}>{totalProducao}</div>
                    <div className={styles.statLabel}>Em Produção</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "var(--text-secondary)" }}>{totalPendente}</div>
                    <div className={styles.statLabel}>Pendentes</div>
                </div>
            </div>

            <div className={styles.filtersRow}>
                {FILTROS.map((f) => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filtro === f ? styles.filterBtnActive : ""}`}
                        onClick={() => setFiltro(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {ATLETAS.map((atleta) => {
                const materiais = (Object.keys(atleta.materiaisEntregues) as MaterialKey[]).map((key) => ({
                    key,
                    ...MATERIAL_CONFIG[key],
                    done: atleta.materiaisEntregues[key],
                    status: getMaterialStatus(atleta.materiaisEntregues[key], atleta.pipelineEtapa),
                }));

                const filtered = filtro === "Todos" ? materiais : materiais.filter((m) => m.status === filtro);
                if (filtered.length === 0) return null;

                return (
                    <div key={atleta.id} className={styles.atletaSection}>
                        <div className={styles.atletaHeader}>
                            <div className={styles.atletaAvatar} style={{ backgroundColor: COLORS[atleta.sport] || "#64748b" }}>
                                {atleta.avatar}
                            </div>
                            <div className={styles.atletaHeaderInfo}>
                                <h3>{atleta.nomeEsportivo}</h3>
                                <span>{atleta.sport} • {atleta.pos}</span>
                            </div>
                        </div>
                        <div className={styles.grid}>
                            {filtered.map((mat) => (
                                <div key={mat.key} className={styles.entregaCard}>
                                    <div className={styles.entregaIcon} style={{ backgroundColor: mat.bg }}>
                                        {mat.emoji}
                                    </div>
                                    <div className={styles.entregaTitle}>{mat.label}</div>
                                    <div className={styles.entregaDesc}>{mat.desc}</div>
                                    <div className={styles.entregaFooter}>
                                        <span
                                            className={`${styles.statusTag} ${mat.status === "Gerado"
                                                    ? styles.gerado
                                                    : mat.status === "Em Produção"
                                                        ? styles.emprodução
                                                        : styles.pendente2
                                                }`}
                                        >
                                            {mat.status === "Gerado" ? "✅ Gerado" : mat.status === "Em Produção" ? "🔄 Em Produção" : "⏳ Pendente"}
                                        </span>
                                        {mat.done && <button className={styles.actionBtn}>Baixar</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
