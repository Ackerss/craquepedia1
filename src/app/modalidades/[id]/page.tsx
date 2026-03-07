"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { ArrowLeft } from "lucide-react";
import { getModalidadeById, getAtletasByModalidade } from "@/data/mockData";

export default function ModalidadeDetalhePage() {
    const { id } = useParams();
    const modalidade = getModalidadeById(id as string);
    const atletas = getAtletasByModalidade(id as string);

    if (!modalidade) {
        return (
            <div className="page-container animate-fade-in">
                <Link href="/modalidades" className={styles.backLink}>
                    <ArrowLeft size={16} /> Voltar para Modalidades
                </Link>
                <div className={styles.emptyState}>
                    <h3>Modalidade não encontrada</h3>
                    <p>A modalidade solicitada não existe no sistema.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in">
            <Link href="/modalidades" className={styles.backLink}>
                <ArrowLeft size={16} /> Voltar para Modalidades
            </Link>

            {/* Header Card com cor da modalidade */}
            <div
                className={styles.headerCard}
                style={{
                    background: `linear-gradient(135deg, ${modalidade.color}ee, ${modalidade.color}88)`,
                }}
            >
                <div className={styles.headerContent}>
                    <h1 className={styles.headerTitle}>{modalidade.name}</h1>
                    <p className={styles.headerSub}>{modalidade.descricao}</p>
                    <div className={styles.headerStats}>
                        <div className={styles.headerStat}>
                            <span className={styles.headerStatValue}>{atletas.length}</span>
                            <span className={styles.headerStatLabel}>Atletas</span>
                        </div>
                        <div className={styles.headerStat}>
                            <span className={styles.headerStatValue}>{modalidade.camposEspecificos.length}</span>
                            <span className={styles.headerStatLabel}>Campos Específicos</span>
                        </div>
                        <div className={styles.headerStat}>
                            <span className={styles.headerStatValue}>{modalidade.metricas.length}</span>
                            <span className={styles.headerStatLabel}>Métricas</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Campos e Métricas específicos */}
            <div className={styles.infoSection}>
                <h2 className={styles.sectionTitle}>📊 Campos e Métricas Específicos</h2>
                <div className={styles.infoGrid}>
                    {modalidade.camposEspecificos.map((campo) => (
                        <div key={campo} className={styles.infoCard}>
                            <div className={styles.infoLabel}>Campo Específico</div>
                            <div className={styles.infoValue}>{campo}</div>
                        </div>
                    ))}
                    {modalidade.metricas.map((metrica) => (
                        <div key={metrica} className={styles.infoCard}>
                            <div className={styles.infoLabel}>Métrica</div>
                            <div className={styles.infoValue}>{metrica}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Atletas desta modalidade */}
            <div className={styles.infoSection}>
                <h2 className={styles.sectionTitle}>🏅 Atletas de {modalidade.name}</h2>
                {atletas.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h3>Nenhum atleta nesta modalidade</h3>
                        <p>Cadastre atletas de {modalidade.name} para vê-los aqui.</p>
                    </div>
                ) : (
                    <div className={styles.atletasGrid}>
                        {atletas.map((atleta) => (
                            <Link href={`/atletas/${atleta.id}`} key={atleta.id} className={styles.atletaCard}>
                                <div className={styles.atletaCardTop}>
                                    <div className={styles.atletaAvatar} style={{ backgroundColor: modalidade.color }}>
                                        {atleta.avatar}
                                    </div>
                                    <div>
                                        <div className={styles.atletaName}>{atleta.nomeEsportivo}</div>
                                        <div className={styles.atletaPos}>{atleta.pos}</div>
                                    </div>
                                </div>
                                <div className={styles.atletaCardBottom}>
                                    <span className={`${styles.statusBadge} ${styles[atleta.status.toLowerCase().replace(/\s/g, "")]}`}>
                                        {atleta.status}
                                    </span>
                                    <span className={styles.viewLink}>Ver Perfil →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
