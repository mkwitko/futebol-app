import { useQueryClient } from "@tanstack/react-query";
import { useEndSeries as useEndSeriesMutation } from "@/api/generated/hooks/seriesHooks";
import { SERIES } from "@/api/modules/series";

/** Encerra a série e invalida o detalhe + a lista de séries do grupo em caso de sucesso. */
export function useEndSeries(seriesId: string) {
  const queryClient = useQueryClient();

  const mutation = useEndSeriesMutation({
    mutation: {
      onSuccess: (series) => {
        void queryClient.invalidateQueries({ queryKey: SERIES.detailQueryKey(seriesId) });
        void queryClient.invalidateQueries({ queryKey: SERIES.queryKeyRoot(series.groupId) });
      },
    },
  });

  return {
    mutateAsync: () => mutation.mutateAsync({ id: seriesId }),
    isPending: mutation.isPending,
  };
}
