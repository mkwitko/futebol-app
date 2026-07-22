import { useQueryClient } from "@tanstack/react-query";
import { usePayDue as usePayDueMutation } from "@/api/generated/hooks/duesHooks";
import { DUES } from "@/api/modules/dues";

/**
 * Inicia a cobrança PIX (Woovi) da própria mensalidade (`POST
 * /dues/:id/pay`) e invalida a lista de mensalidades do grupo em caso de
 * sucesso. `groupId` é fixado na criação do hook só para invalidação de
 * cache (mesmo padrão de `useConfirmDue`/`useMarkDuePaid`); o `dueId` é
 * passado em `mutateAsync`. Retorna a cobrança pra quem chama abrir o
 * `PaymentSheet`.
 */
export function usePayDue(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = usePayDueMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: DUES.queryKeyRoot(groupId) });
      },
    },
  });

  return {
    mutateAsync: (dueId: string) => mutation.mutateAsync({ id: dueId }),
    isPending: mutation.isPending,
  };
}
