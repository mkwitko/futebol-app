import { useGetBillingMe } from "@/api/generated/hooks/billingHooks";
import type { FeatureKey } from "@/api/modules/billing";

/**
 * Entitlements do usuário logado — consome `GET /billing/me`
 * (`{ features, paymentsEnabled }`). O Stripe é a fonte de verdade; o app só
 * obedece o que o backend resolve (inclusive o bypass de conta revisora, que
 * volta `paymentsEnabled: false`).
 *
 * Defaults conservadores enquanto carrega/erro: `features: []` e
 * `paymentsEnabled: false` — ou seja, na dúvida a UI de pagamento fica
 * escondida (nunca pisca compra in-app antes de sabermos que é permitida).
 */
export function useEntitlements() {
  const query = useGetBillingMe();
  return {
    ...query,
    features: query.data?.features ?? [],
    paymentsEnabled: query.data?.paymentsEnabled ?? false,
  };
}

/** `true` se o usuário tem a feature ativa. */
export function useHasFeature(feature: FeatureKey): boolean {
  const { features } = useEntitlements();
  return features.includes(feature);
}

/**
 * `true` quando pagamentos in-app devem aparecer. `false` para conta revisora
 * (bypass) e enquanto `/billing/me` não resolveu — nesses casos o app esconde
 * TODA a superfície de compra (tela de planos, entrada no drawer, CTAs).
 */
export function usePaymentsEnabled(): boolean {
  const { paymentsEnabled } = useEntitlements();
  return paymentsEnabled;
}
