import { useGetPaymentsConfig } from "@/api/generated/hooks/paymentsHooks/useGetPaymentsConfig";

/**
 * Config de pagamentos in-app — consome `GET /payments/config`
 * (`{ enabled }`). Espelha `useEntitlements`/`usePaymentsEnabled` do módulo
 * `billing`: defaults conservadores enquanto carrega/erro (`enabled: false`),
 * então a UI de cobrança via Woovi (Pix) só aparece quando o backend confirma
 * que o fluxo está habilitado.
 */
export function usePaymentsConfig() {
  const query = useGetPaymentsConfig();
  return {
    ...query,
    enabled: query.data?.enabled ?? false,
  };
}

/**
 * `true` quando o fluxo de pagamentos in-app (Woovi/Pix) deve aparecer.
 * `false` enquanto `/payments/config` não resolveu ou em erro — nesses casos
 * o app esconde toda a superfície de cobrança (botão de pagar presença/mensalidade).
 */
export function usePaymentsEnabled(): boolean {
  const { enabled } = usePaymentsConfig();
  return enabled;
}
