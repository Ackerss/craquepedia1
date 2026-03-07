// ============================================================
// CRAQUEPEDIA — Dados Mock Centralizados
// Todos os atletas fictícios e dados de exemplo da plataforma
// ============================================================

export type AtletaStatus = "Ativo" | "Pendente" | "Em Revisão";
export type PipelineEtapa =
    | "Formulário Recebido"
    | "Em Cadastro"
    | "Coleta de Mídia"
    | "Currículo em Produção"
    | "Portfólio em Produção"
    | "Pronto";

export type TarefaPrioridade = "Alta" | "Média" | "Baixa";
export type TarefaStatus = "A Fazer" | "Em Andamento" | "Em Revisão" | "Concluído";

export interface Conquista {
    ano: string;
    titulo: string;
    descricao: string;
}

export interface HistoricoClube {
    clube: string;
    periodo: string;
    posicao: string;
    destaque?: string;
}

export interface Atleta {
    id: string;
    name: string;
    nomeEsportivo: string;
    sport: string;
    pos: string;
    location: string;
    status: AtletaStatus;
    avatar: string;
    birthDate: string;
    idade: number;
    height: string;
    weight: string;
    lateralidade: string;
    club: string;
    bio: string;
    pipelineEtapa: PipelineEtapa;
    socials: {
        instagram?: string;
        youtube?: string;
        tiktok?: string;
        portfolio?: string;
    };
    qualidades: string[];
    conquistas: Conquista[];
    historicoClubes: HistoricoClube[];
    estatisticas: Record<string, string | number>;
    materiaisEntregues: {
        curriculo: boolean;
        portfolio: boolean;
        cartaoDigital: boolean;
        videoHighlight: boolean;
        bannerRedes: boolean;
    };
}

export interface Tarefa {
    id: string;
    titulo: string;
    descricao: string;
    atletaId?: string;
    atletaNome?: string;
    responsavel: "Você" | "Amigo";
    prioridade: TarefaPrioridade;
    status: TarefaStatus;
    prazo: string;
    etapa?: string;
}

export interface FormularioRecebido {
    id: string;
    nomeAtleta: string;
    sport: string;
    email: string;
    celular: string;
    cidade: string;
    dataRecebido: string;
    status: "Novo" | "Em Análise" | "Aprovado" | "Convertido";
}

// ============================================================
// ATLETAS FICTÍCIOS — 10 atletas de 8 modalidades
// ============================================================

