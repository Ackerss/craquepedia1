import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Instância do Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const AI_MODEL = "gemini-2.5-flash"; // Modelo rápido, barato e excelente para estruturação JSON

export async function POST(request: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Chave da API do Gemini não configurada no servidor.' }, { status: 500 });
        }

        const body = await request.json();
        const { submissionId } = body;

        if (!submissionId) {
            return NextResponse.json({ error: 'ID da submission não fornecido' }, { status: 400 });
        }

        // 1. Buscar Cadastro Bruto
        const { data: submission, error: subError } = await supabaseAdmin
            .from('submissions')
            .select('*')
            .eq('id', submissionId)
            .single();

        if (subError || !submission) {
            console.error("Erro ao buscar submission:", subError);
            return NextResponse.json({ error: 'Cadastro não encontrado' }, { status: 404 });
        }

        // Marcar visualmente como 'Analisando...' caso existam webhooks no futuro
        await supabaseAdmin
            .from('submissions')
            .update({ ai_review_status: 'analisando' })
            .eq('id', submissionId);

        // 2. Preparar Prompt para IA
        // A missão da IA é: Corrigir erros de gramática sem inventar dados, mapear o que falta e separar biografia.
        const model = genAI.getGenerativeModel({
            model: AI_MODEL,
            generationConfig: {
                // Forçando o retorno estrito em JSON para não quebrar nosso sistema
                responseMimeType: "application/json",
            }
        });

        const prompt = `
Você é um AI Reviewer de Esportes Profissional analisando um formulário de cadastro bruto enviado por um atleta.
Sua missão é gerar uma versão limpa, melhorada e estruturada dos dados para o painel admin (perfil mestre), sem NUNCA deletar os dados originais e sem NUNCA inventar dados que não foram fornecidos.

DADOS DO ATLETA:
Nome: ${submission.full_name} (${submission.sport_nickname || 'Sem apelido'})
Esporte: ${submission.sport_name}
Data de Nascimento: ${submission.birth_date || 'Não informada'}
Localização: ${submission.city || '-'} / ${submission.state || '-'}

[DADOS GERAIS SUBMETIDOS]
${JSON.stringify(submission.general_data, null, 2)}

[DADOS TÉCNICOS ESPECÍFICOS DO ESPORTE SUBMETIDOS]
${JSON.stringify(submission.sport_data, null, 2)}

SUAS INTRUÇÕES DE SAÍDA:
Retorne EXATAMENTE UM objeto JSON válido (sem \`\`\`json markdown) respeitando rigorosamente esta estrutura:
{
    "missing_fields": ["lista", "de", "campos", "importantes", "ausentes"],
    "ai_suggested_bio": "Uma biografia textual limpa e contínua baseada APENAS no 'histórico esportivo', 'conquistas' e 'bio' originais, conjugada na terceira pessoa para uso em portfólios profissionais.",
    "ai_suggested_achievements": "Uma lista de conquistas limpa, corrigindo erros de digitação e gramática (Se o original estiver em branco, deixe vazio).",
    "ai_suggested_general_data": { 
        // Mesmos as chaves de general_data original, porém com os textos corrigidos. 
        // Se a bio realocou para ai_suggested_bio, você pode resumir aqui ou repetir.
    },
    "ai_suggested_sport_data": {
        // As chaves de sport_data original, com as respostas padronizadas e limpas (Ex: 'Atancante' vira 'Atacante').
    },
    "ai_score": 85 // Número de 0 a 100 indicando a qualidade e completude do perfil (0 completo vazio, 100 perfeito)
}

REGRA DE OURO: Se o atleta forneceu muito pouco dado (ex: não informou peso, altura, histórico ou conquistas), penalize o "ai_score" (ex: baixe para 40, e inclua "altura", "peso", "histórico" no "missing_fields"). NÃO crie dados falsos de jeito nenhum.
`;

        // 3. Chamar a Gemini API
        console.log("Chamando Gemini API para submission:", submissionId);
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let aiResultPayload;
        try {
            aiResultPayload = JSON.parse(responseText);
        } catch(e) {
            console.error("Falha ao tratar o JSON da IA:", responseText);
            throw new Error("A IA não retornou um JSON válido.");
        }

        const isWeakProfile = aiResultPayload.ai_score < 60;
        const hasMissingFields = aiResultPayload.missing_fields && aiResultPayload.missing_fields.length > 0;

        const newStatus = (isWeakProfile || hasMissingFields) ? 'incompleto' : 'analisado_ia';

        // 4. Salvar os resultados analíticos novamente na Submissions (separado do dado bruto)
        const { error: updateError } = await supabaseAdmin
            .from('submissions')
            .update({
                ai_review_status: 'sucesso',
                status: newStatus,
                missing_fields: aiResultPayload.missing_fields || [],
                ai_suggested_bio: aiResultPayload.ai_suggested_bio || '',
                ai_suggested_achievements: aiResultPayload.ai_suggested_achievements || '',
                ai_suggested_general_data: aiResultPayload.ai_suggested_general_data || {},
                ai_suggested_sport_data: aiResultPayload.ai_suggested_sport_data || {},
                ai_score: aiResultPayload.ai_score || 0,
            })
            .eq('id', submissionId);

        if (updateError) {
            console.error("Erro salvando no supabase:", updateError);
            return NextResponse.json({ error: 'Erro ao salvar os resultados no Supabase.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, ai_score: aiResultPayload.ai_score, new_status: newStatus });

    } catch (error: any) {
        console.error('Erro geral no endpoint de Análise IA:', error);
        
        // Em caso de falha pesada, gravamos visualmente o Erro na base para o Admin saber
        try {
            // clone do request caso possível
            const { submissionId } = await request.clone().json();
            if (submissionId) {
                 await supabaseAdmin.from('submissions').update({ ai_review_status: 'erro' }).eq('id', submissionId);
            }
        } catch(e) {
            // swallow
        }
        
        return NextResponse.json({ error: error?.message || 'Erro interno do servidor' }, { status: 500 });
    }
}
