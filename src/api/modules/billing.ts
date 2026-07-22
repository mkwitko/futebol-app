/**
 * Constantes do módulo `billing` — usadas para invalidação de cache (nunca
 * string crua) e catálogo de features/planos espelhado do backend (que por sua
 * vez espelha os `lookup_key` das features no Stripe). Ver KUBB.md §8.
 */
export const BILLING = {
  ME_ENDPOINT: "/billing/me",
  queryKeyRoot: [{ url: "/billing/me" }] as const,
} as const;

/** Feature-keys (espelham os `lookup_key` das features no Stripe). */
export const FEATURE_KEYS = [
  "public_groups",
  "organizer_ai",
  "seasons",
  "advanced_stats",
  "cosmetics",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

/** Planos vendáveis (correspondem ao enum do `POST /billing/subscribe`). */
export const PLAN_KEYS = ["organizer", "player"] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

/** Features anexadas a cada plano (organizador engloba o jogador). */
export const PLAN_FEATURES: Record<PlanKey, readonly FeatureKey[]> = {
  organizer: ["public_groups", "organizer_ai", "seasons", "advanced_stats", "cosmetics"],
  player: ["advanced_stats", "cosmetics"],
} as const;

/** Plano que cada plano engloba (organizador inclui o jogador). */
export const PLAN_INCLUDES: Record<PlanKey, PlanKey | null> = {
  organizer: "player",
  player: null,
} as const;
