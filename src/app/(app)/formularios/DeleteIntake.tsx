"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteIntake } from "@/actions/intake";

export function DeleteIntake({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(() => deleteIntake(id))} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" title="Apagar link" aria-label="Apagar link">
      <Trash2 className="size-4" />
    </button>
  );
}
