import { useQueryClient } from "@tanstack/react-query";
import { useCreateSeries as useCreateSeriesMutation } from "@/api/generated/hooks/seriesHooks";
import { MATCHES } from "@/api/modules/matches";
import { SERIES } from "@/api/modules/series";
import type { CreateSeriesMutationRequest } from "@/api/generated/types/CreateSeries";

/** Cria uma série recorrente no grupo e invalida a lista de séries + peladas desse grupo em caso de sucesso. */
export function useCreateSeries(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useCreateSeriesMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: SERIES.queryKeyRoot(groupId) });
        void queryClient.invalidateQueries({ queryKey: MATCHES.queryKeyRoot(groupId) });
      },
    },
  });

  return {
    mutateAsync: (data: CreateSeriesMutationRequest) => mutation.mutateAsync({ id: groupId, data }),
    isPending: mutation.isPending,
  };
}
