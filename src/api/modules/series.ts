import { getSeriesQueryKey, listGroupSeriesQueryKey } from "@/api/generated/hooks/seriesHooks";

/**
 * Constantes do módulo `series` — usadas para invalidação de cache (nunca
 * string crua). Séries são escopadas por grupo (lista) e têm detalhe próprio
 * por id — mesmo padrão de `MATCHES` (ver `api/modules/matches.ts`).
 */
export const SERIES = {
  queryKeyRoot: (groupId: string) => listGroupSeriesQueryKey(groupId),
  detailQueryKey: (seriesId: string) => getSeriesQueryKey(seriesId),
} as const;
