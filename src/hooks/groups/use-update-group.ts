import { useQueryClient } from "@tanstack/react-query";
import { useUpdateGroup as useUpdateGroupMutation } from "@/api/generated/hooks/groupsHooks";
import { GROUPS } from "@/api/modules/groups";
import type { UpdateGroupMutationRequest } from "@/api/generated/types/UpdateGroup";

/** Atualiza configurações do grupo (hoje, só `monthlyFeeCents`) e invalida o detalhe em caso de sucesso. */
export function useUpdateGroup(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useUpdateGroupMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: GROUPS.detailQueryKey(groupId) });
      },
    },
  });

  return {
    mutateAsync: (data: UpdateGroupMutationRequest) => mutation.mutateAsync({ id: groupId, data }),
    isPending: mutation.isPending,
  };
}
