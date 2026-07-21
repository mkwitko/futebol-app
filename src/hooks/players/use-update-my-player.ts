import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  getMyPlayerQueryKey,
  useUpdateMyPlayer as useUpdateMyPlayerMutation,
} from "@/api/generated/hooks/playersHooks";
import type { UpdateMyPlayerMutationRequest } from "@/api/generated/types/UpdateMyPlayer";

/**
 * Atualiza o perfil auto-declarado do próprio jogador (`PATCH /players/me`):
 * afinidade (modelo FM), atributos (orçamento) e skills — todos opcionais. O
 * onboarding manda os três; telas de edição podem mandar um subconjunto.
 * Invalida `GET /players/me` pra refletir na hora. Mesmo padrão dos wrappers
 * de mutação em `hooks/dues`/`hooks/attendance`.
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

  // `mutateAsync` de react-query é estável entre renders; embrulhamos com
  // `useCallback` pra que o wrapper também seja — assim os `onSave`/handlers
  // que dependem dele (perfil.tsx) não quebram o `memo` das seções.
  const { mutateAsync: rawMutateAsync } = mutation;
  const mutateAsync = useCallback(
    (patch: UpdateMyPlayerMutationRequest) => rawMutateAsync({ data: patch }),
    [rawMutateAsync],
  );

  return { mutateAsync, isPending: mutation.isPending };
}
