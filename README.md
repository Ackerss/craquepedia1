# Craquepedia — central interna

Plataforma interna da Craquepedia (Jacson e Diego) para gerenciar os atletas clientes:
cadastro, formulário de coleta de dados, pacotes/serviços, quadro de entregas, financeiro,
currículos automáticos (14 modelos, todos em PT ou EN, alguns por modalidade), cartão digital, portfólio (3 visuais),
artes automáticas para Instagram, contatos de clubes/olheiros com registro de envios, recibo, proposta comercial e textos com IA.

## Stack
Next.js 16 (App Router) · React 19 · Tailwind v4 · Drizzle + Postgres (Neon) · Vercel AI Gateway.

## Rodar local
```bash
cp .env.example .env.local   # preencha DATABASE_URL
npm install
npm run dev
```
As tabelas são criadas sozinhas no primeiro start (`src/instrumentation.ts`).
No primeiro acesso, a tela de login pede para criar o usuário administrador.

## Banco
Depois de mudar `src/db/schema.ts`: `npm run db:generate` (gera a migração e embute no código).

## Páginas públicas
`/f/[token]` formulário do atleta · `/cv/[slug]` currículo (`?m=modelo&lang=en`) · `/c/[slug]` cartão · `/p/[slug]` portfólio (`?tema=arena|impacto|editorial`).

Internas: `/api/arte/[id]?tipo=apresentacao|numeros|conquistas|vitrine&fmt=post|story` (PNG), `/doc/recibo/[pagamento]`, `/doc/proposta/[atleta]`.

Imagens dos esportes: `public/sports/*.jpg` (mesmo tratamento de cor para todas). Ícones: `src/components/ui/SportIcon.tsx`.
