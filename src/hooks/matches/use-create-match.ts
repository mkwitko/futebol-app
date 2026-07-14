import { useQueryClient } from "@tanstack/react-query";
import { useCreateMatch as useCreateMatchMutation } from "@/api/generated/hooks/matchesHooks";
import { MATCHES } from "@/api/modules/matches";
import type { CreateMatchMutationRequest } from "@/api/generated/types/CreateMatch";

/** Cria uma pelada no grupo e invalida a lista de peladas desse grupo em caso de sucesso. */
export function useCreateMatch(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useCreateMatchMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: MATCHES.queryKeyRoot(groupId) });
      },
    },
  });

  return {
    mutateAsync: (data: CreateMatchMutationRequest) => mutation.mutateAsync({ id: groupId, data }),
    isPending: mutation.isPending,
  };
}
