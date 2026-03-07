"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { Inbox, Eye, UserPlus, CheckCircle } from "lucide-react";
import { FORMULARIOS_RECEBIDOS } from "@/data/mockData";

const STATUS_FILTERS = ["Todos", "Novo", "Em Análise", "Aprovado", "Convertido"];

export default function FormulariosRecebidosPage() {
    const [filtro, setFiltro] = useState("Todos");

    const formularios = filtro === "Todos"
        ? FORMULARIOS_RECEBIDOS
        : FORMULARIOS_RECEBIDOS.filter((f) => f.status === filtro);

    const novos = FORMULARIOS_RECEBIDOS.filter((f) => f.status === "Novo").length;
    const emAnalise = FORMULARIOS_RECEBIDOS.filter((f) => f.status === "Em Análise").length;
    const aprovados = FORMULARIOS_RECEBIDOS.filter((f) => f.status === "Aprovado").length;
    const convertidos = FORMULARIOS_RECEBIDOS.filter((f) => f.status === "Convertido").length;

    return (
        <div className="page-container animate-fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 className="page-title">Formulários Recebidos</h1>
                    <p className="page-subtitle">
                        Inbox de formulários enviados por atletas. Analise, aprove e converta em cadastros.
                    </p>
                </div>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "#7c3aed" }}>{novos}</div>
                    <div className={styles.statLabel}>Novos</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "#d97706" }}>{emAnalise}</div>
                    <div className={styles.statLabel}>Em Análise</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "#059669" }}>{aprovados}</div>
                    <div className={styles.statLabel}>Aprovados</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue} style={{ color: "#2563eb" }}>{convertidos}</div>
                    <div className={styles.statLabel}>Convertidos</div>
                </div>
            </div>

            <div className={styles.filtersRow}>
                {STATUS_FILTERS.map((f) => (
                    <button
                        key={f}
                        className={`${styles.filterBtn} ${filtro === f ? styles.filterBtnActive : ""}`}
                        onClick={() => setFiltro(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            <div className={styles.card}>
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Atleta</th>
                                <th>Esporte</th>
                                <th>Contato</th>
                                <th>Cidade</th>
                                <th>Recebido</th>
                                <th>Status</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formularios.map((form) => (
                                <tr key={form.id}>
                                    <td className={styles.tdName}>{form.nomeAtleta}</td>
                                    <td><span className={styles.sportBadge}>{form.sport}</span></td>
                                    <td>
                                        <div className={styles.contactInfo}>
                                            <span>{form.celular}</span>
                                            <span className={styles.contactEmail}>{form.email}</span>
                                        </div>
                                    </td>
                                    <td>{form.cidade}</td>
                                    <td className={styles.tdDate}>{form.dataRecebido}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[form.status.toLowerCase().replace(/\s/g, "")]}`}>
                                            {form.status}
                                        </span>
                                    </td>
                                    <td>
                                        {form.status === "Novo" && (
                                            <button className={styles.actionBtn}>
                                                <Eye size={12} /> Analisar
                                            </button>
                                        )}
                                        {form.status === "Em Análise" && (
                                            <button className={styles.actionBtn}>
                                                <CheckCircle size={12} /> Aprovar
                                            </button>
                                        )}
                                        {form.status === "Aprovado" && (
                                            <button className={styles.actionBtn}>
                                                <UserPlus size={12} /> Converter
                                            </button>
                                        )}
                                        {form.status === "Convertido" && (
                                            <span className={styles.actionBtnSecondary}>✓ Convertido</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
