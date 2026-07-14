import { useCallback, useEffect, useState } from "react";
import type { ToastVariant } from "@/components/ui/toast";

const DEFAULT_AUTO_DISMISS_MS = 3000;
const DEFAULT_VARIANT: ToastVariant = "success";

/**
 * Feedback inline controlado pela tela (o `Toast` de `components/ui` não é um
 * portal global — cada tela guarda seu próprio texto/visibilidade). Este hook
 * centraliza o padrão "mostrar + auto-dismiss + dismiss manual" usado após
 * mutações (criar grupo, adicionar/editar jogador, ações de pelada...).
 *
 * `variant` é opcional em `show()` (default `"success"`, o único usado pelas
 * telas de grupos/membros — que ignoram o `variant` retornado aqui e passam
 * `"success"` fixo ao próprio `<Toast>`). Telas com feedback de erro (ex.:
 * `match/[id].tsx`) usam `show(message, "danger")` + `toast.variant`.
 */
export function useToast(autoDismissMs: number = DEFAULT_AUTO_DISMISS_MS) {
  const [message, setMessage] = useState<string | null>(null);
  const [variant, setVariant] = useState<ToastVariant>(DEFAULT_VARIANT);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), autoDismissMs);
    return () => clearTimeout(id);
  }, [message, autoDismissMs]);

  const show = useCallback((next: string, nextVariant: ToastVariant = DEFAULT_VARIANT) => {
    setMessage(next);
    setVariant(nextVariant);
  }, []);
  const dismiss = useCallback(() => setMessage(null), []);

  return { message, variant, show, dismiss };
}
