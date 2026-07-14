import { useQueryClient } from "@tanstack/react-query";
import { useConfirmPresence as useConfirmPresenceMutation } from "@/api/generated/hooks/attendanceHooks";
import { ATTENDANCE } from "@/api/modules/attendance";

/** Confirma a presença do usuário logado na pelada e invalida a lista de presença. */
export function useConfirmPresence(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useConfirmPresenceMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ATTENDANCE.queryKeyRoot(matchId) });
      },
    },
  });

  return {
    mutateAsync: () => mutation.mutateAsync({ id: matchId }),
    isPending: mutation.isPending,
  };
}
