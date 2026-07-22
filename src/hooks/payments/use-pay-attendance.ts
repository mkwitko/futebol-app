import { useQueryClient } from "@tanstack/react-query";
import { usePayAttendance as usePayAttendanceMutation } from "@/api/generated/hooks/attendanceHooks";
import { MATCHES } from "@/api/modules/matches";

/**
 * Inicia a cobrança PIX (Woovi) da própria presença (`POST
 * /matches/:id/attendance/:attId/pay`) e invalida o detalhe da pelada em
 * caso de sucesso. Retorna a cobrança (`brCode`/`qrCodeImage`/`status`) pra
 * quem chama abrir o `PaymentSheet`.
 */
export function usePayAttendance(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = usePayAttendanceMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: MATCHES.detailQueryKey(matchId) });
      },
    },
  });

  return {
    mutateAsync: (attId: string) => mutation.mutateAsync({ id: matchId, attId }),
    isPending: mutation.isPending,
  };
}