export const ATLETAS: Atleta[] = [
    {
        id: "1",
        name: "Marcos Leonardo Santos",
        nomeEsportivo: "Marcos Leonardo",
        sport: "Futebol",
        pos: "Atacante",
        location: "São Paulo, SP",
        status: "Ativo",
        avatar: "M",
        birthDate: "02/05/2003",
        idade: 22,
        height: "1.76m",
        weight: "74kg",
        lateralidade: "Direito",
        club: "Santos FC",
        bio: "Atacante rápido, habilidoso com faro de gol. Destaque nas categorias de base e peça fundamental no time profissional. Excelente posicionamento e finalização. Revelado pelo Santos FC, já acumula mais de 50 gols na carreira profissional.",
        pipelineEtapa: "Pronto",
        socials: {
            instagram: "@marcosleonardo",
            youtube: "Marcos Leonardo Skills",
            tiktok: "@marcosleonardo10",
            portfolio: "marcosleonardo.com.br",
        },
        qualidades: ["Velocidade", "Finalização", "Drible", "Posicionamento", "Cabeceio"],
        conquistas: [
            { ano: "2024", titulo: "Artilheiro do Paulistão", descricao: "12 gols em 15 jogos" },
            { ano: "2023", titulo: "Seleção Sub-23", descricao: "Convocado para o Pré-Olímpico" },
            { ano: "2022", titulo: "Revelação do Brasileirão", descricao: "Eleito pelo Prêmio Bola de Prata" },
            { ano: "2021", titulo: "Copa São Paulo de Futebol Jr.", descricao: "Campeão e artilheiro" },
        ],
        historicoClubes: [
            { clube: "Santos FC", periodo: "2021 – Atual", posicao: "Atacante", destaque: "58 gols em 120 jogos" },
            { clube: "Santos FC (Base)", periodo: "2016 – 2021", posicao: "Atacante", destaque: "Artilheiro em todas as categorias" },
        ],
        estatisticas: { jogos: 120, gols: 58, assistencias: 22, cartoes: 8, minutosJogados: "8.540" },
        materiaisEntregues: {
            curriculo: true,
            portfolio: true,
            cartaoDigital: true,
            videoHighlight: true,
            bannerRedes: true,
        },
    },
    {
        id: "2",
        name: "Ana Clara Sousa",
        nomeEsportivo: "Ana Clara",
        sport: "Vôlei",
        pos: "Levantadora",
        location: "Rio de Janeiro, RJ",
        status: "Pendente",
        avatar: "A",
        birthDate: "14/08/2001",
        idade: 24,
        height: "1.82m",
        weight: "68kg",
        lateralidade: "Destro",
        club: "Flamengo Vôlei",
        bio: "Levantadora de alto nível com visão de jogo excepcional. Referência na Superliga feminina, destaca-se pela inteligência tática e liderança em quadra. Capitã da equipe.",
        pipelineEtapa: "Portfólio em Produção",
        socials: {
            instagram: "@anaclaravolei",
            youtube: "Ana Clara Vôlei",
            tiktok: "@anaclarav",
        },
        qualidades: ["Visão de Jogo", "Liderança", "Passe Curto", "Passe Longo", "Saque"],
        conquistas: [
            { ano: "2024", titulo: "Melhor Levantadora Superliga", descricao: "Eleita pela CBV" },
            { ano: "2023", titulo: "Campeã Carioca", descricao: "Vice-artilheira de levantamentos" },
            { ano: "2022", titulo: "Seleção Brasileira Sub-23", descricao: "Convocação para Sul-Americano" },
        ],
        historicoClubes: [
            { clube: "Flamengo", periodo: "2022 – Atual", posicao: "Levantadora", destaque: "Capitã da equipe" },
            { clube: "Minas Tênis Clube", periodo: "2019 – 2022", posicao: "Levantadora" },
        ],
        estatisticas: { jogos: 95, pontos: 320, aces: 85, bloqueios: 142, assists: 1850 },
        materiaisEntregues: {
            curriculo: true,
            portfolio: false,
            cartaoDigital: false,
            videoHighlight: false,
            bannerRedes: false,
        },
    },
    {
        id: "3",
        name: "João Pedro Silva",
        nomeEsportivo: "JP Silva",
        sport: "Basquete",
        pos: "Armador",
        location: "Bauru, SP",
        status: "Ativo",
        avatar: "J",
        birthDate: "22/11/2000",
        idade: 25,
        height: "1.88m",
        weight: "82kg",
        lateralidade: "Destro",
        club: "Bauru Basket",
        bio: "Armador versátil com excelente controle de bola e visão de quadra. Destaca-se pelo arremesso de três pontos e pela capacidade de organizar o jogo ofensivo.",
        pipelineEtapa: "Pronto",
        socials: {
            instagram: "@jpsilva_basket",
            youtube: "JP Silva Basquete",
        },
        qualidades: ["Arremesso 3pts", "Passe", "Drible", "Leitura de Jogo", "Velocidade"],
        conquistas: [
            { ano: "2024", titulo: "All-Star NBB", descricao: "Selecionado para o Jogo das Estrelas" },
            { ano: "2023", titulo: "Melhor Armador NBB", descricao: "Líder em assistências" },
        ],
        historicoClubes: [
            { clube: "Bauru Basket", periodo: "2020 – Atual", posicao: "Armador", destaque: "Líder em assistências 2023" },
            { clube: "Bauru (Base)", periodo: "2015 – 2020", posicao: "Armador" },
        ],
        estatisticas: { jogos: 140, pontos: 1680, assistencias: 520, rebotes: 280, roubos: 145 },
        materiaisEntregues: {
            curriculo: true,
            portfolio: true,
            cartaoDigital: true,
            videoHighlight: false,
            bannerRedes: false,
        },
    },
    {
        id: "4",
        name: "Rafael dos Anjos Pereira",
        nomeEsportivo: "Rafael dos Anjos",
        sport: "MMA/Lutas",
        pos: "Peso Leve",
        location: "Curitiba, PR",
        status: "Em Revisão",
        avatar: "R",
        birthDate: "10/03/1998",
        idade: 28,
        height: "1.73m",
        weight: "70kg",
        lateralidade: "Ortodoxo",
        club: "Team Nogueira",
        bio: "Lutador completo com base no Jiu-Jitsu e forte striking. Invicto nas últimas 8 lutas, com 5 finalizações. Busca oportunidade em eventos internacionais.",
        pipelineEtapa: "Em Cadastro",
        socials: {
            instagram: "@rafadosanjosmma",
            tiktok: "@rafadosanjos",
        },
        qualidades: ["Jiu-Jitsu", "Striking", "Cardio", "Ground & Pound", "Takedown"],
        conquistas: [
            { ano: "2024", titulo: "Cinturão Peso Leve – Jungle Fight", descricao: "Finalização no 2º round" },
            { ano: "2023", titulo: "Melhor Lutador Revelação", descricao: "Premiação CABMMA" },
            { ano: "2022", titulo: "Faixa Preta Jiu-Jitsu", descricao: "Graduação pela Team Nogueira" },
        ],
        historicoClubes: [
            { clube: "Team Nogueira", periodo: "2018 – Atual", posicao: "Peso Leve", destaque: "Cinturão Jungle Fight" },
        ],
        estatisticas: { lutas: 14, vitorias: 12, derrotas: 2, finalizacoes: 7, nocautes: 3 },
        materiaisEntregues: {
            curriculo: false,
            portfolio: false,
            cartaoDigital: false,
            videoHighlight: false,
            bannerRedes: false,
        },
    },
    {
        id: "5",
        name: "Beatriz Haddad Maia",
        nomeEsportivo: "Bia Haddad",
        sport: "Tênis",
        pos: "Simples / Duplas",
        location: "São Paulo, SP",
        status: "Ativo",
        avatar: "B",
        birthDate: "30/06/1999",
        idade: 26,
        height: "1.85m",
        weight: "72kg",
        lateralidade: "Esquerda",
        club: "Independente",
        bio: "Tenista de alto rendimento com forte forehand e excelente movimentação em quadra. Ranking WTA top 100. Representante brasileira em torneios Grand Slam.",
        pipelineEtapa: "Coleta de Mídia",
        socials: {
            instagram: "@biahaddad",
            youtube: "Bia Haddad Tennis",
            portfolio: "biahaddad.com.br",
        },
        qualidades: ["Forehand", "Saque", "Movimentação", "Mentalidade", "Resistência"],
        conquistas: [
            { ano: "2024", titulo: "WTA 250 – São Paulo Open", descricao: "Campeã em casa" },
            { ano: "2023", titulo: "Ranking Top 50 WTA", descricao: "Melhor ranking da carreira" },
            { ano: "2022", titulo: "Roland Garros – 3ª rodada", descricao: "Melhor resultado em Grand Slam" },
        ],
        historicoClubes: [
            { clube: "Independente", periodo: "2017 – Atual", posicao: "Simples/Duplas", destaque: "Top 50 WTA" },
        ],
        estatisticas: { vitorias: 145, derrotas: 78, titulos: 3, rankingWTA: 47, aces: 892 },
        materiaisEntregues: {
            curriculo: false,
            portfolio: false,
            cartaoDigital: false,
            videoHighlight: false,
            bannerRedes: false,
        },
    },
    {
        id: "6",
        name: "Matheus Pereira da Silva",
        nomeEsportivo: "Matheus Pereira",
        sport: "Futebol",
        pos: "Meio-Campo",
        location: "Belo Horizonte, MG",
        status: "Ativo",
        avatar: "M",
        birthDate: "18/01/2002",
        idade: 24,
        height: "1.80m",
        weight: "76kg",
        lateralidade: "Esquerdo",
        club: "Cruzeiro EC",
        bio: "Meio-campista criativo com excelente passe longo e visão de jogo diferenciada. Destaque na Série A, especialista em bola parada e jogadas de efeito.",
        pipelineEtapa: "Pronto",
        socials: {
            instagram: "@matheuspereira_",
            youtube: "Matheus Pereira Futebol",
            tiktok: "@matheuspereira10",
        },
        qualidades: ["Passe Longo", "Visão de Jogo", "Bola Parada", "Cruzamento", "Drible"],
        conquistas: [
            { ano: "2024", titulo: "Melhor Meia do Mineiro", descricao: "Eleito pela Federação Mineira" },
            { ano: "2023", titulo: "7 Assistências Brasileirão", descricao: "Top 5 em assistências" },
        ],
        historicoClubes: [
            { clube: "Cruzeiro EC", periodo: "2022 – Atual", posicao: "Meia", destaque: "Titular absoluto" },
            { clube: "Cruzeiro (Base)", periodo: "2017 – 2022", posicao: "Meia" },
        ],
        estatisticas: { jogos: 98, gols: 12, assistencias: 34, cartoes: 5, minutosJogados: "7.200" },
        materiaisEntregues: {
            curriculo: true,
            portfolio: true,
            cartaoDigital: true,
            videoHighlight: true,
            bannerRedes: true,
        },
    },
    {
        id: "7",
        name: "Carlos Augusto Ribeiro",
        nomeEsportivo: "Carlão",
        sport: "Futsal",
        pos: "Ala Esquerda",
        location: "Joinville, SC",
        status: "Pendente",
        avatar: "C",
        birthDate: "25/09/2001",
        idade: 24,
        height: "1.72m",
        weight: "69kg",
        lateralidade: "Esquerdo",
        club: "Joinville Futsal",
        bio: "Ala explosivo com drible rápido e finalização precisa. Artilheiro da Liga Nacional de Futsal na temporada passada, destaca-se pela velocidade e pelo 1 contra 1.",
        pipelineEtapa: "Formulário Recebido",
        socials: {
            instagram: "@carlao_futsal",
        },
        qualidades: ["Velocidade", "Drible", "Finalização", "1v1", "Passe Rasteiro"],
        conquistas: [
            { ano: "2024", titulo: "Artilheiro Liga Nacional", descricao: "28 gols na temporada" },
            { ano: "2023", titulo: "Campeão Catarinense", descricao: "Artilheiro do campeonato" },
        ],
        historicoClubes: [
            { clube: "Joinville Futsal", periodo: "2020 – Atual", posicao: "Ala", destaque: "Artilheiro 2024" },
        ],
        estatisticas: { jogos: 85, gols: 72, assistencias: 38, cartoes: 3 },
        materiaisEntregues: {
            curriculo: false,
            portfolio: false,
            cartaoDigital: false,
            videoHighlight: false,
            bannerRedes: false,
        },
    },
    {
        id: "8",
        name: "Isabela Costa Oliveira",
        nomeEsportivo: "Bela Costa",
        sport: "Natação",
        pos: "100m e 200m Livre",
        location: "Salvador, BA",
        status: "Ativo",
        avatar: "I",
        birthDate: "12/12/2002",
        idade: 23,
        height: "1.78m",
        weight: "65kg",
        lateralidade: "Destro",
        club: "UNISANTA",
        bio: "Nadadora de alto rendimento especializada em provas de velocidade. Detentora de recordes estaduais e presença constante no pódio do Troféu Brasil. Sonho: Olimpíadas 2028.",
        pipelineEtapa: "Currículo em Produção",
        socials: {
            instagram: "@belacosta_swim",
            tiktok: "@belacosta",
        },
        qualidades: ["Velocidade", "Saída", "Virada", "Resistência", "Mentalidade"],
        conquistas: [
            { ano: "2024", titulo: "Bronze – Troféu Brasil 100m Livre", descricao: "Tempo: 54.82s" },
            { ano: "2023", titulo: "Ouro – Campeonato Baiano", descricao: "Recorde estadual 100m" },
            { ano: "2022", titulo: "Seleção Brasileira Júnior", descricao: "Sul-Americano Juvenil" },
        ],
        historicoClubes: [
            { clube: "UNISANTA", periodo: "2021 – Atual", posicao: "Velocista", destaque: "Recorde estadual BA" },
            { clube: "Clube Bahiano de Tênis", periodo: "2016 – 2021", posicao: "Velocista" },
        ],
        estatisticas: { competicoes: 48, medalhasOuro: 15, medalhasPrata: 22, medalhasBronze: 11, recordes: 3 },
        materiaisEntregues: {
            curriculo: false,
            portfolio: false,
            cartaoDigital: false,
            videoHighlight: false,
            bannerRedes: false,
        },
    },
    {
        id: "9",
        name: "Bruno Oliveira Lima",
        nomeEsportivo: "Bruno Lima",
        sport: "Atletismo",
        pos: "400m Rasos",
        location: "Porto Alegre, RS",
        status: "Pendente",
        avatar: "B",
        birthDate: "07/07/2000",
        idade: 25,
        height: "1.83m",
        weight: "78kg",
        lateralidade: "Destro",
        club: "Grêmio Náutico União",
        bio: "Velocista dos 400m rasos com tempos consistentes abaixo de 46s. Atleta dedicado com foco em representar o Brasil em competições internacionais. Treinamento intenso e disciplina exemplar.",
        pipelineEtapa: "Em Cadastro",
        socials: {
            instagram: "@brunolima_run",
        },
        qualidades: ["Explosão", "Resistência", "Ritmo", "Saída", "Curvas"],
        conquistas: [
            { ano: "2024", titulo: "Prata – Brasileiro de Atletismo", descricao: "Tempo: 45.67s nos 400m" },
            { ano: "2023", titulo: "Ouro – Troféu Brasil Sub-23", descricao: "Melhor marca pessoal" },
        ],
        historicoClubes: [
            { clube: "GNU", periodo: "2019 – Atual", posicao: "Velocista", destaque: "Recordista gaúcho 400m" },
        ],
        estatisticas: { competicoes: 35, medalhasOuro: 8, medalhasPrata: 12, medalhasBronze: 5, melhorMarca: "45.67s" },
        materiaisEntregues: {
            curriculo: false,
            portfolio: false,
            cartaoDigital: false,
            videoHighlight: false,
            bannerRedes: false,
        },
    },
    {
        id: "10",
        name: "Laura Mendes Cavalcanti",
        nomeEsportivo: "Laura Mendes",
        sport: "Judô",
        pos: "Meio-Leve (-57kg)",
        location: "Brasília, DF",
        status: "Ativo",
        avatar: "L",
        birthDate: "03/04/2001",
        idade: 24,
        height: "1.65m",
        weight: "57kg",
        lateralidade: "Destro",
        club: "Instituto Reação",
        bio: "Judoca com excelente técnica de projeção e transição para solo. Medalhista em competições nacionais e sul-americanas. Faixa preta 2° Dan com foco em Ippon Seoi Nage.",
        pipelineEtapa: "Coleta de Mídia",
        socials: {
            instagram: "@lauramendes_judo",
            youtube: "Laura Mendes Judô",
        },
        qualidades: ["Ippon Seoi Nage", "Ne-Waza", "Ashi-Waza", "Explosão", "Técnica"],
        conquistas: [
            { ano: "2024", titulo: "Ouro – Grand Prix Nacional", descricao: "Ippon na final" },
            { ano: "2023", titulo: "Prata – Pan-Americano Sub-23", descricao: "Representou o Brasil" },
            { ano: "2022", titulo: "Faixa Preta 2° Dan", descricao: "Graduação CBJ" },
        ],
        historicoClubes: [
            { clube: "Instituto Reação", periodo: "2017 – Atual", posicao: "-57kg", destaque: "Medalhista Pan-Am" },
        ],
        estatisticas: { competicoes: 42, medalhasOuro: 18, medalhasPrata: 14, medalhasBronze: 7, ippons: 32 },
        materiaisEntregues: {
            curriculo: false,
            portfolio: false,
            cartaoDigital: false,
            videoHighlight: false,
            bannerRedes: false,
        },
    },
];

