import { getTeamsQueryKey } from "@/api/generated/hooks/teamsHooks";

/**
 * Constantes do módulo `teams` — usadas para invalidação de cache (nunca
 * string crua). Os times são escopados pela pelada, então a raiz da
 * query-key depende do `matchId`. Ver KUBB.md §8 na skill do app.
 */
export const TEAMS = {
  queryKeyRoot: (matchId: string) => getTeamsQueryKey(matchId),
} as const;
