-- ============================================================
-- CRAQUEPEDIA — Schema completo do banco de dados
-- Executar no SQL Editor do Supabase
-- ============================================================

-- 1. TABELA DE MODALIDADES (ESPORTES)
CREATE TABLE IF NOT EXISTS sports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text DEFAULT '⚽',
  color text DEFAULT '#2563eb',
  specific_fields jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 2. TABELA DE SUBMISSÕES (formulário público)
CREATE TABLE IF NOT EXISTS submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sport_id uuid REFERENCES sports(id),
  sport_name text NOT NULL,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente','em_revisao','aprovado','rejeitado','complementar')),
  full_name text NOT NULL,
  sport_nickname text,
  email text,
  phone text,
  birth_date text,
  city text,
  state text,
  general_data jsonb DEFAULT '{}'::jsonb,
  sport_data jsonb DEFAULT '{}'::jsonb,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  reviewed_by text,
  reviewed_at timestamptz
);

-- 3. TABELA DE ATLETAS (aprovados / cadastro manual)
CREATE TABLE IF NOT EXISTS athletes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id uuid REFERENCES submissions(id),
  sport_id uuid REFERENCES sports(id),
  sport_name text NOT NULL,
  full_name text NOT NULL,
  sport_nickname text,
  email text,
  phone text,
  birth_date text,
  city text,
  state text,
  photo_url text,
  general_data jsonb DEFAULT '{}'::jsonb,
  sport_data jsonb DEFAULT '{}'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  career_history jsonb DEFAULT '[]'::jsonb,
  stats jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'ativo' CHECK (status IN ('ativo','inativo','pendente')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by text
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler modalidades
CREATE POLICY "sports_public_read" ON sports FOR SELECT USING (true);

-- Qualquer um pode inserir submissões (formulário público)
CREATE POLICY "submissions_public_insert" ON submissions FOR INSERT WITH CHECK (true);

-- Apenas autenticados podem ler submissões
CREATE POLICY "submissions_auth_read" ON submissions FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas autenticados podem atualizar submissões
CREATE POLICY "submissions_auth_update" ON submissions FOR UPDATE USING (auth.role() = 'authenticated');

-- Apenas autenticados podem deletar submissões
CREATE POLICY "submissions_auth_delete" ON submissions FOR DELETE USING (auth.role() = 'authenticated');

-- Apenas autenticados podem gerenciar atletas
CREATE POLICY "athletes_auth_all" ON athletes FOR ALL USING (auth.role() = 'authenticated');

-- Leitura pública de atletas aprovados
CREATE POLICY "athletes_public_read" ON athletes FOR SELECT USING (status = 'ativo');

-- ============================================================
-- SEED DATA: MODALIDADES
-- ============================================================

INSERT INTO sports (name, slug, icon, color, specific_fields) VALUES
(
  'Futebol', 'futebol', '⚽', '#10b981',
  '[
    {"key": "posicao", "label": "Posição", "type": "select", "options": ["Goleiro","Zagueiro","Lateral Direito","Lateral Esquerdo","Volante","Meia","Meia Atacante","Ponta Direita","Ponta Esquerda","Centroavante","Atacante"]},
    {"key": "perna_dominante", "label": "Perna Dominante", "type": "select", "options": ["Direita","Esquerda","Ambidestro"]},
    {"key": "clube_atual", "label": "Clube Atual", "type": "text"},
    {"key": "clubes_anteriores", "label": "Clubes Anteriores", "type": "textarea"},
    {"key": "numero_camisa", "label": "Número da Camisa", "type": "text"},
    {"key": "estilo_jogo", "label": "Estilo de Jogo", "type": "textarea"},
    {"key": "campeonatos", "label": "Campeonatos Disputados", "type": "textarea"},
    {"key": "gols", "label": "Gols na Carreira", "type": "number"},
    {"key": "assistencias", "label": "Assistências", "type": "number"},
    {"key": "jogos", "label": "Jogos Disputados", "type": "number"}
  ]'::jsonb
),
(
  'Natação', 'natacao', '🏊', '#06b6d4',
  '[
    {"key": "estilos_principais", "label": "Estilos Principais", "type": "select_multi", "options": ["Crawl (Livre)","Costas","Peito","Borboleta","Medley"]},
    {"key": "provas_principais", "label": "Provas Principais", "type": "text"},
    {"key": "melhores_tempos", "label": "Melhores Tempos", "type": "textarea"},
    {"key": "piscina", "label": "Piscina", "type": "select", "options": ["Curta (25m)","Longa (50m)","Ambas"]},
    {"key": "competicoes", "label": "Competições Disputadas", "type": "textarea"},
    {"key": "treinador", "label": "Treinador / Equipe", "type": "text"},
    {"key": "federacao", "label": "Federação", "type": "text"},
    {"key": "recordes", "label": "Recordes", "type": "textarea"},
    {"key": "medalhas_ouro", "label": "Medalhas de Ouro", "type": "number"},
    {"key": "medalhas_prata", "label": "Medalhas de Prata", "type": "number"},
    {"key": "medalhas_bronze", "label": "Medalhas de Bronze", "type": "number"}
  ]'::jsonb
),
(
  'Artes Marciais', 'artes-marciais', '🥋', '#ef4444',
  '[
    {"key": "modalidade_especifica", "label": "Modalidade Específica", "type": "select", "options": ["MMA","Jiu-Jitsu","Judô","Karatê","Taekwondo","Boxe","Muay Thai","Kickboxing","Capoeira","Wrestling","Outro"]},
    {"key": "graduacao_faixa", "label": "Graduação / Faixa", "type": "text"},
    {"key": "categoria_peso", "label": "Categoria de Peso", "type": "text"},
    {"key": "stance", "label": "Stance / Guarda", "type": "select", "options": ["Ortodoxa","Southpaw","Switch"]},
    {"key": "cartel", "label": "Cartel (V-D-E)", "type": "text"},
    {"key": "finalizacoes", "label": "Finalizações", "type": "number"},
    {"key": "nocautes", "label": "Nocautes", "type": "number"},
    {"key": "academia_equipe", "label": "Academia / Equipe", "type": "text"},
    {"key": "titulos", "label": "Títulos", "type": "textarea"},
    {"key": "estilo_principal", "label": "Estilo Principal de Luta", "type": "textarea"}
  ]'::jsonb
),
(
  'Vôlei', 'volei', '🏐', '#f59e0b',
  '[
    {"key": "posicao", "label": "Posição", "type": "select", "options": ["Levantador(a)","Oposto(a)","Ponteiro(a)","Central","Líbero"]},
    {"key": "alcance_ataque", "label": "Alcance de Ataque", "type": "text"},
    {"key": "alcance_bloqueio", "label": "Alcance de Bloqueio", "type": "text"},
    {"key": "time_atual", "label": "Time Atual", "type": "text"},
    {"key": "times_anteriores", "label": "Times Anteriores", "type": "textarea"},
    {"key": "competicoes", "label": "Competições", "type": "textarea"},
    {"key": "fundamentos_fortes", "label": "Fundamentos Fortes", "type": "textarea"},
    {"key": "pontos", "label": "Pontos na Carreira", "type": "number"},
    {"key": "aces", "label": "Aces", "type": "number"},
    {"key": "bloqueios", "label": "Bloqueios", "type": "number"}
  ]'::jsonb
),
(
  'Basquete', 'basquete', '🏀', '#f97316',
  '[
    {"key": "posicao", "label": "Posição", "type": "select", "options": ["Armador (PG)","Ala-Armador (SG)","Ala (SF)","Ala-Pivô (PF)","Pivô (C)"]},
    {"key": "envergadura", "label": "Envergadura", "type": "text"},
    {"key": "impulsao", "label": "Impulsão Vertical", "type": "text"},
    {"key": "time_atual", "label": "Time Atual", "type": "text"},
    {"key": "times_anteriores", "label": "Times Anteriores", "type": "textarea"},
    {"key": "competicoes", "label": "Competições", "type": "textarea"},
    {"key": "pontos_carreira", "label": "Pontos na Carreira", "type": "number"},
    {"key": "assistencias", "label": "Assistências", "type": "number"},
    {"key": "rebotes", "label": "Rebotes", "type": "number"},
    {"key": "roubos", "label": "Roubos de Bola", "type": "number"}
  ]'::jsonb
),
(
  'Atletismo', 'atletismo', '🏃', '#8b5cf6',
  '[
    {"key": "provas_principais", "label": "Provas Principais", "type": "text"},
    {"key": "melhores_marcas", "label": "Melhores Marcas", "type": "textarea"},
    {"key": "distancias", "label": "Distâncias", "type": "text"},
    {"key": "competicoes", "label": "Competições", "type": "textarea"},
    {"key": "treinador", "label": "Treinador / Equipe", "type": "text"},
    {"key": "federacao", "label": "Federação", "type": "text"},
    {"key": "medalhas_ouro", "label": "Medalhas de Ouro", "type": "number"},
    {"key": "medalhas_prata", "label": "Medalhas de Prata", "type": "number"},
    {"key": "medalhas_bronze", "label": "Medalhas de Bronze", "type": "number"},
    {"key": "recordes", "label": "Recordes Pessoais", "type": "textarea"}
  ]'::jsonb
),
(
  'Futsal', 'futsal', '⚽', '#3b82f6',
  '[
    {"key": "posicao", "label": "Posição", "type": "select", "options": ["Goleiro","Fixo","Ala Direita","Ala Esquerda","Pivô"]},
    {"key": "perna_dominante", "label": "Perna Dominante", "type": "select", "options": ["Direita","Esquerda","Ambidestro"]},
    {"key": "equipe_atual", "label": "Equipe Atual", "type": "text"},
    {"key": "equipes_anteriores", "label": "Equipes Anteriores", "type": "textarea"},
    {"key": "gols", "label": "Gols na Carreira", "type": "number"},
    {"key": "assistencias", "label": "Assistências", "type": "number"},
    {"key": "jogos", "label": "Jogos Disputados", "type": "number"},
    {"key": "campeonatos", "label": "Campeonatos", "type": "textarea"}
  ]'::jsonb
),
(
  'Corrida', 'corrida', '🏃‍♂️', '#14b8a6',
  '[
    {"key": "modalidade", "label": "Modalidade", "type": "select", "options": ["Corrida de Rua","Trail Running","Ultra Maratona","Maratona","Meia Maratona","5K","10K"]},
    {"key": "melhores_tempos", "label": "Melhores Tempos", "type": "textarea"},
    {"key": "distancia_preferida", "label": "Distância Preferida", "type": "text"},
    {"key": "competicoes", "label": "Competições", "type": "textarea"},
    {"key": "assessoria", "label": "Assessoria / Equipe", "type": "text"},
    {"key": "pace_medio", "label": "Pace Médio", "type": "text"},
    {"key": "provas_concluidas", "label": "Provas Concluídas", "type": "number"},
    {"key": "podios", "label": "Pódios", "type": "number"}
  ]'::jsonb
);

