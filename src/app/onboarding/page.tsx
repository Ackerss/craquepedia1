"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { Trophy, Check, Loader2 } from "lucide-react";
import { useStore } from "@/data/store";
import Link from "next/link";
import { v4 as uuidv4 } from "uuid"; // Simulando geração de ID

export default function OnboardingPage() {
    const addFormulario = useStore((state) => state.addFormulario);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        nomeAtleta: "",
        esporte: "",
        celular: "",
        email: "",
        cidade: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulando tempo de request (integração com Google Sheets no futuro)
        setTimeout(() => {
            const dataAtual = new Date().toLocaleDateString("pt-BR");

            addFormulario({
                id: uuidv4(),
                nomeAtleta: formData.nomeAtleta,
                sport: formData.esporte,
                email: formData.email,
                celular: formData.celular,
                cidade: formData.cidade,
                dataRecebido: dataAtual,
                status: "Novo",
            });

            setLoading(false);
            setSuccess(true);
        }, 1500);
    };

    return (
        <div className={styles.onboardingContainer}>
            <header className={styles.onboardingHeader}>
                <div className={styles.logo}>
                    <Trophy size={20} color="var(--primary-color)" />
                    CRAQUE<span>PEDIA</span>
                </div>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>
                    Cadastro Oficial
                </span>
            </header>

            <main className={styles.onboardingContent}>
                <div className={styles.card}>
                    {success ? (
                        <div className={styles.successState}>
                            <div className={styles.successIcon}>
                                <Check size={40} />
                            </div>
                            <h2 className={styles.formTitle}>Formulário Recebido!</h2>
                            <p className={styles.formSubtitle} style={{ marginBottom: 0 }}>
                                Obrigado pelo envio. Nossa equipe vai analisar seus dados
                                e entrará em contato pelo WhatsApp em breve.
                            </p>
                            <Link href="/" className={styles.backLink}>
                                Voltar para o site principal
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="animate-fade-in">
                            <h1 className={styles.formTitle}>Pré-Cadastro de Atleta</h1>
                            <p className={styles.formSubtitle}>
                                Preencha os dados primários para iniciarmos a criação do seu
                                Portfólio Esportivo.
                            </p>

                            <div className={styles.formGroup}>
                                <label>Nome Completo (ou Esportivo) *</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.inputField}
                                    placeholder="Ex: Carlos Augusto Silva"
                                    value={formData.nomeAtleta}
                                    onChange={(e) => setFormData({ ...formData, nomeAtleta: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Modalidade (Esporte) *</label>
                                <select
                                    required
                                    className={styles.inputField}
                                    value={formData.esporte}
                                    onChange={(e) => setFormData({ ...formData, esporte: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    <option>Futebol</option>
                                    <option>Futsal</option>
                                    <option>Vôlei</option>
                                    <option>Basquete</option>
                                    <option>MMA/Lutas</option>
                                    <option>Tênis</option>
                                    <option>Natação</option>
                                    <option>Atletismo</option>
                                    <option>Judô</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>WhatsApp com DDD *</label>
                                <input
                                    type="tel"
                                    required
                                    className={styles.inputField}
                                    placeholder="(00) 00000-0000"
                                    value={formData.celular}
                                    onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>E-mail *</label>
                                <input
                                    type="email"
                                    required
                                    className={styles.inputField}
                                    placeholder="seuemail@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Cidade / Estado *</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.inputField}
                                    placeholder="Ex: São Paulo, SP"
                                    value={formData.cidade}
                                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                                />
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> Enviando...
                                    </>
                                ) : (
                                    "Enviar Cadastro"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
