const fs = require('fs');
const path = require('path');

// Ler o .env.local manualmente para não precisar do dotenv
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
});

const URL = env['NEXT_PUBLIC_SUPABASE_URL'];
const KEY = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const sportsData = [
    {
        name: 'Futebol', slug: 'futebol', icon: '⚽', color: '#10b981', specific_fields: [
            { key: 'posicao', label: 'Posição', type: 'select', options: ['Goleiro', 'Zagueiro', 'Lateral Direito', 'Lateral Esquerdo', 'Volante', 'Meia', 'Meia Atacante', 'Ponta Direita', 'Ponta Esquerda', 'Centroavante', 'Atacante'] },
            { key: 'perna_dominante', label: 'Perna Dominante', type: 'select', options: ['Direita', 'Esquerda', 'Ambidestro'] },
            { key: 'clube_atual', label: 'Clube Atual', type: 'text' },
            { key: 'clubes_anteriores', label: 'Clubes Anteriores', type: 'textarea' },
            { key: 'numero_camisa', label: 'Número da Camisa', type: 'text' },
            { key: 'estilo_jogo', label: 'Estilo de Jogo', type: 'textarea' },
            { key: 'campeonatos', label: 'Campeonatos Disputados', type: 'textarea' },
            { key: 'gols', label: 'Gols na Carreira', type: 'number' },
            { key: 'assistencias', label: 'Assistências', type: 'number' },
            { key: 'jogos', label: 'Jogos Disputados', type: 'number' }
        ]
    },
    {
        name: 'Natação', slug: 'natacao', icon: '🏊', color: '#06b6d4', specific_fields: [
            { key: 'estilos_principais', label: 'Estilos Principais', type: 'select_multi', options: ['Crawl (Livre)', 'Costas', 'Peito', 'Borboleta', 'Medley'] },
            { key: 'provas_principais', label: 'Provas Principais', type: 'text' },
            { key: 'melhores_tempos', label: 'Melhores Tempos', type: 'textarea' },
            { key: 'piscina', label: 'Piscina', type: 'select', options: ['Curta (25m)', 'Longa (50m)', 'Ambas'] },
            { key: 'competicoes', label: 'Competições Disputadas', type: 'textarea' }
        ]
    },
    {
        name: 'Artes Marciais', slug: 'artes-marciais', icon: '🥋', color: '#ef4444', specific_fields: [
            { key: 'modalidade_especifica', label: 'Modalidade Específica', type: 'select', options: ['MMA', 'Jiu-Jitsu', 'Judô', 'Karatê', 'Taekwondo', 'Boxe', 'Muay Thai', 'Kickboxing', 'Capoeira', 'Wrestling', 'Outro'] },
            { key: 'graduacao_faixa', label: 'Graduação / Faixa', type: 'text' },
            { key: 'categoria_peso', label: 'Categoria de Peso', type: 'text' },
            { key: 'stance', label: 'Stance / Guarda', type: 'select', options: ['Ortodoxa', 'Southpaw', 'Switch'] }
        ]
    },
    {
        name: 'Vôlei', slug: 'volei', icon: '🏐', color: '#f59e0b', specific_fields: [
            { key: 'posicao', label: 'Posição', type: 'select', options: ['Levantador(a)', 'Oposto(a)', 'Ponteiro(a)', 'Central', 'Líbero'] },
            { key: 'alcance_ataque', label: 'Alcance de Ataque', type: 'text' },
            { key: 'alcance_bloqueio', label: 'Alcance de Bloqueio', type: 'text' },
            { key: 'time_atual', label: 'Time Atual', type: 'text' }
        ]
    },
    {
        name: 'Basquete', slug: 'basquete', icon: '🏀', color: '#f97316', specific_fields: [
            { key: 'posicao', label: 'Posição', type: 'select', options: ['Armador (PG)', 'Ala-Armador (SG)', 'Ala (SF)', 'Ala-Pivô (PF)', 'Pivô (C)'] },
            { key: 'envergadura', label: 'Envergadura', type: 'text' },
            { key: 'impulsao', label: 'Impulsão Vertical', type: 'text' },
            { key: 'time_atual', label: 'Time Atual', type: 'text' }
        ]
    },
    {
        name: 'Atletismo', slug: 'atletismo', icon: '🏃', color: '#8b5cf6', specific_fields: [
            { key: 'provas_principais', label: 'Provas Principais', type: 'text' },
            { key: 'melhores_marcas', label: 'Melhores Marcas', type: 'textarea' }
        ]
    },
    {
        name: 'Futsal', slug: 'futsal', icon: '⚽', color: '#3b82f6', specific_fields: [
            { key: 'posicao', label: 'Posição', type: 'select', options: ['Goleiro', 'Fixo', 'Ala Direita', 'Ala Esquerda', 'Pivô'] },
            { key: 'equipe_atual', label: 'Equipe Atual', type: 'text' }
        ]
    },
    {
        name: 'Corrida', slug: 'corrida', icon: '🏃‍♂️', color: '#14b8a6', specific_fields: [
            { key: 'modalidade', label: 'Modalidade', type: 'select', options: ['Corrida de Rua', 'Trail Running', 'Ultra Maratona'] },
            { key: 'melhores_tempos', label: 'Melhores Tempos', type: 'textarea' }
        ]
    }
];

async function run() {
    const endpoint = `${URL}/rest/v1/sports`;
    console.log('Posting to', endpoint);

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': KEY,
            'Authorization': `Bearer ${KEY}`,
            'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(sportsData)
    });

    if (res.ok) {
        console.log('SUCCESS! Sports inserted.');
    } else {
        const txt = await res.text();
        console.error('ERROR:', res.status, txt);
    }
}
run();