-- ============================================================
-- SEED DATA: SUBMISSÕES DEMONSTRATIVAS
-- ============================================================

INSERT INTO submissions (sport_name, status, full_name, sport_nickname, email, phone, birth_date, city, state, general_data, sport_data, sport_id)
SELECT
  'Futebol', 'pendente', 'Pedro Henrique Souza', 'Pedrinho',
  'ph.souza@email.com', '(11) 91234-5678', '2004-03-15', 'Guarulhos', 'SP',
  '{"instagram": "@pedrinho_10", "bio": "Atacante veloz com faro de gol. Sonho de jogar na Europa.", "responsavel": "Maria Souza (mãe)", "altura": "1.78m", "peso": "72kg"}'::jsonb,
  '{"posicao": "Atacante", "perna_dominante": "Direita", "clube_atual": "Guarulhos FC", "numero_camisa": "10", "gols": 35, "jogos": 60, "estilo_jogo": "Atacante rápido, bom no 1v1"}'::jsonb,
  s.id
FROM sports s WHERE s.slug = 'futebol';

INSERT INTO submissions (sport_name, status, full_name, sport_nickname, email, phone, birth_date, city, state, general_data, sport_data, sport_id)
SELECT
  'Natação', 'em_revisao', 'Fernanda Torres Lima', 'Fer Torres',
  'fernanda.t@email.com', '(71) 98765-4321', '2003-07-22', 'Salvador', 'BA',
  '{"instagram": "@fertorres_swim", "bio": "Nadadora apaixonada, treinando desde os 8 anos. Classificada para o Troféu Brasil.", "altura": "1.74m", "peso": "63kg"}'::jsonb,
  '{"estilos_principais": ["Crawl (Livre)", "Borboleta"], "provas_principais": "100m e 200m Livre", "melhores_tempos": "100m: 56.3s\n200m: 2:02.1", "piscina": "Longa (50m)", "treinador": "Carlos Mendes", "medalhas_ouro": 8, "medalhas_prata": 12}'::jsonb,
  s.id