// ============================================================
// TAREFAS — Quadro Kanban para trabalho em dupla
// ============================================================

export const TAREFAS: Tarefa[] = [
    {
        id: "t1",
        titulo: "Coletar fotos profissionais",
        descricao: "Solicitar ao atleta fotos profissionais em alta resolução para o portfólio",
        atletaId: "4",
        atletaNome: "Rafael dos Anjos",
        responsavel: "Você",
        prioridade: "Alta",
        status: "A Fazer",
        prazo: "10/03/2026",
        etapa: "Coleta de Mídia",
    },
    {
        id: "t2",
        titulo: "Pedir vídeos de treino",
        descricao: "Solicitar vídeos de treino para montagem do highlight reel",
        atletaId: "5",
        atletaNome: "Bia Haddad",
        responsavel: "Amigo",
        prioridade: "Alta",
        status: "A Fazer",
        prazo: "12/03/2026",
        etapa: "Coleta de Mídia",
    },
    {
        id: "t3",
        titulo: "Revisar dados do formulário",
        descricao: "Conferir todas as informações enviadas no formulário de cadastro",
        atletaId: "7",
        atletaNome: "Carlão",
        responsavel: "Você",
        prioridade: "Média",
        status: "A Fazer",
        prazo: "11/03/2026",
        etapa: "Cadastro",
    },
    {
        id: "t4",
        titulo: "Montar currículo esportivo",
        descricao: "Compilar dados e gerar o currículo esportivo oficial no template premium",
        atletaId: "8",
        atletaNome: "Bela Costa",
        responsavel: "Amigo",
        prioridade: "Alta",
        status: "Em Andamento",
        prazo: "09/03/2026",
        etapa: "Currículo",
    },
    {
        id: "t5",
        titulo: "Finalizar portfólio digital",
        descricao: "Montar o portfólio completo com fotos, vídeos e conquistas",
        atletaId: "2",
        atletaNome: "Ana Clara",
        responsavel: "Você",
        prioridade: "Alta",
        status: "Em Andamento",
        prazo: "08/03/2026",
        etapa: "Portfólio",
    },
    {
        id: "t6",
        titulo: "Criar apresentação do atleta",
        descricao: "Montar slide/vídeo de apresentação para envio a clubes e agentes",
        atletaId: "7",
        atletaNome: "Carlão",
        responsavel: "Amigo",
        prioridade: "Média",
        status: "Em Andamento",
        prazo: "13/03/2026",
        etapa: "Portfólio",
    },
    {
        id: "t7",
        titulo: "Revisar portfólio completo",
        descricao: "Fazer revisão final do portfólio antes de publicar",
        atletaId: "3",
        atletaNome: "JP Silva",
        responsavel: "Você",
        prioridade: "Média",
        status: "Em Revisão",
        prazo: "07/03/2026",
        etapa: "Revisão",
    },
    {
        id: "t8",
        titulo: "Publicar cartão digital",
        descricao: "Ativar o link do cartão digital premium (linktree esportivo)",
        atletaId: "1",
        atletaNome: "Marcos Leonardo",
        responsavel: "Amigo",
        prioridade: "Baixa",
        status: "Concluído",
        prazo: "05/03/2026",
        etapa: "Entrega",
    },
    {
        id: "t9",
        titulo: "Gerar banner para redes sociais",
        descricao: "Criar banner profissional para Instagram e Twitter do atleta",
        atletaId: "6",
        atletaNome: "Matheus Pereira",
        responsavel: "Você",
        prioridade: "Baixa",
        status: "Concluído",
        prazo: "04/03/2026",
        etapa: "Entrega",
    },
    {
        id: "t10",
        titulo: "Gerar currículo PDF final",
        descricao: "Exportar currículo em PDF com layout premium para impressão e envio digital",
        atletaId: "1",
        atletaNome: "Marcos Leonardo",
        responsavel: "Amigo",
        prioridade: "Média",
        status: "Concluído",
        prazo: "03/03/2026",
        etapa: "Currículo",
    },
    {
        id: "t11",
        titulo: "Definir campos específicos por modalidade",
        descricao: "Mapear quais campos são específicos para cada esporte (ex: gols para futebol, medalhas para natação)",
        responsavel: "Você",
        prioridade: "Média",
        status: "A Fazer",
        prazo: "15/03/2026",
        etapa: "Planejamento",
    },
    {
        id: "t12",
        titulo: "Testar fluxo completo com atleta fictício",
        descricao: "Simular todo o processo do formulário até a entrega final usando um atleta teste",
        responsavel: "Amigo",
        prioridade: "Alta",
        status: "A Fazer",
        prazo: "14/03/2026",
        etapa: "Planejamento",
    },
];

