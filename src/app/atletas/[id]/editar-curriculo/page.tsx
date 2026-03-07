"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import { ArrowLeft, Check, Save } from "lucide-react";
import { useStore } from "@/data/store";

export default function EditarCurriculoPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const atletas = useStore((state) => state.atletas);
    const updateAtleta = useStore((state) => state.updateAtleta);

    const atleta = atletas.find((a) => a.id === id);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        nomeEsportivo: "",
        pos: "",
        altura: "",
        peso: "",
        pe: "",
        bio: "",
        stats: { prevClubes: 0, titulos: 0, convococao: 0, gols: 0 },
    });

    useEffect(() => {
        if (atleta) {
            setFormData({
                nomeEsportivo: atleta.nomeEsportivo || "",
                pos: atleta.pos || "",
                altura: atleta.altura || "",
                peso: atleta.peso || "",
                pe: atleta.pe || "",
                bio: atleta.bio || "",
                stats: {
                    prevClubes: atleta.stats?.prevClubes ?? 0,
                    titulos: atleta.stats?.titulos ?? 0,
                    convococao: atleta.stats?.convococao ?? 0,
                    gols: atleta.stats?.gols ?? 0
                },
            });
        }
    }, [atleta]);

    if (!atleta) {
        return <div className="page-container">Atleta não encontrado.</div>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Atualiza o Zustand de forma síncrona, as simula request visual
        setTimeout(() => {
            updateAtleta(id, {
                nomeEsportivo: formData.nomeEsportivo,
                pos: formData.pos,
                altura: formData.altura,
                peso: formData.peso,
                pe: formData.pe,
                bio: formData.bio,
                stats: formData.stats,
            });
            setLoading(false);
            setSuccess(true);

            // Auto redireciona pro perfil após salvar
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
                    <h1 className="page-title">Editar Currículo Esportivo</h1>
                    <p className="page-subtitle">Modifique os dados que aparecerão no CV de {atleta.nomeEsportivo}.</p>
                </div>
                {success && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 600 }}>
                        <Check size={20} /> Salvo com sucesso!
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className={styles.card}>
                <h2 className={styles.sectionTitle}>Dados Principais do CV</h2>

                <div className={styles.gridForm}>
                    <div className={styles.formGroup}>
                        <label>Nome no CV</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={formData.nomeEsportivo}
                            onChange={(e) => setFormData({ ...formData, nomeEsportivo: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Posição Principal</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={formData.pos}
                            onChange={(e) => setFormData({ ...formData, pos: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Altura</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={formData.altura}
                            onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Peso</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={formData.peso}
                            onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Lateralidade / Pé Principal</label>
                        <input
                            type="text"
                            className={styles.inputField}
                            value={formData.pe}
                            onChange={(e) => setFormData({ ...formData, pe: e.target.value })}
                        />
                    </div>
                </div>

                <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>Estatísticas Chave</h2>
                <div className={styles.gridForm}>
                    <div className={styles.formGroup}>
                        <label>Títulos Totais</label>
                        <input
                            type="number"
                            className={styles.inputField}
                            value={formData.stats.titulos}
                            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, titulos: Number(e.target.value) } })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Gols / Pontos</label>
                        <input
                            type="number"
                            className={styles.inputField}
                            value={formData.stats.gols}
                            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, gols: Number(e.target.value) } })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Clubes Anteriores</label>
                        <input
                            type="number"
                            className={styles.inputField}
                            value={formData.stats.prevClubes}
                            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, prevClubes: Number(e.target.value) } })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Convocações Seleção</label>
                        <input
                            type="number"
                            className={styles.inputField}
                            value={formData.stats.convococao}
                            onChange={(e) => setFormData({ ...formData, stats: { ...formData.stats, convococao: Number(e.target.value) } })}
                        />
                    </div>
                </div>

                <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>Biografia / Apresentação</h2>
                <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                    <label>Texto de Apresentação Livre</label>
                    <textarea
                        className={styles.textareaField}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={5}
                    />
                </div>

                <div className={styles.actions}>
                    <Link href={`/atletas/${id}`} className={styles.backLink} style={{ margin: 0, marginTop: '8px' }}>
                        Cancelar
                    </Link>
                    <button type="submit" className={styles.btnPrimary} disabled={loading}>
                        {loading ? "Salvando..." : <><Save size={18} /> Salvar Alterações</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
