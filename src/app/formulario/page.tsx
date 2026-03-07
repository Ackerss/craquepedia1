"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { Check, ChevronRight, ChevronLeft, Upload, Camera } from "lucide-react";

const STEPS = [
    { id: 1, title: "Dados Pessoais" },
    { id: 2, title: "Físico & Saúde" },
    { id: 3, title: "Mídia & Redes" },
    { id: 4, title: "Histórico" },
    { id: 5, title: "Tática & Perfil" },
    { id: 6, title: "Preferências" },
    { id: 7, title: "Documentos" },
];

export default function FormularioApp() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isCompleted, setIsCompleted] = useState(false);

    const nextStep = () => {
        if (currentStep < 7) setCurrentStep((c) => c + 1);
        else setIsCompleted(true);
    };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((c) => c - 1);
    };

    if (isCompleted) {
        return (
            <div className="page-container animate-fade-in" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}><Check size={48} /></div>
                    <h2 className={styles.successTitle}>Cadastro Finalizado!</h2>
                    <p className={styles.successText}>O perfil do atleta foi enviado para revisão. Nossa equipe entrará em contato em breve.</p>
                    <button className={styles.btnPrimary} style={{ marginTop: "24px" }} onClick={() => (window.location.href = "/")}>Ir para Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in">
            <div className={styles.formHeader}>
                <h1 className="page-title">Cadastro de Atleta</h1>
                <p className="page-subtitle">Preencha os dados completos para gerar o portfólio oficial.</p>
            </div>

            <div className={styles.stepperContainer}>
                {STEPS.map((step) => (
                    <div key={step.id} className={`${styles.stepItem} ${currentStep === step.id ? styles.activeStep : ""} ${currentStep > step.id ? styles.completedStep : ""}`}>
                        <div className={styles.stepCircle}>{currentStep > step.id ? <Check size={16} /> : step.id}</div>
                        <span className={styles.stepTitle}>{step.title}</span>
                        {step.id !== STEPS.length && <div className={styles.stepLine} />}
                    </div>
                ))}
            </div>

            <div className={styles.formContent}>
                <div className={styles.cardForm}>
                    <h2 className={styles.sectionTitle}>{STEPS.find((s) => s.id === currentStep)?.title}</h2>

                    {/* Etapa 1: Dados Pessoais */}
                    {currentStep === 1 && (
                        <div className={styles.gridForm}>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1", display: "flex", gap: "20px", alignItems: "center", marginBottom: "16px" }}>
                                <div className={styles.avatarUpload}><Camera size={24} color="#94a3b8" /></div>
                                <div>
                                    <h4 style={{ fontSize: "14px", marginBottom: "4px" }}>Foto de Perfil Oficial</h4>
                                    <button className={styles.btnOutline}><Upload size={14} /> Fazer Upload</button>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nome Completo*</label>
                                <input type="text" placeholder="Ex: Marcos Leonardo Santos" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nome Esportivo / Apelido*</label>
                                <input type="text" placeholder="Como é conhecido no esporte" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Data de Nascimento*</label>
                                <input type="date" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Gênero*</label>
                                <select className={styles.inputField}><option>Masculino</option><option>Feminino</option></select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Celular (WhatsApp)*</label>
                                <input type="tel" placeholder="(00) 00000-0000" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>E-mail*</label>
                                <input type="email" placeholder="atleta@email.com" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Cidade / Estado*</label>
                                <input type="text" placeholder="Ex: São Paulo, SP" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Modalidade Esportiva*</label>
                                <select className={styles.inputField}>
                                    <option value="">Selecione...</option>
                                    <option>Futebol</option><option>Futsal</option>
                                    <option>Vôlei</option><option>Basquete</option>
                                    <option>Tênis</option><option>MMA/Lutas</option>
                                    <option>Natação</option><option>Atletismo</option>
                                    <option>Judô</option><option>Outro</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Etapa 2: Físico & Saúde */}
                    {currentStep === 2 && (
                        <div className={styles.gridForm}>
                            <div className={styles.formGroup}>
                                <label>Altura (cm)*</label>
                                <input type="text" placeholder="Ex: 1.76m" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Peso (kg)*</label>
                                <input type="text" placeholder="Ex: 74kg" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Envergadura (cm)</label>
                                <input type="text" placeholder="Ex: 180cm" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Lateralidade / Pé Dominante*</label>
                                <select className={styles.inputField}>
                                    <option>Destro</option><option>Canhoto</option><option>Ambidestro</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tipo Sanguíneo</label>
                                <select className={styles.inputField}>
                                    <option value="">Selecione...</option>
                                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                                    <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Restrições Médicas</label>
                                <input type="text" placeholder="Alergias, lesões prévias, etc." className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Observações de Saúde</label>
                                <textarea placeholder="Informações adicionais sobre condição física ou médica" className={styles.textareaField} rows={3} />
                            </div>
                        </div>
                    )}

                    {/* Etapa 3: Mídia & Redes Sociais */}
                    {currentStep === 3 && (
                        <div className={styles.gridForm}>
                            <div className={styles.formGroup}>
                                <label>Instagram</label>
                                <input type="text" placeholder="@seuinstagram" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>YouTube</label>
                                <input type="text" placeholder="Link do canal ou nome" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>TikTok</label>
                                <input type="text" placeholder="@seutiktok" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Twitter / X</label>
                                <input type="text" placeholder="@seutwitter" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Site Pessoal / Portfólio</label>
                                <input type="text" placeholder="www.seusite.com.br" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Número de Seguidores (Total)</label>
                                <input type="text" placeholder="Ex: 15.000" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>📸 Fotos Profissionais</label>
                                <div className={styles.uploadArea}>
                                    <Upload size={24} color="#94a3b8" />
                                    <span>Arraste fotos aqui ou clique para selecionar</span>
                                    <small>Aceita JPG, PNG até 10MB cada. Envie fotos profissionais, de treino e jogos.</small>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Etapa 4: Histórico Esportivo */}
                    {currentStep === 4 && (
                        <div className={styles.gridForm}>
                            <div className={styles.formGroup}>
                                <label>Clube / Equipe Atual*</label>
                                <input type="text" placeholder="Ex: Santos FC" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Posição / Categoria*</label>
                                <input type="text" placeholder="Ex: Atacante" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Clubes Anteriores</label>
                                <textarea placeholder="Liste os clubes/equipes anteriores com período e posição (um por linha)" className={styles.textareaField} rows={4} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>🏆 Títulos e Conquistas</label>
                                <textarea placeholder="Liste seus títulos, prêmios e conquistas (um por linha)" className={styles.textareaField} rows={4} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Convocações para Seleções</label>
                                <input type="text" placeholder="Ex: Seleção Sub-23" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Prêmios Individuais</label>
                                <input type="text" placeholder="Ex: Artilheiro do Paulistão 2024" className={styles.inputField} />
                            </div>
                        </div>
                    )}

                    {/* Etapa 5: Tática & Perfil de Jogo */}
                    {currentStep === 5 && (
                        <div className={styles.gridForm}>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Posições que Joga*</label>
                                <input type="text" placeholder="Ex: Atacante, Ponta Direita, Segundo Atacante" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>⭐ Qualidades Técnicas (até 5)</label>
                                <input type="text" placeholder="Ex: Velocidade, Finalização, Drible, Posicionamento, Cabeceio" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Estilo de Jogo</label>
                                <textarea placeholder="Descreva como você joga, seus pontos fortes e diferenciais" className={styles.textareaField} rows={3} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Atleta de Referência</label>
                                <input type="text" placeholder="Ex: Messi, Neymar, LeBron" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Número de Camisa Preferido</label>
                                <input type="text" placeholder="Ex: 10" className={styles.inputField} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Biografia / Apresentação Pessoal</label>
                                <textarea placeholder="Conte sua história, motivação e sonhos no esporte (será usada no portfólio)" className={styles.textareaField} rows={4} />
                            </div>
                        </div>
                    )}

                    {/* Etapa 6: Preferências do Projeto */}
                    {currentStep === 6 && (
                        <div className={styles.gridForm}>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Objetivo com a Craquepedia*</label>
                                <select className={styles.inputField}>
                                    <option value="">Selecione...</option>
                                    <option>Criar portfólio profissional</option>
                                    <option>Conseguir visibilidade com clubes</option>
                                    <option>Organizar minha carreira</option>
                                    <option>Buscar patrocínio</option>
                                    <option>Todos os anteriores</option>
                                </select>
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Serviços Desejados*</label>
                                <div className={styles.checkboxGrid}>
                                    {["Currículo Esportivo PDF", "Portfólio Digital (Web)", "Cartão Digital (Linktree)", "Vídeo Highlight", "Banner para Redes Sociais", "Apresentação para Clubes"].map((item) => (
                                        <label key={item} className={styles.checkboxLabel}>
                                            <input type="checkbox" className={styles.checkbox} /> {item}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Disponibilidade para Fotos/Vídeos</label>
                                <select className={styles.inputField}>
                                    <option>Disponível a qualquer momento</option>
                                    <option>Apenas finais de semana</option>
                                    <option>Apenas em dias de folga</option>
                                    <option>Preciso combinar</option>
                                </select>
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Observações Adicionais</label>
                                <textarea placeholder="Algo mais que gostaria de nos informar?" className={styles.textareaField} rows={3} />
                            </div>
                        </div>
                    )}

                    {/* Etapa 7: Documentos */}
                    {currentStep === 7 && (
                        <div className={styles.gridForm}>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>📄 Documento de Identidade (RG ou CPF)</label>
                                <div className={styles.uploadArea}>
                                    <Upload size={24} color="#94a3b8" />
                                    <span>Arraste o arquivo aqui ou clique para selecionar</span>
                                    <small>Aceita PDF, JPG ou PNG até 5MB</small>
                                </div>
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>🎬 Vídeos de Destaque</label>
                                <div className={styles.uploadArea}>
                                    <Upload size={24} color="#94a3b8" />
                                    <span>Envie seus vídeos de melhores momentos</span>
                                    <small>Aceita MP4 até 100MB. Pode enviar links do YouTube também.</small>
                                </div>
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>Links de Vídeos (YouTube, Instagram)</label>
                                <textarea placeholder="Cole links de vídeos seus aqui (um por linha)" className={styles.textareaField} rows={3} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                                <label>📋 Currículo Anterior (se tiver)</label>
                                <div className={styles.uploadArea}>
                                    <Upload size={24} color="#94a3b8" />
                                    <span>Envie um currículo existente (opcional)</span>
                                    <small>Aceita PDF ou DOC até 10MB</small>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.formActions}>
                        <button className={styles.btnSecondary} onClick={prevStep} disabled={currentStep === 1}>
                            <ChevronLeft size={16} /> Voltar
                        </button>
                        <button className={styles.btnPrimary} onClick={nextStep}>
                            {currentStep === 7 ? "Finalizar Cadastro" : "Avançar"} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