// ============================================================
// FORMULÁRIOS RECEBIDOS — Inbox simulado
// ============================================================

export const FORMULARIOS_RECEBIDOS: FormularioRecebido[] = [
    {
        id: "f1",
        nomeAtleta: "Carlos Augusto Ribeiro",
        sport: "Futsal",
        email: "carlao@email.com",
        celular: "(47) 99876-5432",
        cidade: "Joinville, SC",
        dataRecebido: "Há 2 horas",
        status: "Novo",
    },
    {
        id: "f2",
        nomeAtleta: "Fernanda Torres Lima",
        sport: "Natação",
        email: "fernanda.t@email.com",
        celular: "(71) 98765-4321",
        cidade: "Salvador, BA",
        dataRecebido: "Há 5 horas",
        status: "Novo",
    },
    {
        id: "f3",
        nomeAtleta: "Pedro Henrique Souza",
        sport: "Futebol",
        email: "ph.souza@email.com",
        celular: "(11) 91234-5678",
        cidade: "Guarulhos, SP",
        dataRecebido: "Ontem, 15:30",
        status: "Em Análise",
    },
    {
        id: "f4",
        nomeAtleta: "Camila Rodrigues",
        sport: "Vôlei",
        email: "camila.rod@email.com",
        celular: "(21) 97654-3210",
        cidade: "Niterói, RJ",
        dataRecebido: "Ontem, 09:15",
        status: "Aprovado",
    },
    {
        id: "f5",
        nomeAtleta: "Bruno Oliveira Lima",
        sport: "Atletismo",
        email: "bruno.lima@email.com",
        celular: "(51) 98888-7777",
        cidade: "Porto Alegre, RS",
        dataRecebido: "05 Mar, 11:00",
        status: "Convertido",
    },
];

