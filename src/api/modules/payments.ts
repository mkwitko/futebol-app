import { getPaymentsConfigQueryKey } from "@/api/generated/hooks/paymentsHooks/useGetPaymentsConfig";

/**
 * Constantes do módulo `payments` — usadas para invalidação de cache (nunca
 * string crua). `GET /payments/config` expõe se o fluxo Woovi (Pix in-app)
 * está habilitado neste ambiente. Ver KUBB.md §8 na skill do app.
 */
export const PAYMENTS = {
  queryKeyRoot: [{ url: "/payments/config" }] as const,
  configQueryKey: () => getPaymentsConfigQueryKey(),
} as const;
