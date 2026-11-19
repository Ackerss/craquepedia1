export const CONTACT_KINDS = [
  { key: "clube", label: "Clube" },
  { key: "olheiro", label: "Olheiro / Scout" },
  { key: "empresario", label: "Empresário / Agência" },
  { key: "universidade", label: "Universidade (EUA)" },
  { key: "imprensa", label: "Imprensa / Mídia" },
  { key: "patrocinador", label: "Patrocinador / Marca" },
  { key: "outro", label: "Outro" },
] as const;

export const OUTREACH_STATUS = [
  { key: "enviado", label: "Enviado", color: "#64748b" },
  { key: "respondeu", label: "Respondeu", color: "#2563eb" },
  { key: "interessado", label: "Interessado", color: "#7c3aed" },
  { key: "teste", label: "Teste / Avaliação", color: "#16a34a" },
  { key: "sem_retorno", label: "Sem retorno", color: "#d97706" },
  { key: "recusou", label: "Recusou", color: "#dc2626" },
] as const;

export function kindLabel(k?: string | null) {
  return CONTACT_KINDS.find((x) => x.key === k)?.label ?? "Outro";
}
