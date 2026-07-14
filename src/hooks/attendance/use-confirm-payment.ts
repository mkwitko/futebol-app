import { useQueryClient } from "@tanstack/react-query";
import { useConfirmPayment as useConfirmPaymentMutation } from "@/api/generated/hooks/attendanceHooks";
import { ATTENDANCE } from "@/api/modules/attendance";

/**
 * Confirma (ou desfaz, `paid: false`) o pagamento de um confirmado —
 * organizador — e invalida a lista de presença.
 */
export function useConfirmPayment(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useConfirmPaymentMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ATTENDANCE.queryKeyRoot(matchId) });
      },
    },
  });

  return {
    mutateAsync: (attId: string, paid: boolean = true) =>
      mutation.mutateAsync({ id: matchId, attId, data: { paid } }),
    isPending: mutation.isPending,
  };
}
