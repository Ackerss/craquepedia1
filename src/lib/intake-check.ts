import { ageFrom, heightCm, weightKg } from "./utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const digits = (s: string) => s.replace(/\D/g, "").length;

/**
 * Confere o formulário do atleta (usado no celular, a cada etapa, e de novo no servidor).
 * Devolve a etapa com problema e a mensagem, ou null se estiver tudo certo.
 */
export function checkIntake(get: (name: string) => string, upToStep = 99): { step: number; error: string } | null {
  const v = (n: string) => (get(n) ?? "").trim();
  if (upToStep >= 1) {
    const e = (error: string) => ({ step: 1, error });
    if (v("fullName").split(/\s+/).filter(Boolean).length < 2) return e("Informe seu nome completo (nome e sobrenome).");
    if (v("fullName").length > 120) return e("O nome ficou comprido demais. Escreva só o nome completo.");
    const birth = v("birthDate");
    if (!birth) return e("Informe sua data de nascimento.");
    const age = ageFrom(birth);
    if (age === null || age < 4 || age > 70) return e("Confira a data de nascimento: ela parece errada.");
    const phone = digits(v("phone"));
    if (phone < 10 || phone > 13) return e("Informe um WhatsApp válido com DDD. Ex.: (11) 98765-4321");
    if (v("email") && !EMAIL.test(v("email"))) return e("Confira o e-mail: ele parece incompleto (ex.: nome@gmail.com).");
    if (age < 18) {
      if (!v("guardianName") || digits(v("guardianPhone")) < 10)
        return e("Como você é menor de 18 anos, informe o nome e o WhatsApp do seu responsável.");
    }
  }
  if (upToStep >= 2) {
    const e = (error: string) => ({ step: 2, error });
    if (v("heightCm") && heightCm(v("heightCm")) === null) return e("Confira a altura: use centímetros (ex.: 178) ou metros (ex.: 1,78).");
    if (v("weightKg") && weightKg(v("weightKg")) === null) return e("Confira o peso em quilos (ex.: 72).");
  }
  return null;
}
