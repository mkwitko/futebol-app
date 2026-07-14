import { ApiError } from "@/api/client";

/**
 * 403 do backend — usado para o toast genérico "somente o organizador" nas
 * ações restritas ao dono do grupo (encerrar/cancelar pelada, confirmar
 * pagamento...). O Fase 0 não faz gating client-side dessas ações (o usuário
 * logado é tratado como organizador); o backend é a fonte da verdade e este
 * helper só traduz o erro em feedback amigável.
 */
export function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}
