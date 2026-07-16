import { useQueryClient } from "@tanstack/react-query";
import {
  getMyPlayerQueryKey,
  useUpdateMyPlayer as useUpdateMyPlayerMutation,
} from "@/api/generated/hooks/playersHooks";

/**
 * Atualiza a afinidade auto-declarada do próprio jogador (`PATCH /players/me`,
 * modelo FM — Bloco A) e invalida `GET /players/me` pra refletir na hora.
 * Mesmo padrão dos wrappers de mutação em `hooks/dues`/`hooks/attendance`.
 */
export function useUpdateMyPlayer() {
  const queryClient = useQueryClient();

  const mutation = useUpdateMyPlayerMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getMyPlayerQueryKey() });
      },
    },
  });

  return {
    mutateAsync: (affinity: Record<string, number>) =>
      mutation.mutateAsync({ data: { affinity } }),
    isPending: mutation.isPending,
  };
}
