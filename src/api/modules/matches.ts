import { listMatchesQueryKey } from "@/api/generated/hooks/matchesHooks";

/**
 * Constantes do módulo `matches` — usadas para invalidação de cache (nunca
 * string crua). As peladas (partidas) são escopadas por grupo, então a raiz
 * da query-key depende do `groupId`. Ver KUBB.md §8 na skill do app.
 */
export const MATCHES = {
  queryKeyRoot: (groupId: string) => listMatchesQueryKey(groupId),
} as const;
