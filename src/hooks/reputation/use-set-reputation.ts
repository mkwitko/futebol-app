import { useQueryClient } from "@tanstack/react-query";
import { getReputationQueryKey, useSetReputation as useSetReputationMutation } from "@/api/generated/hooks/reputationHooks";
import type { SetReputationMutationRequest } from "@/api/generated/types/SetReputation";

/**
 * Registra (upsert — substitui, não soma) o conjunto completo de tags de
 * reputação que o usuário logado atribuiu aos demais confirmados da pelada, e
 * invalida a leitura (`GET /matches/:id/reputation`) pra refletir o que acabou
 * de ser salvo.
 */
export function useSetReputation(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useSetReputationMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getReputationQueryKey(matchId) });
      },
    },
  });

  return {
    mutateAsync: (data: SetReputationMutationRequest) => mutation.mutateAsync({ id: matchId, data }),
    isPending: mutation.isPending,
  };
}
