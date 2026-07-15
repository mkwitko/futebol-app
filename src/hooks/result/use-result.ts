import { useGetResult } from "@/api/generated/hooks/resultHooks";
import { isNotFoundError } from "@/lib/api/errors";

/**
 * Resultado persistido da pelada (`GET /matches/:id/result`). O backend
 * responde 404 antes do primeiro `recordResult` — tratamos isso como estado
 * vazio (`data: null`), não como erro de tela; `retry: false` evita 3
 * tentativas automáticas contra um 404 esperado. Só habilitada quando a
 * pelada já está `finished`/`closed` (o resultado só existe a partir daí).
 */
export function useResult(matchId: string, enabled: boolean) {
  const query = useGetResult(matchId, {
    query: { enabled, retry: false },
  });

  const notRecorded = isNotFoundError(query.error);

  return {
    data: notRecorded ? null : (query.data ?? null),
    isPending: enabled && query.isPending,
    isError: query.isError && !notRecorded,
    refetch: query.refetch,
  };
}
