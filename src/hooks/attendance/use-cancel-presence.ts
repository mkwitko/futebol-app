import { useQueryClient } from "@tanstack/react-query";
import { useCancelPresence as useCancelPresenceMutation } from "@/api/generated/hooks/attendanceHooks";
import { ATTENDANCE } from "@/api/modules/attendance";

/** Cancela a presença de um confirmado/fila (organizador) e invalida a lista de presença. */
export function useCancelPresence(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useCancelPresenceMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ATTENDANCE.queryKeyRoot(matchId) });
      },
    },
  });

  return {
    mutateAsync: (attId: string) => mutation.mutateAsync({ id: matchId, attId }),
    isPending: mutation.isPending,
  };
}
