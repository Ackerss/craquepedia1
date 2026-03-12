"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Edit,
    Share2,
    Instagram,
    Youtube,
    Globe,
    Download,
    ExternalLink,
    Trophy,
    Star,
    Clock,
    CheckCircle,
} from "lucide-react";
import { getAtletaById, ATLETAS } from "@/data/mockData";

const TABS = ["Visão Geral", "Currículo", "Portfólio", "Cartão Digital"];

const COLORS: Record<string, string> = {
    Futebol: "#10b981", Futsal: "#3b82f6", Vôlei: "#f59e0b",
    Basquete: "#f97316", Tênis: "#8b5cf6", "MMA/Lutas": "#ef4444",
    Natação: "#06b6d4", Atletismo: "#84cc16", Judô: "#eab308",
};

export default function AtletaProfile() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(TABS[0]);
    const atleta = getAtletaById(id as string) || ATLETAS[0];
    const sportColor = COLORS[atleta.sport] || "#64748b";

    return (
        <div className="page-container animate-fade-in">
            <Link href="/atletas" className={styles.backLink}>
                <ArrowLeft size={16} /> Voltar para Atletas
            </Link>

            <div className={styles.profileHeader}>
                <div className={styles.headerContent}>
                    <div className={styles.avatarLarge} style={{ backgroundColor: sportColor }}>
                        {atleta.avatar}
                    </div>
                    <div className={styles.mainInfo}>
                        <div className={styles.nameRow}>
                            <h1 className={styles.nomeAtleta}>{atleta.name}</h1>
                            <span
                                className={`${styles.statusBadge} ${styles[atleta.status.toLowerCase().replace(/\s/g, "")]}`}
                            >
                                {atleta.status}
                            </span>
                        </div>
                        <p className={styles.esportePosicao}>
                            {atleta.sport} • {atleta.pos}
                        </p>
                        <div className={styles.metaInfo}>
                            <span className={styles.metaItem}>
                                <MapPin size={14} /> {atleta.location}
                            </span>
                            <span className={styles.metaItem}>
                                <Calendar size={14} /> Nasc: {atleta.birthDate} ({atleta.idade} anos)
                            </span>
                        </div>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.btnSecondary}>
                        <Edit size={16} /> Editar
                    </button>
                    <button className={styles.btnPrimary}>
                        <Share2 size={16} /> Compartilhar
                    </button>
                </div>
            </div>
            {/* This section is likely intended for the "Cartão Digital" tab content, but placed here for now based on the user's snippet */}
            {/* It seems the user wants to add this content outside the tab structure for now, or the context was incomplete. */}
            {/* Placing it here as per the provided snippet's relative position. */}
            {/* Note: The `<li>` elements are not wrapped in a `<ul>` in the provided snippet, which might cause rendering issues. */}
            {/* Assuming this is a temporary placement or part of a larger, unprovided "Cartão Digital" section. */}
            {/* For now, inserting as provided, but it might need adjustment if this is meant to be inside a specific tab. */}
            <div className={styles.cardInfo} style={{ marginTop: '20px' }}>
                <h3 className={styles.cardTitle}>📱 Cartão Digital</h3>
                <p>Seu cartão de visitas digital com todas as suas informações e links importantes.</p>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                    <li><CheckCircle size={14} /> Links Ilimitados</li>
                    <li><CheckCircle size={14} /> Tema Personalizado ({atleta.mockLayoutTheme === 'light' ? 'Claro' : 'Escuro'})</li>
                </ul>
                <Link href={`/atletas/${atleta.id}/editar-cartao`} className={styles.btnPrimary} style={{ width: '100%', marginTop: '20px', justifyContent: 'center' }}>
                    <Edit size={16} /> Editar Aparência e Links do Cartão
                </Link>
            </div>
            <div className={styles.downloadCard}>
                <div className={styles.downloadIcon}>📄</div>
                <div>
                    <h4>Currículo em PDF Oficial</h4>
                    <p>Versão clean e otimizada para envio e impressão.</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <Link href={`/atletas/${atleta.id}/cv-impressao`} className={styles.btnPrimary} style={{ padding: '8px 16px' }}>
                            Visualizar Currículo Real
                        </Link>
                        <Link href={`/atletas/${atleta.id}/editar-curriculo`} className={styles.btnSecondary} style={{ padding: '8px 16px' }}>
                            <Edit size={14} style={{ marginRight: 4 }} /> Editar Dados Técnicos
                        </Link>
                    </div>
                </div>
            </div>

            <div className={styles.tabsContainer}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>
                {/* ================== VISÃO GERAL ================== */}
                {activeTab === "Visão Geral" && (
                    <div className={styles.gridVisaoGeral}>
                        <div className={styles.cardInfo}>
                            <h3 className={styles.cardTitle}>Dados Pessoais & Físicos</h3>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoBlock}>
                                    <span className={styles.infoLabel}>Altura</span>
                                    <p className={styles.infoValue}>{atleta.height}</p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <span className={styles.infoLabel}>Peso</span>
                                    <p className={styles.infoValue}>{atleta.weight}</p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <span className={styles.infoLabel}>Lateralidade</span>
                                    <p className={styles.infoValue}>{atleta.lateralidade}</p>
                                </div>
                                <div className={styles.infoBlock}>
                                    <span className={styles.infoLabel}>Clube Atual</span>
                                    <p className={styles.infoValue}>{atleta.club}</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.cardInfo}>
                            <h3 className={styles.cardTitle}>Biografia</h3>
                            <p className={styles.bioText}>{atleta.bio}</p>
                        </div>

                        <div className={styles.cardInfo}>
                            <h3 className={styles.cardTitle}>Redes Sociais</h3>
                            <div className={styles.socialGrid}>
                                {atleta.socials.instagram && (
                                    <div className={styles.socialItem}>
                                        <div className={`${styles.socialIcon} ${styles.instagram}`}>
                                            <Instagram size={18} />
                                        </div>
                                        <span>{atleta.socials.instagram}</span>
                                    </div>
                                )}
                                {atleta.socials.youtube && (
                                    <div className={styles.socialItem}>
                                        <div className={`${styles.socialIcon} ${styles.youtube}`}>
                                            <Youtube size={18} />
                                        </div>
                                        <span>{atleta.socials.youtube}</span>
                                    </div>
                                )}
                                {atleta.socials.portfolio && (
                                    <div className={styles.socialItem}>
                                        <div className={`${styles.socialIcon} ${styles.web}`}>
                                            <Globe size={18} />
                                        </div>
                                        <span>{atleta.socials.portfolio}</span>
                                    </div>
                                )}
                                {atleta.socials.tiktok && (
                                    <div className={styles.socialItem}>
                                        <div className={`${styles.socialIcon} ${styles.tiktok}`}>
                                            <Star size={18} />
                                        </div>
                                        <span>{atleta.socials.tiktok}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pipeline Status */}
                        <div className={styles.cardInfo}>
                            <h3 className={styles.cardTitle}>Status no Pipeline</h3>
                            <div className={styles.pipelineStatus}>
                                <div className={styles.pipelineBadge} style={{ backgroundColor: `${sportColor}20`, color: sportColor }}>
                                    {atleta.pipelineEtapa}
                                </div>
                            </div>
                            <h3 className={styles.cardTitle} style={{ marginTop: 20 }}>Materiais</h3>
                            <div className={styles.materiaisGrid}>
                                {Object.entries(atleta.materiaisEntregues).map(([key, done]) => (
                                    <div key={key} className={`${styles.materialItem} ${done ? styles.materialDone : styles.materialPending}`}>
                                        {done ? <CheckCircle size={16} /> : <Clock size={16} />}
                                        <span>{key === "curriculo" ? "Currículo" : key === "portfolio" ? "Portfólio" : key === "cartaoDigital" ? "Cartão Digital" : key === "videoHighlight" ? "Vídeo Highlight" : "Banner Redes"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================== CURRÍCULO ESPORTIVO ================== */}
                {activeTab === "Currículo" && (
                    <div className={styles.curriculoContainer}>
                        <div className={styles.curriculoHeader}>
                            <div className={styles.curriculoActions}>
                                <button className={styles.btnPrimary}>
                                    <Download size={16} /> Baixar PDF
                                </button>
                                <button className={styles.btnSecondary}>
                                    <ExternalLink size={16} /> Preview
                                </button>
                            </div>
                        </div>

                        <div className={styles.curriculoGrid}>
                            {/* Dados principais */}
                            <div className={styles.cardInfo}>
                                <h3 className={styles.cardTitle}>📋 Dados Resumidos</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoBlock}>
                                        <span className={styles.infoLabel}>Nome Completo</span>
                                        <p className={styles.infoValue}>{atleta.name}</p>
                                    </div>
                                    <div className={styles.infoBlock}>
                                        <span className={styles.infoLabel}>Nome Esportivo</span>
                                        <p className={styles.infoValue}>{atleta.nomeEsportivo}</p>
                                    </div>
                                    <div className={styles.infoBlock}>
                                        <span className={styles.infoLabel}>Nascimento</span>
                                        <p className={styles.infoValue}>{atleta.birthDate} ({atleta.idade} anos)</p>
                                    </div>
                                    <div className={styles.infoBlock}>
                                        <span className={styles.infoLabel}>Modalidade</span>
                                        <p className={styles.infoValue}>{atleta.sport}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Qualidades técnicas */}
                            <div className={styles.cardInfo}>
                                <h3 className={styles.cardTitle}>⭐ Qualidades Técnicas</h3>
                                <div className={styles.qualidadesGrid}>
                                    {atleta.qualidades.map((qual, idx) => (
                                        <div key={idx} className={styles.qualidadeItem}>
                                            <div className={styles.qualidadeBar}>
                                                <div
                                                    className={styles.qualidadeFill}
                                                    style={{
                                                        width: `${80 + Math.random() * 20}%`,
                                                        backgroundColor: sportColor,
                                                    }}
                                                />
                                            </div>
                                            <span className={styles.qualidadeLabel}>{qual}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Estatísticas */}
                            <div className={styles.cardInfo}>
                                <h3 className={styles.cardTitle}>📊 Estatísticas da Carreira</h3>
                                <div className={styles.statsGrid}>
                                    {Object.entries(atleta.estatisticas).map(([key, val]) => (
                                        <div key={key} className={styles.statBox}>
                                            <div className={styles.statBoxValue}>{val}</div>
                                            <div className={styles.statBoxLabel}>
                                                {key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Histórico de Clubes */}
                            <div className={styles.cardInfo}>
                                <h3 className={styles.cardTitle}>🏟️ Histórico de Clubes</h3>
                                <div className={styles.timelineCV}>
                                    {atleta.historicoClubes.map((hist, idx) => (
                                        <div key={idx} className={styles.timelineCVItem}>
                                            <div className={styles.timelineCVDot} style={{ backgroundColor: sportColor }} />
                                            <div className={styles.timelineCVContent}>
                                                <div className={styles.timelineCVTitle}>{hist.clube}</div>
                                                <div className={styles.timelineCVPeriod}>{hist.periodo} • {hist.posicao}</div>
                                                {hist.destaque && <div className={styles.timelineCVHighlight}>{hist.destaque}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Conquistas */}
                            <div className={styles.cardInfo} style={{ gridColumn: "1 / -1" }}>
                                <h3 className={styles.cardTitle}>🏆 Conquistas e Títulos</h3>
                                <div className={styles.conquistasGrid}>
                                    {atleta.conquistas.map((conq, idx) => (
                                        <div key={idx} className={styles.conquistaCard}>
                                            <div className={styles.conquistaAno}>{conq.ano}</div>
                                            <div className={styles.conquistaInfo}>
                                                <div className={styles.conquistaTitulo}>
                                                    <Trophy size={14} style={{ color: sportColor }} /> {conq.titulo}
                                                </div>
                                                <div className={styles.conquistaDesc}>{conq.descricao}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================== PORTFÓLIO DIGITAL ================== */}
                {activeTab === "Portfólio" && (
                    <div className={styles.portfolioContainer}>
                        <div className={styles.cardInfo} style={{ textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%", background: `${sportColor}20`,
                                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px"
                            }}>
                                <Globe size={40} color={sportColor} />
                            </div>
                            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>Apresentação Premium</h2>
                            <p style={{ color: "var(--text-secondary)", maxWidth: 600, margin: "0 auto 32px", lineHeight: 1.6, fontSize: 16 }}>
                                Este portfólio possui um design exclusivo em tela cheia, desenvolvido para garantir o máximo impacto visual em reuniões, apresentações para clubes e fechamento de patrocínios.
                            </p>
                            <Link href={`/p/${id}`} target="_blank" style={{
                                display: "inline-flex", alignItems: "center", gap: 10,
                                padding: "16px 36px", borderRadius: 12, background: "linear-gradient(135deg, " + sportColor + ", #1e293b)",
                                color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: 16,
                                boxShadow: `0 8px 30px ${sportColor}40`, transition: "transform 0.2s",
                            }}>
                                <ExternalLink size={20} /> Acessar Portfólio em Tela Cheia
                            </Link>
                        </div>
                    </div>
                )}

                {/* ================== CARTÃO DIGITAL ================== */}
                {activeTab === "Cartão Digital" && (
                    <div className={styles.cartaoContainer}>
                        <div className={styles.cartaoPreviewWrap}>
                            <div className={styles.cartaoPreview} style={{ background: `linear-gradient(180deg, ${sportColor}ee 0%, #0f172a 100%)` }}>
                                <div className={styles.cartaoAvatar}>{atleta.avatar}</div>
                                <h2 className={styles.cartaoNome}>{atleta.nomeEsportivo}</h2>
                                <p className={styles.cartaoSport}>{atleta.sport} • {atleta.pos}</p>
                                <p className={styles.cartaoClub}>{atleta.club}</p>

                                <div className={styles.cartaoLinks}>
                                    {atleta.socials.instagram && (
                                        <div className={styles.cartaoLink}>
                                            <Instagram size={18} /> Instagram
                                        </div>
                                    )}
                                    {atleta.socials.youtube && (
                                        <div className={styles.cartaoLink}>
                                            <Youtube size={18} /> YouTube
                                        </div>
                                    )}
                                    {atleta.socials.portfolio && (
                                        <div className={styles.cartaoLink}>
                                            <Globe size={18} /> Portfólio Web
                                        </div>
                                    )}
                                    <div className={styles.cartaoLink}>
                                        <Download size={18} /> Currículo PDF
                                    </div>
                                    <div className={styles.cartaoLink}>
                                        <Star size={18} /> Melhores Momentos
                                    </div>
                                </div>

                                <div className={styles.cartaoQR}>
                                    <div className={styles.qrPlaceholder}>QR</div>
                                    <p className={styles.cartaoQRText}>Escaneie para abrir</p>
                                </div>

                                <p className={styles.cartaoBrand}>powered by CRAQUEPEDIA</p>
                            </div>
                        </div>

                        <div className={styles.cartaoInfo}>
                            <div className={styles.cardInfo}>
                                <h3 className={styles.cardTitle}>📱 Sobre o Cartão Digital</h3>
                                <p className={styles.bioText}>
                                    O Cartão Digital Premium é um link personalizado (estilo Linktree) exclusivo para o atleta.
                                    Ele reúne todas as informações importantes em um único lugar acessível por QR Code ou link direto.
                                </p>
                                <div className={styles.cardFeatures}>
                                    <div className={styles.featureItem}>✅ Link personalizado</div>
                                    <div className={styles.featureItem}>✅ QR Code para cartão físico</div>
                                    <div className={styles.featureItem}>✅ Redes sociais integradas</div>
                                    <div className={styles.featureItem}>✅ Download do currículo</div>
                                    <div className={styles.featureItem}>✅ Acesso ao portfólio</div>
                                    <div className={styles.featureItem}>✅ Botão direto para WhatsApp</div>
                                </div>
                            </div>
                            <div className={styles.cardInfo}>
                                <h3 className={styles.cardTitle}>🔗 Link do Cartão</h3>
                                <div className={styles.linkPreview}>
                                    craquepedia.com.br/atleta/{atleta.nomeEsportivo.toLowerCase().replace(/\s/g, "-")}
                                </div>
                                <button className={styles.btnPrimary} style={{ marginTop: 16, width: "100%" }}>
                                    <Share2 size={16} /> Copiar Link
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
