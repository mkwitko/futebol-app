import { listMyGroupsQueryKey } from "@/api/generated/hooks/groupsHooks";

/**
 * Constantes do módulo `groups` — usadas para invalidação de cache (nunca
 * string crua). Ver KUBB.md §8 na skill do app.
 */
export const GROUPS = {
  queryKeyRoot: listMyGroupsQueryKey(),
} as const;
