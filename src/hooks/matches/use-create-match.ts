import { useQueryClient } from "@tanstack/react-query";
import { useCreateMatch as useCreateMatchMutation } from "@/api/generated/hooks/matchesHooks";
import { MATCHES } from "@/api/modules/matches";
import { GROUPS } from "@/api/modules/groups";
import type { CreateMatchMutationRequest } from "@/api/generated/types/CreateMatch";

/**
 * Cria uma pelada no grupo e invalida, em caso de sucesso: a lista de peladas
 * do grupo (detalhe do grupo) + a lista "meus grupos" e o detalhe do grupo —
 * ambos embutem a "próxima pelada", que fica desatualizada sem isso.
 */
export function useCreateMatch(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useCreateMatchMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: MATCHES.queryKeyRoot(groupId) });
        void queryClient.invalidateQueries({ queryKey: GROUPS.queryKeyRoot });
        void queryClient.invalidateQueries({ queryKey: GROUPS.detailQueryKey(groupId) });
      },
    },
  });

  return {
    mutateAsync: (data: CreateMatchMutationRequest) => mutation.mutateAsync({ id: groupId, data }),
    isPending: mutation.isPending,
  };
}
