"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { ArrowLeft, Printer, FileDown, MapPin, Mail, Phone, Calendar } from "lucide-react";
import { useStore } from "@/data/store";
import Link from "next/link";

export default function CvImpressaoPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const atleta = useStore((state) => state.atletas.find(a => a.id === id));

    useEffect(() => {
        // Configura fundo branco para toda página para impressão
        document.body.style.backgroundColor = "white";
        return () => {
            document.body.style.backgroundColor = ""; // reset
        };
    }, []);

    if (!atleta) return <div style={{ padding: 40 }}>Atleta não encontrado.</div>;

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className={styles.printControls}>
                <button onClick={() => router.back()} className={styles.btnSecondary} style={{ border: "none" }}>
                    <ArrowLeft size={18} /> Voltar ao Perfil
                </button>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button className={styles.btnSecondary} onClick={handlePrint}>
                        <Printer size={18} /> Imprimir A4
                    </button>
                    <button className={styles.btnPrimary} onClick={handlePrint}>
                        <FileDown size={18} /> Salvar PDF
                    </button>
                </div>
            </div>

            <div className={styles.cvWrapper}>
                <div className={styles.cvHeader} style={{ background: atleta.mockLayoutTheme === "dark" ? "linear-gradient(135deg, #1e293b, #0f172a)" : "" }}>
                    <div className={styles.avatar}>{atleta.avatar}</div>
                    <div className={styles.headerInfo}>
                        <h1>{atleta.nomeEsportivo}</h1>
                        <h2>{atleta.sport} • {atleta.pos}</h2>
                        <div className={styles.badges}>
                            <span className={styles.badge}>{atleta.idade} anos</span>
                            <span className={styles.badge}>{atleta.altura}</span>
                            <span className={styles.badge}>{atleta.peso}</span>
                            <span className={styles.badge}>Pé: {atleta.pe || "Destro"}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.cvBody}>
                    <div className={styles.mainCol}>
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Apresentação</h3>
                            <p className={styles.bioText}>{atleta.bio}</p>
                        </div>

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Estatísticas da Carreira</h3>
                            <div className={styles.gridStats}>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{atleta.stats?.gols || 0}</div>
                                    <div className={styles.statLabel}>Gols/Pontos</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{atleta.stats?.titulos || 0}</div>
                                    <div className={styles.statLabel}>Títulos Totais</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{atleta.stats?.convococao || 0}</div>
                                    <div className={styles.statLabel}>Convocações Seleção</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statValue}>{atleta.stats?.prevClubes || 0}</div>
                                    <div className={styles.statLabel}>Clubes Defendidos</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}>Histórico de Clubes</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {atleta.clubes?.map((clube, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                                        <div>
                                            <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{clube.nome}</h4>
                                            <p style={{ fontSize: "13px", color: "#64748b" }}>{clube.competicao}</p>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--primary-color)" }}>{clube.ano}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className={styles.sidebarCol}>
                        <div className={styles.section}>
                            <h3 className={styles.sidebarTitle}>Contato</h3>
                            <div className={styles.infoList}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Disponibilidade</span>
                                    <span className={styles.infoValue}>Imediata</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>WhatsApp</span>
                                    <span className={styles.infoValue}><Phone size={14} style={{ display: "inline", marginRight: 6 }} /> +55 00 0000-0000</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>E-mail</span>
                                    <span className={styles.infoValue}><Mail size={14} style={{ display: "inline", marginRight: 6 }} /> contato@craquepedia.com</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Location</span>
                                    <span className={styles.infoValue}><MapPin size={14} style={{ display: "inline", marginRight: 6 }} /> {atleta.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section} style={{ marginTop: 40 }}>
                            <h3 className={styles.sidebarTitle}>Qualidades Técnicas</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {Object.entries(atleta.qualidades || {}).map(([key, value]) => (
                                    <div key={key}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px", fontWeight: 600 }}>
                                            <span style={{ textTransform: "capitalize", color: "#475569" }}>{key}</span>
                                            <span style={{ color: "var(--primary-color)" }}>{value}</span>
                                        </div>
                                        <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
                                            <div style={{ width: `${value}%`, height: "100%", backgroundColor: "var(--primary-color)" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
