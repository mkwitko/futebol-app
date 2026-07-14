import { useCallback, useEffect, useState } from "react";

const DEFAULT_AUTO_DISMISS_MS = 3000;

/**
 * Feedback inline controlado pela tela (o `Toast` de `components/ui` não é um
 * portal global — cada tela guarda seu próprio texto/visibilidade). Este hook
 * centraliza o padrão "mostrar + auto-dismiss + dismiss manual" usado após
 * mutações bem-sucedidas (criar grupo, adicionar/editar jogador...).
 */
export function useToast(autoDismissMs: number = DEFAULT_AUTO_DISMISS_MS) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), autoDismissMs);
    return () => clearTimeout(id);
  }, [message, autoDismissMs]);

  const show = useCallback((next: string) => setMessage(next), []);
  const dismiss = useCallback(() => setMessage(null), []);

  return { message, show, dismiss };
}
