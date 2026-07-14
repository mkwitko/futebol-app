import { useQueryClient } from "@tanstack/react-query";
import { useMarkPaid as useMarkPaidMutation } from "@/api/generated/hooks/attendanceHooks";
import { ATTENDANCE } from "@/api/modules/attendance";

/** Marca o próprio pagamento como feito (jogador) e invalida a lista de presença. */
export function useMarkPaid(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useMarkPaidMutation({
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
