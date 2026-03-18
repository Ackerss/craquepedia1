// Tipos do banco de dados Supabase

export interface Sport {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
    specific_fields: SportField[];
    created_at: string;
}

export interface SportField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'select_multi';
    options?: string[];
}

export interface Submission {
    id: string;
    sport_id: string;
    sport_name: string;
    status: 'recebido' | 'aguardando_analise_ia' | 'analisado_ia' | 'pronto_para_revisao' | 'incompleto' | 'aguardando_atleta' | 'aprovado' | 'rejeitado' | 'pendente' | 'em_revisao' | 'complementar';
    full_name: string;
    sport_nickname?: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    city?: string;
    state?: string;
    general_data: Record<string, unknown>;
    sport_data: Record<string, unknown>;
    admin_notes?: string;
    ai_review_status?: string;
    missing_fields?: string[];
    ai_suggested_bio?: string;
    ai_suggested_achievements?: string;
    ai_suggested_general_data?: Record<string, unknown>;
    ai_suggested_sport_data?: Record<string, unknown>;
    ai_score?: number;
    approval_metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    reviewed_by?: string;
    reviewed_at?: string;
}

export interface Athlete {
    id: string;
    submission_id?: string;
    sport_id: string;
    sport_name: string;
    full_name: string;
    sport_nickname?: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    city?: string;
    state?: string;
    photo_url?: string;
    general_data: Record<string, unknown>;
    sport_data: Record<string, unknown>;
    achievements: Achievement[];
    career_history: CareerEntry[];
    stats: Record<string, unknown>;
    status: 'ativo' | 'inativo' | 'pendente';
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface Achievement {
    ano: string;
    titulo: string;
    descricao: string;
}

export interface CareerEntry {
    clube: string;
    periodo: string;
    posicao: string;
    destaque?: string;
}

// === SISTEMA DE SERVIÇOS ===

export type ServiceType = 'formulario' | 'curriculo' | 'portfolio' | 'cartao' | 'video' | 'youtube';
export type ServiceStatus = 'pendente' | 'em_andamento' | 'concluido' | 'nao_aplicavel';

export interface AthleteService {
    id: string;
    athlete_id: string;
    service_type: ServiceType;
    status: ServiceStatus;
    data: Record<string, unknown>;
    notes?: string;
    updated_by?: string;
    created_at: string;
    updated_at: string;
}

// Serviço com dados do atleta (join)
export interface AthleteServiceWithAthlete extends AthleteService {
    athletes: Pick<Athlete, 'id' | 'full_name' | 'sport_nickname' | 'sport_name' | 'city' | 'state' | 'photo_url'>;
}

export const SERVICE_TYPES: Record<ServiceType, { label: string; icon: string; description: string }> = {
    formulario: { label: 'Formulário', icon: '📋', description: 'Cadastro e dados do atleta' },
    curriculo: { label: 'Currículo', icon: '📄', description: 'Currículo esportivo profissional' },
    portfolio: { label: 'Portfólio', icon: '🎨', description: 'Portfólio digital do atleta' },
    cartao: { label: 'Cartão', icon: '💳', description: 'Cartão de apresentação digital' },
    video: { label: 'Vídeo', icon: '🎬', description: 'Vídeo highlight do atleta' },
    youtube: { label: 'YouTube', icon: '▶️', description: 'Vídeo publicado no YouTube' },
};

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
    pendente: { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    em_andamento: { label: 'Em Andamento', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    concluido: { label: 'Concluído', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    nao_aplicavel: { label: 'N/A', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
};

// Status labels para exibição (submissions e athletes)
export const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    recebido: { label: 'Recebido', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
    aguardando_analise_ia: { label: 'Aguardando IA', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    analisado_ia: { label: 'Análise Concluída', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)' },
    pronto_para_revisao: { label: 'Pronto p/ Revisão', color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' },
    incompleto: { label: 'Incompleto', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
    aguardando_atleta: { label: 'Aguardando Atleta', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    pendente: { label: 'Pendente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    em_revisao: { label: 'Em Revisão', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    aprovado: { label: 'Aprovado', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    rejeitado: { label: 'Rejeitado', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    complementar: { label: 'Complementar', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    ativo: { label: 'Ativo', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    inativo: { label: 'Inativo', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
};

