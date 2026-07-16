import { useQueryClient } from "@tanstack/react-query";
import { useMarkDuePaid as useMarkDuePaidMutation } from "@/api/generated/hooks/duesHooks";
import { DUES } from "@/api/modules/dues";

/** Marca a própria mensalidade como paga (jogador) e invalida a lista de mensalidades do grupo. */
export function useMarkDuePaid(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useMarkDuePaidMutation({
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
