import { useQueryClient } from "@tanstack/react-query";
import { useCancelBilling } from "@/api/generated/hooks/billingHooks";
import { BILLING } from "@/api/modules/billing";

/**
 * Cancela a assinatura ativa (`POST /billing/cancel`) e invalida `GET
 * /billing/me` em caso de sucesso, pra a tela de planos voltar a mostrar o
 * estado "sem assinatura".
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const mutation = useCancelBilling({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: BILLING.queryKeyRoot });
      },
    },
  });

  return {
    mutateAsync: () => mutation.mutateAsync(),
    isPending: mutation.isPending,
  };
}
