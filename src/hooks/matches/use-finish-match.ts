import { useQueryClient } from "@tanstack/react-query";
import { useFinishMatch as useFinishMatchMutation } from "@/api/generated/hooks/matchesHooks";
import { MATCHES } from "@/api/modules/matches";

/** Encerra a pelada e invalida o detalhe + a lista de peladas do grupo em caso de sucesso. */
export function useFinishMatch(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useFinishMatchMutation({
    mutation: {
      onSuccess: (match) => {
        void queryClient.invalidateQueries({ queryKey: MATCHES.detailQueryKey(matchId) });
        void queryClient.invalidateQueries({ queryKey: MATCHES.queryKeyRoot(match.groupId) });
      },
    },
  });

  return {
    mutateAsync: () => mutation.mutateAsync({ id: matchId }),
    isPending: mutation.isPending,
  };
}
