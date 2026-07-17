import { listJoinRequestsQueryKey } from "@/api/generated/hooks/join-requestsHooks";

/**
 * Constantes do módulo `join-requests` — usadas para invalidação de cache
 * (nunca string crua). A lista de pedidos é escopada por pelada, então a raiz
 * da query-key depende do `matchId`. Ver KUBB.md §8 na skill do app.
 */
export const JOIN_REQUESTS = {
  listQueryKey: (matchId: string) => listJoinRequestsQueryKey(matchId),
} as const;
