import { useQueryClient } from "@tanstack/react-query";
import { useCastVote as useCastVoteMutation } from "@/api/generated/hooks/votesHooks";
import { VOTES } from "@/api/modules/votes";
import type { CastVoteMutationRequest } from "@/api/generated/types/CastVote";

/**
 * Registra (ou troca, upsert) o voto do usuário logado em uma categoria e
 * invalida a tally agregada. O backend fecha a janela de 48h (`WINDOW_CLOSED`,
 * 409) — o chamador trata esse erro para exibir o estado "votação encerrada".
 */
export function useCastVote(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useCastVoteMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: VOTES.tallyQueryKey(matchId) });
      },
    },
  });

  return {
    mutateAsync: (data: CastVoteMutationRequest) => mutation.mutateAsync({ id: matchId, data }),
    isPending: mutation.isPending,
  };
}
