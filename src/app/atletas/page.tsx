"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { Plus, Search, Filter, MoreVertical, MapPin } from "lucide-react";
import { useStore } from "@/data/store";

export default function AtletasPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSport, setFilterSport] = useState("Todos");

    const atletas = useStore((state) => state.atletas);
    const ESPORTES = ["Todos", ...Array.from(new Set(atletas.map((a) => a.sport)))];

    const filteredAtletas = atletas.filter((a) => {
        const matchName = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.nomeEsportivo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchSport = filterSport === "Todos" || a.sport === filterSport;
        return matchName && matchSport;
    });

    return (
        <div className="page-container animate-fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 className="page-title">Atletas</h1>
                    <p className="page-subtitle">
                        Gerencie o portfólio e informações dos seus atletas. {atletas.length} atletas cadastrados.
                    </p>
                </div>
                <Link href="/atletas/novo" className={styles.btnPrimary}>
                    <Plus size={18} /> Cadastrar Atleta
                </Link>
            </div>

            <div className={styles.filtersCard}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <div className={styles.filterSelectWrap}>
                        <Filter size={16} className={styles.filterIcon} />
                        <select
                            value={filterSport}
                            onChange={(e) => setFilterSport(e.target.value)}
                            className={styles.selectInput}
                        >
                            {ESPORTES.map((s) => (
                                <option key={s} value={s}>
                                    {s === "Todos" ? "Todos os Esportes" : s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                {filteredAtletas.map((atleta) => (
                    <Link href={`/atletas/${atleta.id}`} key={atleta.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.avatarWrap}>
                                <div className={styles.avatar}>{atleta.avatar}</div>
                                <div>
                                    <h3 className={styles.atletaName}>{atleta.nomeEsportivo}</h3>
                                    <span className={styles.atletaSport}>
                                        {atleta.sport} • {atleta.pos}
                                    </span>
                                </div>
                            </div>
                            <button className={styles.moreBtn} onClick={(e) => e.preventDefault()}>
                                <MoreVertical size={20} />
                            </button>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.infoRow}>
                                <MapPin size={16} className={styles.infoIcon} />
                                <span>{atleta.location}</span>
                            </div>
                            <div className={styles.pipelineRow}>
                                <span className={styles.pipelineLabel}>{atleta.pipelineEtapa}</span>
                            </div>
                        </div>
                        <div className={styles.cardFooter}>
                            <span
                                className={`${styles.statusBadge} ${styles[atleta.status.toLowerCase().replace(/\s/g, "")]}`}
                            >
                                {atleta.status}
                            </span>
                            <span className={styles.viewLink}>Ver Perfil</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
