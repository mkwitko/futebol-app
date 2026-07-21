import { useQueryClient } from "@tanstack/react-query";
import { useUpdateMatch as useUpdateMatchMutation } from "@/api/generated/hooks/matchesHooks";
import { GROUPS } from "@/api/modules/groups";
import { MATCHES } from "@/api/modules/matches";
import type { UpdateMatchMutationRequest } from "@/api/generated/types/UpdateMatch";

/**
 * Edita uma pelada (`PATCH /matches/:id`) e invalida, em caso de sucesso: o
 * detalhe da pelada + a lista de peladas do grupo e o detalhe/lista de grupos
 * (que embutem a "próxima pelada"). `groupId` é usado só na invalidação.
 */
export function useUpdateMatch(matchId: string, groupId: string | undefined) {
  const queryClient = useQueryClient();

  const mutation = useUpdateMatchMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: MATCHES.detailQueryKey(matchId) });
        if (groupId) {
          void queryClient.invalidateQueries({ queryKey: MATCHES.queryKeyRoot(groupId) });
          void queryClient.invalidateQueries({ queryKey: GROUPS.detailQueryKey(groupId) });
        }
        void queryClient.invalidateQueries({ queryKey: GROUPS.queryKeyRoot });
      },
    },
  });

  return {
    mutateAsync: (data: UpdateMatchMutationRequest) => mutation.mutateAsync({ id: matchId, data }),
    isPending: mutation.isPending,
  };
}
