import { useGetTeams } from "@/api/generated/hooks/teamsHooks";
import { isNotFoundError } from "@/lib/api/errors";

/**
 * Times persistidos da pelada (`GET /matches/:id/teams`). O backend responde
 * 404 enquanto os times ainda não foram montados — tratamos isso como estado
 * vazio (`data: null`), não como erro de tela; `retry: false` evita 3
 * tentativas automáticas contra um 404 esperado.
 */
export function useTeams(matchId: string) {
  const query = useGetTeams(matchId, {
    query: { retry: false },
  });

  const notGenerated = isNotFoundError(query.error);

  return {
    data: notGenerated ? null : (query.data ?? null),
    isPending: query.isPending,
    isError: query.isError && !notGenerated,
    refetch: query.refetch,
  };
}
