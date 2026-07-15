import { useQueryClient } from "@tanstack/react-query";
import { useLogStats as useLogStatsMutation } from "@/api/generated/hooks/statsHooks";
import { STATS } from "@/api/modules/stats";
import type { LogStatsMutationRequest } from "@/api/generated/types/LogStats";

/** Lança (em lote) as estatísticas dos confirmados na pelada e invalida a lista persistida. */
export function useLogStats(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useLogStatsMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: STATS.queryKeyRoot(matchId) });
      },
    },
  });

  return {
    mutateAsync: (data: LogStatsMutationRequest) => mutation.mutateAsync({ id: matchId, data }),
    isPending: mutation.isPending,
  };
}
