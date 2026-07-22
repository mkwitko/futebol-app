import { useQueryClient } from "@tanstack/react-query";
import { useSubscribeBilling } from "@/api/generated/hooks/billingHooks";
import type { SubscribeBillingMutationResponse } from "@/api/generated/types/SubscribeBilling";
import { BILLING, type PlanKey } from "@/api/modules/billing";
import { onlyDigits } from "@/schemas/billing/subscribe.schema";

export type SubscribeInput = {
  plan: PlanKey;
  taxId: string;
  phone: string;
};

/**
 * Assina um plano via Woovi PIX Automático (`POST /billing/subscribe`).
 * `taxId` vai só com dígitos (a tela aceita CPF com ou sem máscara). Em
 * sucesso invalida `GET /billing/me` — a resposta traz o `emv` (copia-e-cola)
 * pra mostrar no `PaymentSheet`; a tela decide como exibir.
 */
export function useSubscribe() {
  const queryClient = useQueryClient();
  const mutation = useSubscribeBilling({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: BILLING.queryKeyRoot });
      },
    },
  });

  return {
    mutateAsync: (input: SubscribeInput): Promise<SubscribeBillingMutationResponse> =>
      mutation.mutateAsync({
        data: { plan: input.plan, taxId: onlyDigits(input.taxId), phone: input.phone },
      }),
    isPending: mutation.isPending,
  };
}
