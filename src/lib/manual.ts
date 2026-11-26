// Conteúdo do Manual (página /manual). Texto simples, para a equipe consultar no dia a dia.
// As imagens ficam em public/manual/ e os números das etapas batem com os números desenhados nelas.

export type ManualStep = { text: string; tip?: string };
export type ManualPhase = {
  key: string;
  title: string;
  short: string;
  icon: "orcamento" | "fechamento" | "dados" | "perfil" | "revisao" | "producao" | "entrega" | "divulgacao";
  goal: string;
  steps: ManualStep[];
  images: { src: string; caption: string }[];
  link: { href: string; label: string };
  done: string;
};

export const MANUAL: ManualPhase[] = [
  {
    key: "orcamento",
    title: "Orçamento",
    short: "Proposta em PDF",
    icon: "orcamento",
    goal: "Mandar ao atleta (ou à família) uma proposta bonita, com pacotes e preços, em poucos minutos.",
    steps: [
      { text: "Em **Atletas**, clique em **Novo atleta**. Basta nome, esporte e WhatsApp. Em **Status**, escolha **Negociando**." },
      { text: "Abra o atleta e vá na aba **Financeiro**. Clique em **Proposta comercial (PDF)**." },
      { text: "Na proposta, clique em **Enviar link no WhatsApp**: o atleta abre a proposta no celular, sem precisar de PDF. Se preferir o arquivo, use **Baixar PDF da proposta**." },
    ],
    images: [
      { src: "/manual/01-financeiro.webp", caption: "Aba Financeiro do atleta: o botão da proposta fica no topo." },
      { src: "/manual/02-proposta.webp", caption: "A proposta já sai com os pacotes, os preços e a validade." },
    ],
    link: { href: "/atletas/novo", label: "Cadastrar atleta" },
    done: "Proposta enviada e atleta com status Negociando.",
  },
  {
    key: "fechamento",
    title: "Fechamento",
    short: "Contrato e pagamento",
    icon: "fechamento",
    goal: "Registrar o que foi vendido. O sistema cria sozinho todas as tarefas (entregas) com prazo.",
    steps: [
      { text: "Na página do atleta, aba **Financeiro**, clique em **Novo contrato** (ou em **Contratar serviços**, na aba Entregas). Escolha o **pacote** (ou serviços avulsos), o valor e quanto já foi pago." },
      { text: "Confirme. As entregas aparecem na aba **Entregas** e na tela geral **Entregas**, cada uma com prazo e checklist." },
      { text: "Quando o dinheiro cair, use **Registrar pagamento** no contrato. Clique em **recibo**, ao lado do pagamento, e depois em **Enviar no WhatsApp**: o atleta recebe o link do recibo." },
      { text: "Lançou errado? Apague o pagamento na **lixeira** ao lado dele, ou ajuste o valor do contrato no **lápis** (desconto, mudança de pacote). O sistema recalcula sozinho." },
      { text: "Mude o status do atleta para **Ativo**.", tip: "Preços e pacotes se mudam em Configurações → Pacotes / Serviços." },
    ],
    images: [{ src: "/manual/03-contratar.webp", caption: "Contratar serviços: escolha o pacote e as entregas são criadas automaticamente." }],
    link: { href: "/financeiro", label: "Abrir Financeiro" },
    done: "Contrato registrado, entregas criadas e entrada recebida.",
  },
  {
    key: "dados",
    title: "Coleta de dados",
    short: "Formulário por link",
    icon: "dados",
    goal: "O atleta preenche tudo pelo celular (dados, carreira, conquistas e fotos). Você não precisa digitar nada.",
    steps: [
      { text: "Vá em **Formulários** e clique em **Novo link de formulário**. Informe nome, WhatsApp e esporte. Se o pacote já está fechado, escolha-o: as entregas são criadas quando ele responder." },
      { text: "Clique em **Gerar link** e depois em **Enviar no WhatsApp**: a mensagem já vai pronta com o link." },
      { text: "Quando o atleta enviar, ele aparece no **Painel** em **Formulários recebidos** com a etiqueta **Novo**. Em cerca de 1 minuto a IA organiza o perfil e faz a revisão sozinha." },
      { text: "O atleta não respondeu? Em **Formulários**, o botão **Lembrar** abre o WhatsApp com um lembrete pronto.", tip: "Se o atleta fechar o formulário no meio, o que ele já digitou fica salvo no celular dele." },
    ],
    images: [
      { src: "/manual/04-formularios.webp", caption: "Formulários: crie o link e mande pelo WhatsApp." },
      { src: "/manual/05-form-celular.webp", caption: "O que o atleta vê no celular." },
    ],
    link: { href: "/formularios", label: "Abrir Formulários" },
    done: "Formulário recebido e perfil criado.",
  },
  {
    key: "perfil",
    title: "Perfil completo",
    short: "Conferir e completar",
    icon: "perfil",
    goal: "Deixar o perfil completo, porque é dele que saem currículo, portfólio, cartão e artes.",
    steps: [
      { text: "Abra o atleta e confira a aba **Perfil**. Se os dados vieram por fora (áudio, conversa), use **Organizar com IA**: ela escreve a bio em português e inglês e organiza carreira, conquistas e números." },
      { text: "Veja o medidor **Perfil pronto para materiais**. Cada item que falta é um atalho: clique e complete." },
      { text: "Faltou algo do atleta? Use **Pedir dados ao atleta**: abre o WhatsApp com a lista do que falta. O formulário já chega preenchido com o que temos; ele só completa." },
      { text: "Na aba **Fotos**, escolha a foto principal (rosto, fundo limpo), a capa (horizontal, em ação) e a galeria." },
    ],
    images: [{ src: "/manual/06-perfil.webp", caption: "Página do atleta: Organizar com IA, abas e o medidor de perfil pronto." }],
    link: { href: "/atletas", label: "Abrir Atletas" },
    done: "Medidor perto de 100% e fotos escolhidas.",
  },
  {
    key: "revisao",
    title: "Revisão com IA",
    short: "Pente-fino antes de gerar",
    icon: "revisao",
    goal: "Um “revisor” confere tudo antes de gerar os materiais: português, inglês, datas, exageros e o que os clubes da modalidade mais pedem.",
    steps: [
      { text: "Na aba **Perfil**, no quadro **Revisão final com IA**, clique em **Revisar agora** (leva até 30 segundos)." },
      { text: "Leia os pontos: vermelho = **corrigir**, amarelo = **ajustar**, roxo = **dica**." },
      { text: "Quando houver texto sugerido, clique em **Aplicar correção**. Se não concordar, **Ignorar**. Pontos sem texto (ex.: falta vídeo) se resolvem em **Editar perfil**." },
      { text: "Mexeu no perfil? Clique em **Revisar de novo**. A meta é ver **Pronto para enviar**.", tip: "A IA nunca inventa fatos: ela só corrige e reorganiza o que existe." },
    ],
    images: [{ src: "/manual/07-revisao.webp", caption: "Revisão final: nota, veredito e cada ponto com o botão de aplicar." }],
    link: { href: "/atletas", label: "Escolher atleta" },
    done: "Revisão sem pontos vermelhos e veredito “Pronto para enviar”.",
  },
  {
    key: "producao",
    title: "Produção",
    short: "Currículo, portfólio e artes",
    icon: "producao",
    goal: "Gerar os materiais com um clique e acompanhar cada entrega até ficar pronta.",
    steps: [
      { text: "Aba **Materiais**: escolha o modelo de currículo (os recomendados para o esporte aparecem primeiro), em **PT** ou **EN**, e clique em **Baixar PDF**." },
      { text: "Clique na **★** do modelo preferido para torná-lo o **currículo oficial**: é ele que abre no link público que vai para clubes e olheiros (sem a lista de modelos, só idioma e download)." },
      { text: "Ainda em Materiais, escolha o **tema do portfólio** (site do atleta) e copie os links do portfólio e do cartão digital." },
      { text: "Aba **Artes**: baixe o post e o story para o Instagram já com foto, números e QR code." },
      { text: "Na tela **Entregas**, vá clicando em **Mover para…** em cada cartão: A fazer → Em produção → Revisão → Entregue. Marque o checklist de cada uma." },
    ],
    images: [
      { src: "/manual/08-materiais.webp", caption: "Materiais: modelos de currículo, portfólio e cartão." },
      { src: "/manual/09-curriculo.webp", caption: "Currículo pronto para salvar em PDF (português ou inglês)." },
      { src: "/manual/10-entregas.webp", caption: "Entregas: cada cartão anda pelas etapas até Entregue." },
    ],
    link: { href: "/entregas", label: "Abrir Entregas" },
    done: "Todas as entregas na coluna Revisão, com materiais conferidos.",
  },
  {
    key: "entrega",
    title: "Entrega ao atleta",
    short: "Enviar e receber o saldo",
    icon: "entrega",
    goal: "Entregar tudo de uma vez, de forma profissional, e fechar o financeiro.",
    steps: [
      { text: "Currículo, cartão e portfólio já têm o link pronto no cartão da entrega (**abrir**). Para vídeo e artes, clique no **lápis** e cole o link (Drive, YouTube…)." },
      { text: "Na etapa **Revisão**, use **enviar ao atleta**: abre o WhatsApp com a mensagem e o link do material. Depois clique em **Mover para Entregue**." },
      { text: "Na aba **Perfil**, em **Textos prontos com IA**, gere a **WhatsApp de entrega** e mande com os links (currículo, portfólio, cartão e artes)." },
      { text: "Se houver saldo, use **Cobrar** (a mensagem já leva a chave Pix das Configurações) e depois **Registrar pagamento**. Envie o **recibo** pelo link." },
    ],
    images: [{ src: "/manual/11-textos.webp", caption: "Textos prontos com IA: mensagem de entrega, legenda, e-mail para clubes e mais." }],
    link: { href: "/entregas", label: "Abrir Entregas" },
    done: "Atleta recebeu tudo, pagamento quitado e recibo enviado.",
  },
  {
    key: "divulgacao",
    title: "Divulgação",
    short: "Clubes e retorno",
    icon: "divulgacao",
    goal: "Apresentar o atleta a clubes, olheiros e universidades e não esquecer de cobrar o retorno.",
    steps: [
      { text: "Em **Contatos**, cadastre clubes, olheiros e universidades com os esportes de interesse." },
      { text: "No atleta, aba **Divulgação**: o sistema sugere os contatos do esporte. Escolha, abra a mensagem pronta (português ou inglês) e envie." },
      { text: "O envio fica registrado e, 7 dias depois, aparece no Painel em **Cobrar retorno de clubes**, com a mensagem de cobrança pronta no WhatsApp, **adiar 7 dias** ou **sem retorno**. Atualize o status: respondeu, interessado, teste…" },
    ],
    images: [{ src: "/manual/12-divulgacao.webp", caption: "Divulgação: contatos sugeridos e histórico de envios do atleta." }],
    link: { href: "/contatos", label: "Abrir Contatos" },
    done: "Atleta apresentado e retornos acompanhados.",
  },
];

