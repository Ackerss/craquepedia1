"use client";

import React, { useState } from "react";
import styles from "./page.module.css";

const CATEGORIES = ["Todos", "Currículo", "Portfólio", "Cartão Digital"];

interface Template {
    id: string;
    nome: string;
    categoria: string;
    descricao: string;
    emoji: string;
    bgGradient: string;
    badge: string;
    modalidades: string[];
}

const TEMPLATES: Template[] = [
    {
        id: "cv-premium",
        nome: "Currículo Premium",
        categoria: "Currículo",
        descricao: "Layout profissional com destaque para estatísticas, timeline de carreira e conquistas. Ideal para todos os esportes.",
        emoji: "📄",
        bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        badge: "Mais Usado",
        modalidades: ["Futebol", "Vôlei", "Basquete"],
    },
    {
        id: "cv-compact",
        nome: "Currículo Compacto",
        categoria: "Currículo",
        descricao: "Versão resumida em uma única página com foco em dados essenciais. Perfeito para envio rápido a clubes e agentes.",
        emoji: "📋",
        bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        badge: "Rápido",
        modalidades: ["Todos"],
    },
    {
        id: "cv-stats",
        nome: "Currículo Estatístico",
        categoria: "Currículo",
        descricao: "Foco em números e métricas. Gráficos radar, tabelas de desempenho e comparativos com médias da categoria.",
        emoji: "📊",
        bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        badge: "Analítico",
        modalidades: ["Futebol", "Basquete", "Natação"],
    },
    {
        id: "port-showcase",
        nome: "Portfólio Showcase",
        categoria: "Portfólio",
        descricao: "Página web completa com galeria de fotos, seção de vídeos, timeline de conquistas e depoimentos. Visual cinematográfico.",
        emoji: "🎨",
        bgGradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        badge: "Premium",
        modalidades: ["Futebol", "Vôlei", "Tênis"],
    },
    {
        id: "port-minimal",
        nome: "Portfólio Minimalista",
        categoria: "Portfólio",
        descricao: "Design clean e moderno com foco na clareza. Seções bem definidas e navegação intuitiva. Ideal para esportes individuais.",
        emoji: "✨",
        bgGradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
        badge: "Clean",
        modalidades: ["Tênis", "Natação", "Atletismo"],
    },
    {
        id: "port-action",
        nome: "Portfólio Action",
        categoria: "Portfólio",
        descricao: "Design dinâmico e impactante com vídeo em destaque, fotos de ação e paleta de cores intensa. Para atletas que impactam.",
        emoji: "🔥",
        bgGradient: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)",
        badge: "Impactante",
        modalidades: ["MMA/Lutas", "Futebol", "Basquete"],
    },
    {
        id: "card-linktree",
        nome: "Cartão Linktree Esportivo",
        categoria: "Cartão Digital",
        descricao: "Linktree personalizado com links para redes sociais, portfólio, vídeos e contato. Inclui QR Code para cartão físico.",
        emoji: "💳",
        bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        badge: "Popular",
        modalidades: ["Todos"],
    },
    {
        id: "card-pro",
        nome: "Cartão Pro",
        categoria: "Cartão Digital",
        descricao: "Cartão digital premium com foto, dados essenciais, mini-currículo e botão direto para WhatsApp. Visual elegante.",
        emoji: "⭐",
        bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        badge: "Elegante",
        modalidades: ["Todos"],
    },
    {
        id: "card-darkmode",
        nome: "Cartão Dark Mode",
        categoria: "Cartão Digital",
        descricao: "Versão dark mode com visual moderno e sofisticado. Perfeito para atletas que querem um visual diferenciado e marcante.",
        emoji: "🌑",
        bgGradient: "linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)",
        badge: "Moderno",
        modalidades: ["Todos"],
    },
];

export default function TemplatesPage() {
    const [categoria, setCategoria] = useState("Todos");

    const filtered = categoria === "Todos"
        ? TEMPLATES
        : TEMPLATES.filter((t) => t.categoria === categoria);

    const grupos = ["Currículo", "Portfólio", "Cartão Digital"];

    return (
        <div className="page-container animate-fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 className="page-title">Templates & Modelos</h1>
                    <p className="page-subtitle">
                        Galeria de templates disponíveis para currículos, portfólios e cartões digitais.
                    </p>
                </div>
            </div>

            <div className={styles.categoriesRow}>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`${styles.catBtn} ${categoria === cat ? styles.catBtnActive : ""}`}
                        onClick={() => setCategoria(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {(categoria === "Todos" ? grupos : [categoria]).map((grupo) => {
                const items = filtered.filter((t) => t.categoria === grupo);
                if (items.length === 0) return null;
                return (
                    <div key={grupo}>
                        <h2 className={styles.sectionTitle}>
                            {grupo === "Currículo" && "📄 "}
                            {grupo === "Portfólio" && "🎨 "}
                            {grupo === "Cartão Digital" && "💳 "}
                            {grupo}
                        </h2>
                        <p className={styles.sectionSub}>
                            {grupo === "Currículo" && "Modelos de currículo esportivo profissional para impressão e envio digital."}
                            {grupo === "Portfólio" && "Layouts de página web para apresentação visual completa do atleta."}
                            {grupo === "Cartão Digital" && "Cartões digitais interativos com links, QR Code e contato direto."}
                        </p>
                        <div className={styles.grid}>
                            {items.map((tmpl) => (
                                <div key={tmpl.id} className={styles.templateCard}>
                                    <div className={styles.templatePreview} style={{ background: tmpl.bgGradient }}>
                                        <span>{tmpl.emoji}</span>
                                        <span className={styles.templateBadge}>{tmpl.badge}</span>
                                    </div>
                                    <div className={styles.templateInfo}>
                                        <h3 className={styles.templateName}>{tmpl.nome}</h3>
                                        <p className={styles.templateDesc}>{tmpl.descricao}</p>
                                        <div className={styles.templateMeta}>
                                            <div className={styles.modalidadeTags}>
                                                {tmpl.modalidades.map((m) => (
                                                    <span key={m} className={styles.modalidadeTag}>{m}</span>
                                                ))}
                                            </div>
                                            <button className={styles.previewBtn}>Usar →</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
