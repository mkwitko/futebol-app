import { useQueryClient } from "@tanstack/react-query";
import { useAddMember as useAddMemberMutation } from "@/api/generated/hooks/membersHooks";
import { MEMBERS } from "@/api/modules/members";
import type { AddMemberMutationRequest } from "@/api/generated/types/AddMember";

/** Adiciona um jogador ao elenco do grupo e invalida o elenco em caso de sucesso. */
export function useAddMember(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useAddMemberMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: MEMBERS.queryKeyRoot(groupId) });
      },
    },
  });

  return {
    mutateAsync: (data: AddMemberMutationRequest) => mutation.mutateAsync({ id: groupId, data }),
    isPending: mutation.isPending,
  };
}
