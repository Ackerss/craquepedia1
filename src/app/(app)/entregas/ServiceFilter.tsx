"use client";

import { useRouter } from "next/navigation";

export function ServiceSelect({ value, services, baseQuery }: { value?: string; services: { key: string; name: string }[]; baseQuery: string }) {
  const router = useRouter();
  return (
    <select
      className="input ml-auto w-auto py-1.5 text-sm"
      defaultValue={value ?? ""}
      aria-label="Filtrar serviço"
      onChange={(e) => {
        const p = new URLSearchParams(baseQuery);
        if (e.target.value) p.set("servico", e.target.value);
        else p.delete("servico");
        router.push(`/entregas${p.toString() ? `?${p}` : ""}`);
      }}
    >
      <option value="">Todos os serviços</option>
      {services.map((x) => (
        <option key={x.key} value={x.key}>
          {x.name}
        </option>
      ))}
    </select>
  );
}
