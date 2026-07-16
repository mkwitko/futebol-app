import { useQueryClient } from "@tanstack/react-query";
import { useConfirmDue as useConfirmDueMutation } from "@/api/generated/hooks/duesHooks";
import { DUES } from "@/api/modules/dues";

/**
 * Confirma (ou desfaz, `paid: false`) a mensalidade de um membro — organizador
 * — e invalida a lista de mensalidades do grupo. `groupId` é fixado na
 * criação do hook (conhecido desde o mount, via rota) só para invalidação de
 * cache; o `dueId` é passado em `mutateAsync` (mesmo padrão de
 * `useConfirmPayment`/`useMarkPaid` em `hooks/attendance`).
 */
export function useConfirmDue(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useConfirmDueMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: DUES.queryKeyRoot(groupId) });
      },
    },
  });

  return {
    mutateAsync: (dueId: string, paid: boolean = true) => mutation.mutateAsync({ id: dueId, data: { paid } }),
    isPending: mutation.isPending,
  };
}
