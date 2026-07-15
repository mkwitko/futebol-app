import { useQueryClient } from "@tanstack/react-query";
import { useFinalizeMatch as useFinalizeMatchMutation } from "@/api/generated/hooks/matchesHooks";
import { MATCHES } from "@/api/modules/matches";
import { VOTES } from "@/api/modules/votes";

/**
 * Finaliza a pelada (organizador) — fecha a votação e roda o motor de
 * carreira (níveis dos jogadores). Invalida o detalhe da pelada (status vira
 * `closed`), a lista de peladas do grupo e a tally de votos (a lista para de
 * aceitar novos votos, mas o cache pode ter ficado obsoleto).
 */
export function useFinalizeMatch(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useFinalizeMatchMutation({
    mutation: {
      onSuccess: (match) => {
        void queryClient.invalidateQueries({ queryKey: MATCHES.detailQueryKey(matchId) });
        void queryClient.invalidateQueries({ queryKey: MATCHES.queryKeyRoot(match.groupId) });
        void queryClient.invalidateQueries({ queryKey: VOTES.tallyQueryKey(matchId) });
      },
    },
  });

  return {
    mutateAsync: () => mutation.mutateAsync({ id: matchId }),
    isPending: mutation.isPending,
  };
}
