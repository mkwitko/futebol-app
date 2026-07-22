import { useQueryClient } from "@tanstack/react-query";
import { useCreateGroupSubaccount as useCreateGroupSubaccountMutation } from "@/api/generated/hooks/groupsHooks";
import { GROUPS } from "@/api/modules/groups";
import type { CreateGroupSubaccountMutationRequest } from "@/api/generated/types/CreateGroupSubaccount";

/**
 * Onboarding da chave PIX do grupo (Task 11) — registra a sub-conta Woovi do
 * organizador (`POST /groups/:id/woovi/subaccount`) e invalida o detalhe do
 * grupo em caso de sucesso, espelhando `useUpdateGroup`.
 */
export function useCreateGroupSubaccount(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useCreateGroupSubaccountMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: GROUPS.detailQueryKey(groupId) });
      },
    },
  });

  return {
    mutateAsync: (data: CreateGroupSubaccountMutationRequest) => mutation.mutateAsync({ id: groupId, data }),
    isPending: mutation.isPending,
  };
}