// ============================================================
// MODALIDADES — Configuração por esporte
// ============================================================

export interface Modalidade {
    id: string;
    name: string;
    count: number;
    color: string;
    bg: string;
    camposEspecificos: string[];
    metricas: string[];
    descricao: string;
}

export const MODALIDADES: Modalidade[] = [
    {
        id: "futebol",
        name: "Futebol",
        count: 2,
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.1)",
        camposEspecificos: ["Posição", "Pé Dominante", "Clube", "Número da Camisa"],
        metricas: ["Gols", "Assistências", "Jogos", "Cartões"],
        descricao: "O esporte mais popular do Brasil. Gerenciamento de atletas de campo com foco em clubes, seleções e categorias de base.",
    },
    {
        id: "futsal",
        name: "Futsal",
        count: 1,
        color: "#3b82f6",
        bg: "rgba(59, 130, 246, 0.1)",
        camposEspecificos: ["Posição", "Pé Dominante", "Equipe"],
        metricas: ["Gols", "Assistências", "Jogos"],
        descricao: "Futsal competitivo com foco na Liga Nacional e competições estaduais.",
    },
    {
        id: "volei",
        name: "Vôlei",
        count: 1,
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.1)",
        camposEspecificos: ["Posição", "Alcance de Ataque", "Alcance de Bloqueio"],
        metricas: ["Pontos", "Aces", "Bloqueios", "Assists"],
        descricao: "Vôlei de quadra com atletas da Superliga e competições nacionais.",
    },
    {
        id: "basquete",
        name: "Basquete",
        count: 1,
        color: "#f97316",
        bg: "rgba(249, 115, 22, 0.1)",
        camposEspecificos: ["Posição", "Envergadura", "Impulsão Vertical"],
        metricas: ["Pontos", "Assistências", "Rebotes", "Roubos"],
        descricao: "Basquete profissional do NBB e categorias de formação.",
    },
    {
        id: "tenis",
        name: "Tênis",
        count: 1,
        color: "#8b5cf6",
        bg: "rgba(139, 92, 246, 0.1)",
        camposEspecificos: ["Mão Dominante", "Tipo de Jogo", "Superfície Preferida"],
        metricas: ["Vitórias", "Títulos", "Ranking", "Aces"],
        descricao: "Tênis profissional com atletas em circuitos WTA, ATP e ITF.",
    },
    {
        id: "lutas",
        name: "MMA / Lutas",
        count: 1,
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
        camposEspecificos: ["Categoria de Peso", "Stance", "Arte Marcial Base"],
        metricas: ["Lutas", "Vitórias", "Finalizações", "Nocautes"],
        descricao: "Artes marciais mistas e outras modalidades de luta.",
    },
    {
        id: "natacao",
        name: "Natação",
        count: 1,
        color: "#06b6d4",
        bg: "rgba(6, 182, 212, 0.1)",
        camposEspecificos: ["Prova Principal", "Estilo", "Melhor Tempo"],
        metricas: ["Competições", "Medalhas Ouro", "Medalhas Prata", "Recordes"],
        descricao: "Natação competitiva com foco em piscina curta e longa.",
    },
    {
        id: "atletismo",
        name: "Atletismo",
        count: 1,
        color: "#84cc16",
        bg: "rgba(132, 204, 22, 0.1)",
        camposEspecificos: ["Prova", "Melhor Marca", "Recorde Pessoal"],
        metricas: ["Competições", "Medalhas", "Melhor Marca"],
        descricao: "Atletismo de pista e campo com velocistas, meio-fundistas e fundistas.",
    },
    {
        id: "judo",
        name: "Judô",
        count: 1,
        color: "#eab308",
        bg: "rgba(234, 179, 8, 0.1)",
        camposEspecificos: ["Categoria de Peso", "Graduação", "Tokui-Waza"],
        metricas: ["Competições", "Medalhas Ouro", "Ippons"],
        descricao: "Judô competitivo com atletas em circuitos nacionais e internacionais.",
    },
];

