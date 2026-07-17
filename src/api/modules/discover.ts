/**
 * Constantes do módulo `discover` — usadas para invalidação de cache (nunca
 * string crua). A descoberta depende de filtros (raio/modalidade/preço/coords),
 * então a raiz da query-key é só o prefixo do endpoint: invalidar por ela pega
 * qualquer variação de filtro em cache. Ver KUBB.md §8 na skill do app.
 */
export const DISCOVER = {
  queryKeyRoot: [{ url: "/discover" }] as const,
} as const;
