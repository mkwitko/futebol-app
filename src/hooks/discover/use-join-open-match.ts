import { useQueryClient } from "@tanstack/react-query";
import { useConfirmPresence as useConfirmPresenceMutation } from "@/api/generated/hooks/attendanceHooks";
import { ATTENDANCE } from "@/api/modules/attendance";
import { DISCOVER } from "@/api/modules/discover";

/**
 * Entrar direto numa pelada pública com `joinPolicy=open` a partir da
 * descoberta — reusa o `confirm-presence` do backend. Diferente do
 * `use-confirm-presence` das telas de pelada, aqui o `matchId` é dinâmico (o
 * card selecionado no mapa muda), então o id vem no `mutateAsync`. Invalida a
 * descoberta (vagas mudam) e a presença da pelada no sucesso.
 */
export function useJoinOpenMatch() {
  const queryClient = useQueryClient();

  const mutation = useConfirmPresenceMutation({
    mutation: {
      onSuccess: (_data, variables) => {
        void queryClient.invalidateQueries({ queryKey: DISCOVER.queryKeyRoot });
        void queryClient.invalidateQueries({ queryKey: ATTENDANCE.queryKeyRoot(variables.id) });
      },
    },
  });

  return {
    mutateAsync: (matchId: string) => mutation.mutateAsync({ id: matchId }),
    isPending: mutation.isPending,
  };
}