FROM sports s WHERE s.slug = 'natacao';

INSERT INTO submissions (sport_name, status, full_name, sport_nickname, email, phone, birth_date, city, state, general_data, sport_data, sport_id)
SELECT
  'Artes Marciais', 'pendente', 'Lucas Ferreira Gomes', 'Lucas Tiger',
  'lucas.tiger@email.com', '(41) 99876-5432', '1999-11-08', 'Curitiba', 'PR',
  '{"instagram": "@lucastiger_mma", "bio": "Lutador de MMA com base no Jiu-Jitsu. Faixa marrom. 12 lutas profissionais.", "altura": "1.75m", "peso": "70kg"}'::jsonb,
  '{"modalidade_especifica": "MMA", "graduacao_faixa": "Faixa Marrom Jiu-Jitsu", "categoria_peso": "Peso Leve (70kg)", "stance": "Ortodoxa", "cartel": "10-2-0", "finalizacoes": 6, "nocautes": 2, "academia_equipe": "Team Alpha CT", "estilo_principal": "Jiu-Jitsu com Striking"}'::jsonb,
  s.id
FROM sports s WHERE s.slug = 'artes-marciais';

INSERT INTO submissions (sport_name, status, full_name, sport_nickname, email, phone, birth_date, city, state, general_data, sport_data, sport_id)
SELECT
  'Vôlei', 'aprovado', 'Camila Rodrigues Santos', 'Camila Rodrigues',
  'camila.rod@email.com', '(21) 97654-3210', '2001-01-30', 'Niterói', 'RJ',
  '{"instagram": "@camilavolei", "bio": "Ponteira dedicada, jogando Superliga B desde 2022.", "altura": "1.85m", "peso": "73kg"}'::jsonb,
  '{"posicao": "Ponteiro(a)", "alcance_ataque": "3.15m", "alcance_bloqueio": "2.98m", "time_atual": "Niterói Vôlei", "competicoes": "Superliga B 2023, Carioca 2024", "fundamentos_fortes": "Ataque de ponta, recepção", "pontos": 450, "aces": 38}'::jsonb,
  s.id
