import { useQueryClient } from "@tanstack/react-query";
import { useRecordResult as useRecordResultMutation } from "@/api/generated/hooks/resultHooks";
import { RESULT } from "@/api/modules/result";
import type { RecordResultMutationRequest } from "@/api/generated/types/RecordResult";

/** Registra o placar final da pelada (organizador) e invalida o resultado persistido. */
export function useRecordResult(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useRecordResultMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: RESULT.queryKeyRoot(matchId) });
      },
    },
  });

  return {
    mutateAsync: (data: RecordResultMutationRequest) => mutation.mutateAsync({ id: matchId, data }),
    isPending: mutation.isPending,
  };
}
