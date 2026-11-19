"use client";

import { Download } from "lucide-react";

export function PrintButton({ label = "Baixar PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary btn-sm">
      <Download className="size-4" /> {label}
    </button>
  );
}