FROM sports s WHERE s.slug = 'volei';

-- ============================================================
-- SEED DATA: ATLETAS DEMONSTRATIVOS (aprovados)
-- ============================================================

INSERT INTO athletes (sport_name, full_name, sport_nickname, email, phone, birth_date, city, state, general_data, sport_data, achievements, career_history, stats, status, sport_id)
SELECT
  'Futebol', 'Marcos Leonardo Santos', 'Marcos Leonardo',
  'marcos@email.com', '(11) 99999-1234', '2003-05-02', 'São Paulo', 'SP',
  '{"instagram": "@marcosleonardo", "youtube": "Marcos Leonardo Skills", "bio": "Atacante rápido, habilidoso com faro de gol. Revelado pelo Santos FC, já acumula mais de 50 gols na carreira profissional.", "altura": "1.76m", "peso": "74kg"}'::jsonb,
  '{"posicao": "Atacante", "perna_dominante": "Direita", "clube_atual": "Santos FC", "numero_camisa": "9", "estilo_jogo": "Velocidade, finalização e posicionamento", "gols": 58, "assistencias": 22, "jogos": 120}'::jsonb,
  '[{"ano": "2024", "titulo": "Artilheiro do Paulistão", "descricao": "12 gols em 15 jogos"}, {"ano": "2023", "titulo": "Seleção Sub-23", "descricao": "Convocado para o Pré-Olímpico"}, {"ano": "2022", "titulo": "Revelação do Brasileirão", "descricao": "Eleito pelo Prêmio Bola de Prata"}]'::jsonb,
  '[{"clube": "Santos FC", "periodo": "2021 – Atual", "posicao": "Atacante", "destaque": "58 gols em 120 jogos"}, {"clube": "Santos FC (Base)", "periodo": "2016 – 2021", "posicao": "Atacante", "destaque": "Artilheiro em todas as categorias"}]'::jsonb,
  '{"jogos": 120, "gols": 58, "assistencias": 22, "cartoes": 8}'::jsonb,
  'ativo', s.id
FROM sports s WHERE s.slug = 'futebol';

