"use client";

import React from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ATLETAS, PIPELINE_ETAPAS, getAtletasByPipelineEtapa } from "@/data/mockData";
import type { PipelineEtapa } from "@/data/mockData";

const COLORS_BY_SPORT: Record<string, string> = {
    Futebol: "#10b981",
    Futsal: "#3b82f6",
    Vôlei: "#f59e0b",
    Basquete: "#f97316",
    Tênis: "#8b5cf6",
    "MMA/Lutas": "#ef4444",
    Natação: "#06b6d4",
    Atletismo: "#84cc16",
    Judô: "#eab308",
};

export default function FluxoAtletaPage() {
    const totalAtletas = ATLETAS.length;
    const prontos = ATLETAS.filter((a) => a.pipelineEtapa === "Pronto").length;
    const progressoPct = Math.round((prontos / totalAtletas) * 100);

    return (
        <div className="page-container animate-fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 className="page-title">Fluxo do Atleta</h1>
                    <p className="page-subtitle">
                        Visualize a jornada completa de cada atleta dentro do projeto Craquepedia.
                    </p>
                </div>
            </div>

            {/* Resumo do Pipeline */}
            <div className={styles.summaryRow}>
                {PIPELINE_ETAPAS.map((pe) => {
                    const count = getAtletasByPipelineEtapa(pe.etapa).length;
                    return (
                        <div className={styles.summaryCard} key={pe.etapa}>
                            <span className={styles.summaryEmoji}>{pe.icon}</span>
                            <div className={styles.summaryInfo}>
                                <span className={styles.summaryValue}>{count}</span>
                                <span className={styles.summaryLabel}>{pe.etapa}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Barra de Progresso Geral */}
            <div className={styles.progressBarContainer}>
                <div className={styles.progressTitle}>
                    <span className={styles.progressLabel}>
                        Progresso Geral — {prontos} de {totalAtletas} atletas prontos
                    </span>
                    <span className={styles.progressPercent}>{progressoPct}%</span>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progressoPct}%` }} />
                </div>
            </div>

            {/* Legenda */}
            <div className={styles.legendRow}>
                {Object.entries(COLORS_BY_SPORT).map(([sport, color]) => (
                    <div key={sport} className={styles.legendItem}>
                        <div className={styles.legendDot} style={{ backgroundColor: color }} />
                        {sport}
                    </div>
                ))}
            </div>

            {/* Pipeline Kanban */}
            <div className={styles.pipelineContainer}>
                {PIPELINE_ETAPAS.map((pe) => {
                    const atletas = getAtletasByPipelineEtapa(pe.etapa);
                    return (
                        <div key={pe.etapa} className={styles.pipelineColumn}>
                            <div className={styles.columnHeader}>
                                <div className={styles.columnTitleWrap}>
                                    <span className={styles.columnEmoji}>{pe.icon}</span>
                                    <span className={styles.columnTitle}>{pe.etapa}</span>
                                </div>
                                <span className={styles.columnCount}>{atletas.length}</span>
                            </div>
                            <div className={styles.columnCards}>
                                {atletas.length === 0 ? (
                                    <div className={styles.emptyColumn}>Nenhum atleta nesta etapa</div>
                                ) : (
                                    atletas.map((atleta) => (
                                        <Link href={`/atletas/${atleta.id}`} key={atleta.id} className={styles.pipelineCard}>
                                            <div className={styles.cardTop}>
                                                <div
                                                    className={styles.cardAvatar}
                                                    style={{ backgroundColor: COLORS_BY_SPORT[atleta.sport] || "#64748b" }}
                                                >
                                                    {atleta.avatar}
                                                </div>
                                                <div>
                                                    <div className={styles.cardName}>{atleta.nomeEsportivo}</div>
                                                    <div className={styles.cardSport}>
                                                        {atleta.sport} • {atleta.pos}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.cardMeta}>
                                                <span className={styles.cardMetaItem}>
                                                    <MapPin size={12} /> {atleta.location}
                                                </span>
                                            </div>
                                            <div className={styles.cardStatusRow}>
                                                <span
                                                    className={`${styles.statusBadge} ${styles[atleta.status.toLowerCase().replace(/\s/g, "")]}`}
                                                >
                                                    {atleta.status}
                                                </span>
                                                <span className={styles.viewLink}>Ver perfil →</span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
