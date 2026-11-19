"use client";

import { startTransition, type FormEvent } from "react";

/**
 * Envia o formulário sem o "reset automático" do React 19.
 * Assim, se o servidor devolver um erro, nada do que foi digitado se perde.
 */
export function keepValues(dispatch: (fd: FormData) => void, prepare?: (fd: FormData) => void | Promise<void>) {
  return async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const submitter = (e.nativeEvent as SubmitEvent).submitter;
    let fd: FormData;
    try {
      fd = new FormData(form, submitter);
    } catch {
      fd = new FormData(form);
    }
    if (prepare) await prepare(fd);
    startTransition(() => dispatch(fd));
  };
}