export const MANUAL_FAQ: { q: string; a: string }[] = [
  {
    q: "A IA pode inventar alguma conquista ou número?",
    a: "Não deve. Ela recebe a regra de usar só o que está no perfil. Mesmo assim, a revisão final existe para alguém da equipe bater o olho antes de enviar.",
  },
  {
    q: "Quanto custa a IA?",
    a: "Com a chave grátis do Gemini (Configurações → Inteligência artificial) o uso normal da Craquepedia fica dentro da cota gratuita do Google. Se a cota do dia acabar, a plataforma usa a IA da Vercel como reserva.",
  },
  {
    q: "O atleta consegue entrar na plataforma?",
    a: "Não. Só vocês dois entram. O atleta só preenche o formulário pelo link e vê o currículo, o portfólio e o cartão pelos links públicos.",
  },
  {
    q: "Como tiro um atleta do ar?",
    a: "Na página do atleta, desmarque **Links públicos ativos**. Currículo, portfólio e cartão deixam de abrir para quem tem o link.",
  },
  {
    q: "Mudei a foto ou um dado. Preciso refazer o currículo?",
    a: "Não. Currículo, portfólio, cartão e artes são gerados na hora a partir do perfil. Só baixe o PDF de novo. Rode a revisão de novo se mudou textos.",
  },
  {
    q: "Dá para tirar uma planilha com tudo?",
    a: "Sim. Os botões **Planilha** em Atletas e Contatos, e **Exportar planilha** no Financeiro, baixam um arquivo que abre no Excel ou no Google Planilhas. Serve também como cópia de segurança.",
  },
  {
    q: "O que aparece no Painel?",
    a: "Entregas atrasadas e dos próximos 3 dias, formulários novos, retornos de clubes para cobrar, **aniversários da semana** (com mensagem de parabéns pronta) e atletas **em negociação** com atalho para a proposta.",
  },
  {
    q: "Como crio o acesso do Diego?",
    a: "Configurações → Equipe: informe nome, usuário e uma senha provisória (pode ser simples, como 1234) e clique em \"Copiar acesso para enviar\". Se ele já tem usuário ou esqueceu a senha, clique em \"Definir senha\" ao lado do nome. No primeiro login aparece um aviso para ele criar uma senha só dele em Configurações → Minha senha.",
  },
  {
    q: "Errei a senha várias vezes e bloqueou. E agora?",
    a: "Depois de 5 senhas erradas seguidas o acesso fica bloqueado por 15 minutos (proteção contra quem tenta adivinhar). Espere ou peça para a outra pessoa da equipe usar \"Definir senha\" em Configurações → Equipe, que desbloqueia na hora.",
  },
];
