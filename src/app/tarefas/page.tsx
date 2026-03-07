"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { Calendar, User } from "lucide-react";
import { TAREFAS, getTarefasByStatus } from "@/data/mockData";
import type { TarefaStatus } from "@/data/mockData";

const KANBAN_COLUMNS: { status: TarefaStatus; bg: string }[] = [
    { status: "A Fazer", bg: "#ffffff" },
    { status: "Em Andamento", bg: "#ffffff" },
    { status: "Em Revisão", bg: "#ffffff" },
    { status: "Concluído", bg: "#ffffff" },
];

const FILTROS = ["Todas", "Você", "Amigo"];

export default function TarefasPage() {
    const [filtroResponsavel, setFiltroResponsavel] = useState("Todas");

    const totalTarefas = TAREFAS.length;
    const concluidas = TAREFAS.filter((t) => t.status === "Concluído").length;
    const minhas = TAREFAS.filter((t) => t.responsavel === "Você").length;
    const doAmigo = TAREFAS.filter((t) => t.responsavel === "Amigo").length;

    return (
        <div className="page-container animate-fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 className="page-title">Quadro de Tarefas</h1>
                    <p className="page-subtitle">
                        Organize o trabalho em dupla. Veja o que falta, o que está em andamento e o que foi concluído.
                    </p>
                </div>
            </div>

            {/* Estatísticas */}
            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>{totalTarefas}</div>
                    <div className={styles.statLabel}>Total de Tarefas</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "var(--accent-color)" }}>{concluidas}</div>
                    <div className={styles.statLabel}>Concluídas</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "var(--primary-color)" }}>{minhas}</div>
                    <div className={styles.statLabel}>Suas Tarefas</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "#8b5cf6" }}>{doAmigo}</div>
                    <div className={styles.statLabel}>Tarefas do Amigo</div>
                </div>
            </div>

            {/* Filtro por responsável */}
            <div className={styles.filtersRow}>
                {FILTROS.map((f) => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filtroResponsavel === f ? styles.filterBtnActive : ""}`}
                        onClick={() => setFiltroResponsavel(f)}
                    >
                        {f === "Todas" ? "📋 Todas" : f === "Você" ? "👤 Minhas" : "🤝 Do Amigo"}
                    </button>
                ))}
            </div>

            {/* Kanban */}
            <div className={styles.kanbanContainer}>
                {KANBAN_COLUMNS.map((col) => {
                    let tarefas = getTarefasByStatus(col.status);
                    if (filtroResponsavel !== "Todas") {
                        tarefas = tarefas.filter((t) => t.responsavel === filtroResponsavel);
                    }

                    return (
                        <div key={col.status} className={styles.kanbanColumn}>
                            <div className={styles.columnHeader} style={{ backgroundColor: col.bg }}>
                                <span className={styles.columnTitle}>{col.status}</span>
                                <span className={styles.columnBadge}>{tarefas.length}</span>
                            </div>
                            <div className={styles.columnCards}>
                                {tarefas.length === 0 ? (
                                    <div className={styles.emptyCol}>Nenhuma tarefa aqui</div>
                                ) : (
                                    tarefas.map((tarefa) => (
                                        <div key={tarefa.id} className={styles.taskCard}>
                                            <h4 className={styles.taskTitle}>{tarefa.titulo}</h4>
                                            <p className={styles.taskDesc}>{tarefa.descricao}</p>
                                            <div className={styles.taskMeta}>
                                                <span className={`${styles.badge} ${styles[tarefa.prioridade.toLowerCase()]}`}>
                                                    {tarefa.prioridade}
                                                </span>
                                                {tarefa.atletaNome && (
                                                    <span className={`${styles.badge} ${styles.badgeAtleta}`}>
                                                        {tarefa.atletaNome}
                                                    </span>
                                                )}
                                                {tarefa.etapa && (
                                                    <span className={`${styles.badge} ${styles.badgeEtapa}`}>
                                                        {tarefa.etapa}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.taskFooter}>
                                                <div className={styles.responsavel}>
                                                    <div
                                                        className={`${styles.responsavelAvatar} ${tarefa.responsavel === "Amigo" ? styles.responsavelAvatarAmigo : ""}`}
                                                    >
                                                        {tarefa.responsavel === "Você" ? "V" : "A"}
                                                    </div>
                                                    {tarefa.responsavel}
                                                </div>
                                                <div className={styles.prazo}>
                                                    <Calendar size={12} />
                                                    {tarefa.prazo}
                                                </div>
                                            </div>
                                        </div>
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
