import { useQueryClient } from "@tanstack/react-query";
import { useCreateSeries as useCreateSeriesMutation } from "@/api/generated/hooks/seriesHooks";
import { MATCHES } from "@/api/modules/matches";
import { SERIES } from "@/api/modules/series";
import { GROUPS } from "@/api/modules/groups";
import type { CreateSeriesMutationRequest } from "@/api/generated/types/CreateSeries";

/**
 * Cria uma série recorrente no grupo e invalida, em caso de sucesso: séries +
 * peladas do grupo + a lista "meus grupos" e o detalhe do grupo (ambos embutem
 * a "próxima pelada", que a 1ª ocorrência da série passa a preencher).
 */
export function useCreateSeries(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useCreateSeriesMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: SERIES.queryKeyRoot(groupId) });
        void queryClient.invalidateQueries({ queryKey: MATCHES.queryKeyRoot(groupId) });
        void queryClient.invalidateQueries({ queryKey: GROUPS.queryKeyRoot });
        void queryClient.invalidateQueries({ queryKey: GROUPS.detailQueryKey(groupId) });
      },
    },
  });

  return {
    mutateAsync: (data: CreateSeriesMutationRequest) => mutation.mutateAsync({ id: groupId, data }),
    isPending: mutation.isPending,
  };
}
