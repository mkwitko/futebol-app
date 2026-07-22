import { useGetBillingMe } from "@/api/generated/hooks/billingHooks";
import type { GetBillingMe200 } from "@/api/generated/types/GetBillingMe";
import type { FeatureKey, PlanKey } from "@/api/modules/billing";

export type SubscriptionStatus = NonNullable<GetBillingMe200["status"]>;

/**
 * Entitlements do usuário logado — consome `GET /billing/me` (`{ features,
 * paymentsEnabled, plan, status }`, Woovi PIX Automático). O backend é a
 * fonte de verdade; o app só obedece o que ele resolve (inclusive o bypass de
 * conta revisora, que volta `paymentsEnabled: false`).
 *
 * Defaults conservadores enquanto carrega/erro: `features: []`,
 * `paymentsEnabled: false`, `plan`/`status: null` — ou seja, na dúvida a UI
 * de pagamento fica escondida (nunca pisca compra in-app antes de sabermos
 * que é permitida) e nunca mostra um plano/status que não foi confirmado.
 */
export function useEntitlements() {
  const query = useGetBillingMe();
  return {
    ...query,
    features: query.data?.features ?? [],
    paymentsEnabled: query.data?.paymentsEnabled ?? false,
    plan: (query.data?.plan ?? null) as PlanKey | null,
    status: (query.data?.status ?? null) as SubscriptionStatus | null,
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