// ============================================================
// HELPERS
// ============================================================

export function getAtletaById(id: string): Atleta | undefined {
    return ATLETAS.find((a) => a.id === id);
}

export function getAtletasByModalidade(modalidadeId: string): Atleta[] {
    const map: Record<string, string> = {
        futebol: "Futebol",
        futsal: "Futsal",
        volei: "Vôlei",
        basquete: "Basquete",
        tenis: "Tênis",
        lutas: "MMA/Lutas",
        natacao: "Natação",
        atletismo: "Atletismo",
        judo: "Judô",
    };
    const sportName = map[modalidadeId];
    return ATLETAS.filter((a) => a.sport === sportName);
}

export function getModalidadeById(id: string): Modalidade | undefined {
    return MODALIDADES.find((m) => m.id === id);
}

export function getAtletasByPipelineEtapa(etapa: PipelineEtapa): Atleta[] {
    return ATLETAS.filter((a) => a.pipelineEtapa === etapa);
}

export function getTarefasByStatus(status: TarefaStatus): Tarefa[] {
    return TAREFAS.filter((t) => t.status === status);
}

export const PIPELINE_ETAPAS: { etapa: PipelineEtapa; cor: string; icon: string }[] = [
    { etapa: "Formulário Recebido", cor: "#94a3b8", icon: "📥" },
    { etapa: "Em Cadastro", cor: "#f59e0b", icon: "📋" },
    { etapa: "Coleta de Mídia", cor: "#8b5cf6", icon: "📸" },
    { etapa: "Currículo em Produção", cor: "#3b82f6", icon: "📄" },
    { etapa: "Portfólio em Produção", cor: "#f97316", icon: "🎨" },
    { etapa: "Pronto", cor: "#10b981", icon: "✅" },
];
