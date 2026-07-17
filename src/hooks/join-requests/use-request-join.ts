import { useQueryClient } from "@tanstack/react-query";
import { useRequestJoin as useRequestJoinMutation } from "@/api/generated/hooks/join-requestsHooks";
import { DISCOVER } from "@/api/modules/discover";

/**
 * Pede pra entrar numa pelada pública com `joinPolicy=request` — cria um
 * `JoinRequest` pendente que o organizador aprova/recusa depois. Invalida a
 * descoberta no sucesso (o card pode refletir o pedido feito).
 */
export function useRequestJoin() {
  const queryClient = useQueryClient();

  const mutation = useRequestJoinMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: DISCOVER.queryKeyRoot });
      },
    },
  });

  return {
    mutateAsync: (matchId: string) => mutation.mutateAsync({ id: matchId }),
    isPending: mutation.isPending,
  };
}
