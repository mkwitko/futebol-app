/**
 * Constantes do módulo `auth` — usadas para invalidação de cache (nunca string
 * crua). Ver KUBB.md §8 na skill do app.
 */
export const AUTH = {
  ME_ENDPOINT: "/auth/me",
  queryKeyRoot: [{ url: "/auth/me" }] as const,
} as const;
