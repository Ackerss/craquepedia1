import { brl, firstName } from "./utils";

/** Mensagem pronta de cobrança (com a chave Pix, se estiver nas Configurações). */
export function chargeMessage(name: string, remainingCents: number, title: string, pix?: string) {
  return `Oi ${firstName(name)}! Tudo bem? Passando para lembrar do pagamento de ${brl(remainingCents)} referente a ${title}.${pix ? `\n\nChave Pix: ${pix}` : ""}\n\nQualquer dúvida estou à disposição! 🙏`;
}
