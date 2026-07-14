import { useQueryClient } from "@tanstack/react-query";
import { useCreateGroup as useCreateGroupMutation } from "@/api/generated/hooks/groupsHooks";
import { GROUPS } from "@/api/modules/groups";

/** Cria um grupo e invalida a lista de peladas do organizador em caso de sucesso. */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useCreateGroupMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: GROUPS.queryKeyRoot });
      },
    },
  });
}
