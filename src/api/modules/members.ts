import { listMembersQueryKey } from "@/api/generated/hooks/membersHooks";

/**
 * Constantes do módulo `members` — usadas para invalidação de cache (nunca
 * string crua). O elenco é escopado por grupo, então a raiz da query-key
 * depende do `groupId`. Ver KUBB.md §8 na skill do app.
 */
export const MEMBERS = {
  queryKeyRoot: (groupId: string) => listMembersQueryKey(groupId),
} as const;
