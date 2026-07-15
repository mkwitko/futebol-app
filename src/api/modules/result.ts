import { getResultQueryKey } from "@/api/generated/hooks/resultHooks";

/**
 * Constantes do módulo `result` — usadas para invalidação de cache (nunca
 * string crua). O resultado (placar) é escopado pela pelada, então a raiz da
 * query-key depende do `matchId`. Ver KUBB.md §8 na skill do app.
 */
export const RESULT = {
  queryKeyRoot: (matchId: string) => getResultQueryKey(matchId),
} as const;
