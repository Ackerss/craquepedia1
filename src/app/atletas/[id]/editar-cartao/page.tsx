"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { ArrowLeft, Check, Smartphone, Instagram, Youtube, Link as LinkIcon, MessageCircle } from "lucide-react";
import { useStore } from "@/data/store";

export default function EditarCartaoPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const atletas = useStore((state) => state.atletas);
    const updateAtleta = useStore((state) => state.updateAtleta);
    const atleta = atletas.find((a) => a.id === id);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [theme, setTheme] = useState("dark");
    const [links, setLinks] = useState({
        instagram: "",
        youtube: "",
        whatsapp: "",
        portfolio: ""
    });

    useEffect(() => {
        if (atleta) {
            setTheme(atleta.mockLayoutTheme || "dark");
            setLinks({
                instagram: "@" + (atleta.nomeEsportivo?.toLowerCase().replace(/\s/g, "") || ""),
                youtube: "https://youtube.com/c/atleta",
                whatsapp: "5511999999999",
                portfolio: "https://craquepedia.com/" + id
            });
        }
    }, [atleta, id]);

    if (!atleta) return <div className="page-container">Atleta não encontrado.</div>;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Atualiza Zustand
        setTimeout(() => {
            updateAtleta(id, { mockLayoutTheme: theme });
            setLoading(false);
            setSuccess(true);
            setTimeout(() => router.push(`/atletas/${id}`), 1000);
        }, 800);
    };

    return (
        <div className={`page-container animate-fade-in ${styles.editContainer}`}>
            <div className={styles.editHeader}>
                <div>
                    <Link href={`/atletas/${id}`} className={styles.backLink}>
                        <ArrowLeft size={16} /> Voltar ao Perfil
                    </Link>
                    <h1 className="page-title">Configurar Cartão Digital</h1>
                    <p className="page-subtitle">Personalize a aparência do mini-site (Linktree) para a bio do Instagram de {atleta.nomeEsportivo}.</p>
                </div>
                {success && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600 }}>
                        <Check size={20} /> Salvo e Publicado!
                    </div>
                )}
            </div>

            <div className={styles.layoutGrid}>

                {/* LADO DE CONFIGURAÇÃO */}
                <form onSubmit={handleSubmit} className={styles.card}>
                    <h2 className={styles.sectionTitle}>Aparência e Tema</h2>
                    <div className={styles.formGroup} style={{ marginBottom: 32 }}>
                        <label>Selecione um tema de cor base</label>
                        <select className={styles.selectField} value={theme} onChange={(e) => setTheme(e.target.value)}>
                            <option value="dark">Dark Mode (Padrão Elite)</option>
                            <option value="light">Light Mode (Clean/Claro)</option>
                            <option value="blue">Azul Royal (Seleção)</option>
                        </select>
                    </div>

                    <h2 className={styles.sectionTitle}>Links Ativos</h2>

                    <div className={styles.linkGroup}>
                        <div className={styles.linkGroupHeader}>
                            <span className={styles.linkGroupTitle}><MessageCircle size={16} /> Seu WhatsApp</span>
                        </div>
                        <input type="text" className={styles.inputField} value={links.whatsapp} onChange={(e) => setLinks({ ...links, whatsapp: e.target.value })} placeholder="Ex: 5511999999999" />
                    </div>

                    <div className={styles.linkGroup}>
                        <div className={styles.linkGroupHeader}>
                            <span className={styles.linkGroupTitle}><Instagram size={16} /> Instagram</span>
                        </div>
                        <input type="text" className={styles.inputField} value={links.instagram} onChange={(e) => setLinks({ ...links, instagram: e.target.value })} placeholder="@seu_perfil" />
                    </div>

                    <div className={styles.linkGroup}>
                        <div className={styles.linkGroupHeader}>
                            <span className={styles.linkGroupTitle}><Youtube size={16} /> YouTube (Highlight)</span>
                        </div>
                        <input type="text" className={styles.inputField} value={links.youtube} onChange={(e) => setLinks({ ...links, youtube: e.target.value })} placeholder="Link do vídeo de melhores momentos" />
                    </div>

                    <div className={styles.linkGroup}>
                        <div className={styles.linkGroupHeader}>
                            <span className={styles.linkGroupTitle}><LinkIcon size={16} /> Portfólio Web HD</span>
                        </div>
                        <input type="text" className={styles.inputField} value={links.portfolio} disabled style={{ opacity: 0.6 }} />
                    </div>

                    <button type="submit" className={styles.btnPrimary} disabled={loading}>
                        {loading ? "Publicando..." : <><Smartphone size={18} /> Publicar Cartão Digital</>}
                    </button>
                </form>

                {/* LADO PREVIEW CELULAR */}
                <div className={styles.previewContainer}>
                    <div className={styles.previewPhone}>
                        <div className={`${styles.previewScreen} ${styles[`theme-${theme}`]}`}>
                            <div className={styles.pHeader}>
                                <div className={styles.pAvatar}>{atleta.avatar}</div>
                                <div className={styles.pName}>{atleta.nomeEsportivo}</div>
                                <div className={styles.pPos}>{atleta.sport} • {atleta.pos}</div>
                            </div>

                            <div className={styles.pLinks}>
                                <button className={styles.pLinkBtn} onClick={(e) => e.preventDefault()}>
                                    <MessageCircle size={18} /> Fale com minha Assessoria
                                </button>
                                <button className={styles.pLinkBtn} onClick={(e) => e.preventDefault()}>
                                    <Youtube size={18} /> Melhores Momentos {new Date().getFullYear()}
                                </button>
                                <button className={styles.pLinkBtn} onClick={(e) => e.preventDefault()}>
                                    <LinkIcon size={18} /> Portfólio Profissional Web
                                </button>
                                <button className={styles.pLinkBtn} onClick={(e) => e.preventDefault()}>
                                    <Instagram size={18} /> Me Siga no Instagram
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
