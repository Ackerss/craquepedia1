import React from "react";
import styles from "./page.module.css";
import { Users, FileText, CheckCircle, TrendingUp, Plus, GitBranch, ClipboardList } from "lucide-react";
import Link from "next/link";
import { ATLETAS, TAREFAS, PIPELINE_ETAPAS, getAtletasByPipelineEtapa } from "@/data/mockData";

const totalAtletas = ATLETAS.length;
const prontos = ATLETAS.filter((a) => a.pipelineEtapa === "Pronto").length;
const progressoPct = Math.round((prontos / totalAtletas) * 100);
const totalMateriaisGerados = ATLETAS.reduce(
  (acc, a) => acc + Object.values(a.materiaisEntregues).filter(Boolean).length, 0
);
const tarefasPendentes = TAREFAS.filter((t) => t.status !== "Concluído").length;

const SUMMARY_STATS = [
  { label: "Atletas Cadastrados", value: String(totalAtletas), icon: Users, color: "var(--primary-color)", bg: "rgba(37, 99, 235, 0.1)" },
  { label: "Tarefas Pendentes", value: String(tarefasPendentes), icon: ClipboardList, color: "var(--warning-color)", bg: "rgba(245, 158, 11, 0.1)" },
  { label: "Materiais Gerados", value: String(totalMateriaisGerados), icon: CheckCircle, color: "var(--accent-color)", bg: "rgba(16, 185, 129, 0.1)" },
  { label: "Atletas Prontos", value: `${prontos}/${totalAtletas}`, icon: TrendingUp, color: "var(--primary-hover)", bg: "rgba(29, 78, 216, 0.1)" },
];

const RECENT_ATHLETES = ATLETAS.slice(0, 5);

const TAREFAS_URGENTES = TAREFAS.filter((t) => t.status !== "Concluído" && t.prioridade === "Alta").slice(0, 3);

export default function Dashboard() {
  return (
    <div className="page-container animate-fade-in">
      <div className={styles.headerRow}>
        <div>
          <h1 className="page-title">Bem-vindo ao Craquepedia</h1>
          <p className="page-subtitle">Painel de controle do projeto — visualize, organize e planeje.</p>
        </div>
        <div className={styles.actionButtons}>
          <Link href="/fluxo-atleta" className={styles.btnSecondary}>
            <GitBranch size={18} /> Ver Pipeline
          </Link>
          <Link href="/atletas/novo" className={styles.btnPrimary}>
            <Plus size={18} /> Novo Atleta
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {SUMMARY_STATS.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: stat.bg, color: stat.color }}>
              <stat.icon size={24} />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>{stat.label}</p>
              <h3 className={styles.statValue}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Resumo */}
      <div className={styles.card} style={{ padding: "24px", marginBottom: "24px" }}>
        <div className={styles.cardHeader} style={{ border: "none", padding: 0, marginBottom: "16px" }}>
          <h3 className={styles.cardTitle}>🔄 Pipeline de Atletas</h3>
          <Link href="/fluxo-atleta" className={styles.linkVerTodos}>Ver completo</Link>
        </div>
        <div className={styles.pipelineSummary}>
          {PIPELINE_ETAPAS.map((pe) => {
            const count = getAtletasByPipelineEtapa(pe.etapa).length;
            const pct = Math.round((count / totalAtletas) * 100);
            return (
              <div key={pe.etapa} className={styles.pipelineStep}>
                <div className={styles.pipelineStepTop}>
                  <span className={styles.pipelineEmoji}>{pe.icon}</span>
                  <span className={styles.pipelineCount}>{count}</span>
                </div>
                <div className={styles.pipelineBar}>
                  <div className={styles.pipelineFill} style={{ width: `${pct}%`, backgroundColor: pe.cor }} />
                </div>
                <span className={styles.pipelineStepLabel}>{pe.etapa}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progresso */}
      <div className={styles.card} style={{ padding: "20px 24px", marginBottom: "24px" }}>
        <div className={styles.progressRow}>
          <span className={styles.progressLabel}>Progresso Geral do Projeto</span>
          <span className={styles.progressPercent}>{progressoPct}%</span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressoPct}%` }} />
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Atletas Recentes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Atletas Recentes</h3>
            <Link href="/atletas" className={styles.linkVerTodos}>Ver todos</Link>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Atleta</th>
                  <th>Esporte</th>
                  <th>Etapa</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_ATHLETES.map((atleta) => (
                  <tr key={atleta.id}>
                    <td className={styles.tdName}>
                      <Link href={`/atletas/${atleta.id}`}>{atleta.nomeEsportivo}</Link>
                    </td>
                    <td><span className={styles.sportBadge}>{atleta.sport}</span></td>
                    <td><span className={styles.etapaBadge}>{atleta.pipelineEtapa}</span></td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[atleta.status.toLowerCase().replace(/\s/g, '')]}`}>
                        {atleta.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tarefas Urgentes + Atividades */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>🔥 Tarefas Urgentes</h3>
              <Link href="/tarefas" className={styles.linkVerTodos}>Ver todas</Link>
            </div>
            <div className={styles.timeline}>
              {TAREFAS_URGENTES.map((tarefa) => (
                <div key={tarefa.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot} style={{ backgroundColor: "var(--danger-color)" }} />
                  <div className={styles.timelineContent}>
                    <p><strong>{tarefa.titulo}</strong></p>
                    <span>{tarefa.atletaNome ? `${tarefa.atletaNome} • ` : ""}{tarefa.responsavel} • {tarefa.prazo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>📊 Por Modalidade</h3>
            </div>
            <div className={styles.timeline}>
              {[
                { sport: "Futebol", count: ATLETAS.filter(a => a.sport === "Futebol").length, color: "#10b981" },
                { sport: "Vôlei", count: ATLETAS.filter(a => a.sport === "Vôlei").length, color: "#f59e0b" },
                { sport: "Basquete", count: ATLETAS.filter(a => a.sport === "Basquete").length, color: "#f97316" },
                { sport: "MMA/Lutas", count: ATLETAS.filter(a => a.sport === "MMA/Lutas").length, color: "#ef4444" },
                { sport: "Tênis", count: ATLETAS.filter(a => a.sport === "Tênis").length, color: "#8b5cf6" },
                { sport: "Outros", count: ATLETAS.filter(a => !["Futebol", "Vôlei", "Basquete", "MMA/Lutas", "Tênis"].includes(a.sport)).length, color: "#64748b" },
              ].map((m) => (
                <div key={m.sport} className={styles.timelineItem}>
                  <div className={styles.timelineDot} style={{ backgroundColor: m.color }} />
                  <div className={styles.timelineContent}>
                    <p><strong>{m.sport}</strong></p>
                    <span>{m.count} atleta{m.count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
