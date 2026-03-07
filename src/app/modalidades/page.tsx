"use client";

import React from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { MODALIDADES, getAtletasByModalidade } from "@/data/mockData";

const ICONS_MAP: Record<string, string> = {
    futebol: "⚽", futsal: "🥅", volei: "🏐", basquete: "🏀",
    tenis: "🎾", lutas: "🥊", natacao: "🏊", atletismo: "🏃", judo: "🥋",
};

export default function ModalidadesPage() {
    return (
        <div className="page-container animate-fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 className="page-title">Modalidades</h1>
                    <p className="page-subtitle">
                        Gerencie e navegue pelos seus atletas separados por esporte.
                        {" "}{MODALIDADES.length} modalidades cadastradas.
                    </p>
                </div>
            </div>
            <div className={styles.grid}>
                {MODALIDADES.map((mod) => {
                    const atletas = getAtletasByModalidade(mod.id);
                    return (
                        <Link href={`/modalidades/${mod.id}`} key={mod.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconContainer} style={{ backgroundColor: mod.bg, color: mod.color }}>
                                    <span style={{ fontSize: 28 }}>{ICONS_MAP[mod.id] || "🏆"}</span>
                                </div>
                                <span className={styles.countBadge}>{atletas.length} atleta{atletas.length !== 1 ? "s" : ""}</span>
                            </div>
                            <div className={styles.cardBody}>
                                <h2 className={styles.cardTitle}>{mod.name}</h2>
                                <p className={styles.cardDesc}>{mod.descricao}</p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.viewLink}>Ver todos</span>
                                    <ChevronRight size={18} className={styles.chevron} />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
