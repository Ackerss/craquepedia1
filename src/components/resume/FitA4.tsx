"use client";

import { useLayoutEffect, useRef } from "react";

const W = 794;
const H = 1123;

/**
 * Faz cada folha caber em 1 página A4: se o atleta tem muito conteúdo, a folha é
 * montada maior e reduzida por igual (como "ajustar à página" da impressora),
 * em vez de sobrar um pedaço numa 2ª folha quase vazia.
 */
export function FitA4({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const fit = () => {
      for (const page of Array.from(root.querySelectorAll<HTMLElement>(".print-page"))) {
        let z = 1;
        for (let i = 0; i < 5; i++) {
          // mede sem zoom, na largura em que a folha vai ser montada
          page.style.zoom = "";
          page.style.width = `${W / z}px`;
          page.style.minHeight = "0px";
          const h = page.scrollHeight;
          if (h <= H / z + 1) break;
          z = Math.max(0.55, H / h);
        }
        page.style.width = `${W / z}px`;
        page.style.minHeight = `${H / z}px`;
        page.style.zoom = z < 1 ? String(z) : "";
      }
    };
    fit();
    // fontes e fotos mudam a altura quando terminam de carregar
    document.fonts?.ready.then(fit).catch(() => {});
    const imgs = Array.from(root.querySelectorAll("img")).filter((i) => !i.complete);
    imgs.forEach((i) => i.addEventListener("load", fit, { once: true }));
    return () => imgs.forEach((i) => i.removeEventListener("load", fit));
  }, [children]);
  return <div ref={ref}>{children}</div>;
}
