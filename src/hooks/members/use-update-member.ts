import { useQueryClient } from "@tanstack/react-query";
import { useUpdateMember as useUpdateMemberMutation } from "@/api/generated/hooks/membersHooks";
import { MEMBERS } from "@/api/modules/members";
import type { UpdateMemberMutationRequest } from "@/api/generated/types/UpdateMember";

/** Atualiza posição/afinidade/overall de um membro e invalida o elenco em caso de sucesso. */
export function useUpdateMember(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useUpdateMemberMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: MEMBERS.queryKeyRoot(groupId) });
      },
    },
  });

  return {
    mutateAsync: (memberId: string, data: UpdateMemberMutationRequest) =>
      mutation.mutateAsync({ id: groupId, memberId, data }),
    isPending: mutation.isPending,
  };
}
