import { useQueryClient } from "@tanstack/react-query";
import { useAddSeriesDates as useAddSeriesDatesMutation } from "@/api/generated/hooks/seriesHooks";
import { MATCHES } from "@/api/modules/matches";
import type { AddSeriesDatesMutationRequest } from "@/api/generated/types/AddSeriesDates";

/**
 * Adiciona datas manuais a uma série. O `seriesId` só existe depois da série
 * já ter sido criada (fluxo: `useCreateSeries` → aqui), por isso — diferente
 * dos outros wrappers desta pasta — ele é passado em `mutateAsync`, não no
 * hook; `groupId` (conhecido desde o mount, via rota) fica fixo para
 * invalidar a lista de peladas do grupo (novas ocorrências) em caso de sucesso.
 */
export function useAddSeriesDates(groupId: string) {
  const queryClient = useQueryClient();

  const mutation = useAddSeriesDatesMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: MATCHES.queryKeyRoot(groupId) });
      },
    },
  });

  return {
    mutateAsync: (seriesId: string, data: AddSeriesDatesMutationRequest) =>
      mutation.mutateAsync({ id: seriesId, data }),
    isPending: mutation.isPending,
  };
}
