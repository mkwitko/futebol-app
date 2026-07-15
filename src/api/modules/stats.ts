import { listStatsQueryKey } from "@/api/generated/hooks/statsHooks";

/**
 * Constantes do módulo `stats` — usadas para invalidação de cache (nunca
 * string crua). As estatísticas são escopadas pela pelada, então a raiz da
 * query-key depende do `matchId`. Ver KUBB.md §8 na skill do app.
 */
export const STATS = {
  queryKeyRoot: (matchId: string) => listStatsQueryKey(matchId),
} as const;
