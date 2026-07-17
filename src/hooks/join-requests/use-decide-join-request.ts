import { useQueryClient } from "@tanstack/react-query";
import { useDecideJoinRequest as useDecideJoinRequestMutation } from "@/api/generated/hooks/join-requestsHooks";
import { ATTENDANCE } from "@/api/modules/attendance";
import { JOIN_REQUESTS } from "@/api/modules/join-requests";

/**
 * Aprova/recusa um pedido de entrada (só o organizador). Ao aprovar, o backend
 * confirma a presença; por isso invalidamos tanto a lista de pedidos quanto a
 * lista de presença da pelada.
 */
export function useDecideJoinRequest(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useDecideJoinRequestMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: JOIN_REQUESTS.listQueryKey(matchId) });
        void queryClient.invalidateQueries({ queryKey: ATTENDANCE.queryKeyRoot(matchId) });
      },
    },
  });

  return {
    mutateAsync: (reqId: string, approve: boolean) =>
      mutation.mutateAsync({ id: matchId, reqId, data: { approve } }),
    isPending: mutation.isPending,
  };
}
