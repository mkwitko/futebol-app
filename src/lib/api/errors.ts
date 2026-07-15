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

/**
 * 404 do backend — usado para tratar "ainda não existe" como estado vazio em
 * vez de erro de tela (ex.: times ainda não montados via `getTeams`, antes do
 * primeiro `generateTeams`).
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/**
 * 409 do backend — "transição de estado inválida agora": janela de votação
 * fechada (`VOTE.WINDOW_CLOSED`, também cobre a pelada ainda não estar
 * `finished`), pelada não finalizável (`MTC.NOT_FINALIZABLE`) etc. Usado para
 * distinguir esse caso de um erro genérico e mostrar um estado amigável em
 * vez de um toast de erro cru.
 */
export function isConflictError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 409;
}