INSERT INTO athletes (sport_name, full_name, sport_nickname, email, phone, birth_date, city, state, general_data, sport_data, achievements, career_history, stats, status, sport_id)
SELECT
  'Vôlei', 'Ana Clara Sousa', 'Ana Clara',
  'anaclara@email.com', '(21) 98888-5678', '2001-08-14', 'Rio de Janeiro', 'RJ',
  '{"instagram": "@anaclaravolei", "youtube": "Ana Clara Vôlei", "bio": "Levantadora de alto nível com visão de jogo excepcional. Referência na Superliga feminina.", "altura": "1.82m", "peso": "68kg"}'::jsonb,
  '{"posicao": "Levantador(a)", "alcance_ataque": "3.10m", "time_atual": "Flamengo Vôlei", "fundamentos_fortes": "Visão de jogo, passe curto e longo, saque", "pontos": 320, "aces": 85, "bloqueios": 142}'::jsonb,
  '[{"ano": "2024", "titulo": "Melhor Levantadora Superliga", "descricao": "Eleita pela CBV"}, {"ano": "2023", "titulo": "Campeã Carioca", "descricao": "Vice-artilheira"}]'::jsonb,
  '[{"clube": "Flamengo", "periodo": "2022 – Atual", "posicao": "Levantadora", "destaque": "Capitã da equipe"}, {"clube": "Minas Tênis Clube", "periodo": "2019 – 2022", "posicao": "Levantadora"}]'::jsonb,
  '{"jogos": 95, "pontos": 320, "aces": 85, "bloqueios": 142}'::jsonb,
  'ativo', s.id
FROM sports s WHERE s.slug = 'volei';

INSERT INTO athletes (sport_name, full_name, sport_nickname, email, phone, birth_date, city, state, general_data, sport_data, achievements, career_history, stats, status, sport_id)
SELECT
  'Natação', 'Isabela Costa Oliveira', 'Bela Costa',
  'bela@email.com', '(71) 97777-4321', '2002-12-12', 'Salvador', 'BA',
  '{"instagram": "@belacosta_swim", "bio": "Nadadora de alto rendimento. Detentora de recordes estaduais. Sonho: Olimpíadas 2028.", "altura": "1.78m", "peso": "65kg"}'::jsonb,
  '{"estilos_principais": ["Crawl (Livre)"], "provas_principais": "100m e 200m Livre", "melhores_tempos": "100m: 54.82s", "piscina": "Longa (50m)", "treinador": "UNISANTA", "medalhas_ouro": 15, "medalhas_prata": 22, "medalhas_bronze": 11}'::jsonb,
  '[{"ano": "2024", "titulo": "Bronze – Troféu Brasil 100m Livre", "descricao": "Tempo: 54.82s"}, {"ano": "2023", "titulo": "Ouro – Campeonato Baiano", "descricao": "Recorde estadual 100m"}]'::jsonb,
  '[{"clube": "UNISANTA", "periodo": "2021 – Atual", "posicao": "Velocista", "destaque": "Recorde estadual BA"}]'::jsonb,
  '{"competicoes": 48, "medalhas_ouro": 15, "medalhas_prata": 22, "medalhas_bronze": 11}'::jsonb,
  'ativo', s.id
FROM sports s WHERE s.slug = 'natacao';

INSERT INTO athletes (sport_name, full_name, sport_nickname, email, phone, birth_date, city, state, general_data, sport_data, achievements, career_history, stats, status, sport_id)
SELECT
  'Artes Marciais', 'Rafael dos Anjos Pereira', 'Rafael dos Anjos',
  'rafael@email.com', '(41) 96666-8765', '1998-03-10', 'Curitiba', 'PR',
  '{"instagram": "@rafadosanjosmma", "bio": "Lutador completo com base no Jiu-Jitsu. Invicto nas últimas 8 lutas.", "altura": "1.73m", "peso": "70kg"}'::jsonb,
  '{"modalidade_especifica": "MMA", "graduacao_faixa": "Faixa Preta Jiu-Jitsu", "categoria_peso": "Peso Leve", "stance": "Ortodoxa", "cartel": "12-2-0", "finalizacoes": 7, "nocautes": 3, "academia_equipe": "Team Nogueira", "estilo_principal": "Jiu-Jitsu com Striking"}'::jsonb,
  '[{"ano": "2024", "titulo": "Cinturão Peso Leve – Jungle Fight", "descricao": "Finalização no 2º round"}, {"ano": "2023", "titulo": "Melhor Lutador Revelação", "descricao": "Premiação CABMMA"}]'::jsonb,
  '[{"clube": "Team Nogueira", "periodo": "2018 – Atual", "posicao": "Peso Leve", "destaque": "Cinturão Jungle Fight"}]'::jsonb,
  '{"lutas": 14, "vitorias": 12, "derrotas": 2, "finalizacoes": 7, "nocautes": 3}'::jsonb,
  'ativo', s.id
FROM sports s WHERE s.slug = 'artes-marciais';
