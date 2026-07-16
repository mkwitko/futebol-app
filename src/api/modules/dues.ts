import { listGroupDuesQueryKey } from "@/api/generated/hooks/duesHooks";

/**
 * Constantes do módulo `dues` (mensalidades) — usadas para invalidação de
 * cache (nunca string crua). A lista é escopada por grupo (e opcionalmente
 * por mês via `params`), então a raiz da query-key (sem `params`) já é
 * prefixo de qualquer mês consultado — invalidar a raiz basta para cobrir
 * todos os meses em cache. Ver KUBB.md §8 na skill do app.
 */
export const DUES = {
  queryKeyRoot: (groupId: string) => listGroupDuesQueryKey(groupId),
} as const;
