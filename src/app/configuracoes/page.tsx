"use client";

import React from "react";
import styles from "./page.module.css";
import { MODALIDADES } from "@/data/mockData";

export default function ConfiguracoesPage() {
    return (
        <div className="page-container animate-fade-in">
            <h1 className="page-title">Configurações</h1>
            <p className="page-subtitle">Gerencie as configurações do projeto Craquepedia.</p>

            <div className={styles.sections}>
                {/* Perfis */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>👤 Equipe do Projeto</h3>
                    <div className={styles.profilesGrid}>
                        <div className={styles.profileCard}>
                            <div className={styles.profileAvatar} style={{ backgroundColor: "var(--primary-color)" }}>V</div>
                            <div className={styles.profileInfo}>
                                <h4>Você</h4>
                                <p>Gestor Principal • Admin</p>
                            </div>
                        </div>
                        <div className={styles.profileCard}>
                            <div className={styles.profileAvatar} style={{ backgroundColor: "var(--accent-color)" }}>A</div>
                            <div className={styles.profileInfo}>
                                <h4>Amigo</h4>
                                <p>Co-gestor • Editor</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dados do Projeto */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>📋 Dados do Projeto</h3>
                    <div className={styles.projectInfo}>
                        <div className={styles.infoField}>
                            <span className={styles.infoLabel}>Nome do Projeto</span>
                            <span className={styles.infoValue}>CRAQUEPEDIA</span>
                        </div>
                        <div className={styles.infoField}>
                            <span className={styles.infoLabel}>Subtítulo</span>
                            <span className={styles.infoValue}>A Enciclopédia dos Craques</span>
                        </div>
                        <div className={styles.infoField}>
                            <span className={styles.infoLabel}>Versão</span>
                            <span className={styles.infoValue}>1.0 (Plataforma Interna)</span>
                        </div>
                        <div className={styles.infoField}>
                            <span className={styles.infoLabel}>Tipo</span>
                            <span className={styles.infoValue}>Software de Organização e Planejamento</span>
                        </div>
                        <div className={styles.infoField}>
                            <span className={styles.infoLabel}>Total de Atletas</span>
                            <span className={styles.infoValue}>10 atletas cadastrados</span>
                        </div>
                        <div className={styles.infoField}>
                            <span className={styles.infoLabel}>Modalidades Ativas</span>
                            <span className={styles.infoValue}>9 modalidades</span>
                        </div>
                    </div>
                </div>

                {/* Notificações */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>🔔 Preferências de Notificação</h3>
                    <div className={styles.settingsGrid}>
                        <div className={styles.settingItem}>
                            <span className={styles.settingLabel}>Novo formulário recebido</span>
                            <div className={`${styles.toggle} ${styles.toggleOn}`}>
                                <div className={`${styles.toggleDot} ${styles.toggleDotOn}`} />
                            </div>
                        </div>
                        <div className={styles.settingItem}>
                            <span className={styles.settingLabel}>Material entregue</span>
                            <div className={`${styles.toggle} ${styles.toggleOn}`}>
                                <div className={`${styles.toggleDot} ${styles.toggleDotOn}`} />
                            </div>
                        </div>
                        <div className={styles.settingItem}>
                            <span className={styles.settingLabel}>Tarefa atribuída a mim</span>
                            <div className={`${styles.toggle} ${styles.toggleOn}`}>
                                <div className={`${styles.toggleDot} ${styles.toggleDotOn}`} />
                            </div>
                        </div>
                        <div className={styles.settingItem}>
                            <span className={styles.settingLabel}>Resumo semanal</span>
                            <div className={`${styles.toggle} ${styles.toggleOff}`}>
                                <div className={`${styles.toggleDot} ${styles.toggleDotOff}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modalidades Ativas */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>🏆 Modalidades Ativas</h3>
                    <div className={styles.modalidadesList}>
                        {MODALIDADES.map((mod) => (
                            <span
                                key={mod.id}
                                className={`${styles.modalidadeChip} ${styles.modalidadeChipActive}`}
                                style={{ backgroundColor: mod.color }}
                            >
                                {mod.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
