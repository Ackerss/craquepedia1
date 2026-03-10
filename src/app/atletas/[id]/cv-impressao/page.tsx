"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { ArrowLeft, Printer, FileDown, MapPin, Mail, Phone, Trophy, PlayCircle } from "lucide-react";
import { useStore } from "@/data/store";

export default function CvImpressaoPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const atleta = useStore((state) => state.atletas.find(a => a.id === id));

    const [modelo, setModelo] = useState<1 | 2>(1);

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
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div className={styles.modelToggle}>
                        <button className={modelo === 1 ? styles.btnActive : styles.btnSecondary} onClick={() => setModelo(1)}>Modelo 01</button>
                        <button className={modelo === 2 ? styles.btnActive : styles.btnSecondary} onClick={() => setModelo(2)}>Modelo 02 (Premium)</button>
                    </div>
                    <div style={{ width: 1, height: 24, background: "var(--border-color)", margin: "0 8px" }} />
                    <button className={styles.btnSecondary} onClick={handlePrint}>
                        <Printer size={18} /> Imprimir A4
                    </button>
                    <button className={styles.btnPrimary} onClick={handlePrint}>
                        <FileDown size={18} /> Salvar PDF
                    </button>
                </div>
            </div>

            {modelo === 1 ? (
                // PADRÃO 01 - Melhorado
                <div className={styles.cvWrapper}>
                    <div className={styles.cvHeader} style={{ background: atleta.mockLayoutTheme === "dark" ? "linear-gradient(135deg, #1e293b, #0f172a)" : "" }}>
                        <div className={styles.avatar}>{atleta.avatar}</div>
                        <div className={styles.headerInfo}>
                            <h1>{atleta.nomeEsportivo}</h1>
                            <h2>{atleta.sport} • {atleta.pos}</h2>
                            <div className={styles.badges}>
                                <span className={styles.badge}>{atleta.idade} anos</span>
                                <span className={styles.badge}>{atleta.height || atleta.altura}</span>
                                <span className={styles.badge}>{atleta.weight || atleta.peso}</span>
                                <span className={styles.badge}>Pé: {atleta.lateralidade || atleta.pe || "Destro"}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.cvBody}>
                        <div className={styles.mainCol}>
                            {atleta.bio && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Apresentação</h3>
                                    <p className={styles.bioText}>{atleta.bio}</p>
                                </div>
                            )}

                            {(atleta.conquistas?.length > 0) && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}><Trophy size={20} /> Principais Conquistas</h3>
                                    <div className={styles.conquistasList}>
                                        {atleta.conquistas.map((conquista, i) => (
                                            <div key={i} className={styles.conquistaItem}>
                                                <div className={styles.conquistaYear}>{conquista.ano}</div>
                                                <div className={styles.conquistaContent}>
                                                    <h4>{conquista.titulo}</h4>
                                                    <p>{conquista.descricao}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={styles.section}>
                                <h3 className={styles.sectionTitle}>Estatísticas da Carreira</h3>
                                <div className={styles.gridStats}>
                                    {Object.entries(atleta.estatisticas || atleta.stats || {}).map(([key, value]) => (
                                        <div key={key} className={styles.statItem}>
                                            <div className={styles.statValue}>{value}</div>
                                            <div className={styles.statLabel}>{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {((atleta.historicoClubes?.length ?? 0) > 0 || (atleta.clubes?.length ?? 0) > 0) && (
                                <div className={styles.section}>
                                    <h3 className={styles.sectionTitle}>Histórico Esportivo</h3>
                                    <div className={styles.historyList}>
                                        {(atleta.historicoClubes || atleta.clubes)?.map((club: any, i) => (
                                            <div key={i} className={styles.historyItem}>
                                                <div>
                                                    <h4 className={styles.historyTitle}>{club.clube || club.nome}</h4>
                                                    <p className={styles.historySubtitle}>{club.posicao || club.competicao}</p>
                                                    {club.destaque && <p className={styles.historyDestaque}>★ {club.destaque}</p>}
                                                </div>
                                                <div className={styles.historyYear}>
                                                    {club.periodo || club.ano}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                                        <span className={styles.infoLabel}>Localização</span>
                                        <span className={styles.infoValue}><MapPin size={14} style={{ display: "inline", marginRight: 6 }} /> {atleta.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section} style={{ marginTop: 40 }}>
                                <h3 className={styles.sidebarTitle}>Qualidades Técnicas</h3>
                                <div className={styles.qualitiesList}>
                                    {atleta.qualidades?.map((qualidade, i) => (
                                        <div key={i} className={styles.qualityPill}>{qualidade}</div>
                                    ))}
                                </div>
                                {atleta.qualidadesCV && (
                                    <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {Object.entries(atleta.qualidadesCV).map(([key, value]) => (
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
                                )}
                            </div>

                            {(atleta.socials?.youtube || atleta.socials?.tiktok) && (
                                <div className={styles.section} style={{ marginTop: 40 }}>
                                    <h3 className={styles.sidebarTitle}>Mídia e Vídeos</h3>
                                    <div className={styles.mediaList}>
                                        {Object.entries(atleta.socials).map(([net, link]) => {
                                            if (!link) return null;
                                            return (
                                                <div key={net} className={styles.mediaItem}>
                                                    <PlayCircle size={16} />
                                                    <span style={{ textTransform: "capitalize" }}>{link}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // PADRÃO 02 - Premium / Minimalist
                <div className={`${styles.cvWrapper} ${styles.cvPremium}`}>
                    <div className={styles.cvPremiumSidebar}>
                        <div className={styles.premiumAvatarWrapper}>
                            <div className={styles.avatar}>{atleta.avatar}</div>
                        </div>

                        <div className={styles.premiumContactBox}>
                            <h3 className={styles.premiumSidebarTitle}>Contato</h3>
                            <div className={styles.premiumInfoList}>
                                <div className={styles.premiumInfoItem}>
                                    <MapPin size={16} />
                                    <span>{atleta.location}</span>
                                </div>
                                <div className={styles.premiumInfoItem}>
                                    <Mail size={16} />
                                    <span>contato@profissional.com</span>
                                </div>
                                <div className={styles.premiumInfoItem}>
                                    <Phone size={16} />
                                    <span>+55 00 0000-0000</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.premiumContactBox}>
                            <h3 className={styles.premiumSidebarTitle}>Físico & Tática</h3>
                            <div className={styles.premiumAttributes}>
                                <div><small>IDADE</small><strong>{atleta.idade} anos</strong></div>
                                <div><small>ALTURA</small><strong>{atleta.height || atleta.altura}</strong></div>
                                <div><small>PESO</small><strong>{atleta.weight || atleta.peso}</strong></div>
                                <div><small>PERNA</small><strong>{atleta.lateralidade || atleta.pe || "Destro"}</strong></div>
                            </div>
                        </div>

                        <div className={styles.premiumContactBox}>
                            <h3 className={styles.premiumSidebarTitle}>Qualidades</h3>
                            <ul className={styles.premiumQualities}>
                                {atleta.qualidades?.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className={styles.cvPremiumMain}>
                        <div className={styles.premiumHeader}>
                            <h1>{atleta.nomeEsportivo}</h1>
                            <h2>{atleta.pos} • {atleta.sport}</h2>
                        </div>

                        {atleta.bio && (
                            <div className={styles.premiumSection}>
                                <h3 className={styles.premiumSectionTitle}>Perfil do Atleta</h3>
                                <p className={styles.premiumBio}>{atleta.bio}</p>
                            </div>
                        )}

                        <div className={styles.premiumSection}>
                            <h3 className={styles.premiumSectionTitle}>Estatísticas</h3>
                            <div className={styles.premiumGridStats}>
                                {Object.entries(atleta.estatisticas || atleta.stats || {}).slice(0, 4).map(([key, value]) => (
                                    <div key={key} className={styles.premiumStatItem}>
                                        <div className={styles.premiumStatValue}>{value}</div>
                                        <div className={styles.premiumStatLabel}>{key.replace(/([A-Z])/g, ' $1')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {((atleta.historicoClubes?.length ?? 0) > 0 || (atleta.clubes?.length ?? 0) > 0) && (
                            <div className={styles.premiumSection}>
                                <h3 className={styles.premiumSectionTitle}>Histórico Esportivo</h3>
                                <div className={styles.premiumHistory}>
                                    {(atleta.historicoClubes || atleta.clubes)?.map((club: any, i) => (
                                        <div key={i} className={styles.premiumHistoryItem}>
                                            <div className={styles.premiumHistoryYear}>{club.periodo || club.ano}</div>
                                            <div className={styles.premiumHistoryContent}>
                                                <h4>{club.clube || club.nome} <span>• {club.posicao || club.competicao}</span></h4>
                                                {club.destaque && <p>{club.destaque}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(atleta.conquistas?.length > 0) && (
                            <div className={styles.premiumSection}>
                                <h3 className={styles.premiumSectionTitle}>Principais Conquistas</h3>
                                <div className={styles.premiumConquistas}>
                                    {atleta.conquistas.map((conquista, i) => (
                                        <div key={i} className={styles.premiumConquistaItem}>
                                            <strong>{conquista.ano}</strong>
                                            <span>{conquista.titulo}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(atleta.socials?.youtube || atleta.socials?.tiktok) && (
                            <div className={styles.premiumSection} style={{ borderTop: "1px solid #e2e8f0", paddingTop: 20, marginTop: 30 }}>
                                <div className={styles.premiumMediaRow}>
                                    {Object.entries(atleta.socials).map(([net, link]) => {
                                        if (!link) return null;
                                        return (
                                            <span key={net}><strong>{net.toUpperCase()}:</strong> {link}</span>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
