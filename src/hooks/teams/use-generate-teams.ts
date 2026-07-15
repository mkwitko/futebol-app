import { useQueryClient } from "@tanstack/react-query";
import { useGenerateTeams as useGenerateTeamsMutation } from "@/api/generated/hooks/teamsHooks";
import { TEAMS } from "@/api/modules/teams";

const DEFAULT_TEAM_COUNT = 2;

/**
 * Monta (ou refaz) os times da pelada. O resultado é persistido no backend
 * (`GET /matches/:id/teams` relê o que foi salvo) — por isso aqui só
 * invalidamos essa query em vez de guardar a resposta da mutation em estado
 * local; a tela (`match/[id].tsx`) lê os times via `useTeams`.
 */
export function useGenerateTeams(matchId: string) {
  const queryClient = useQueryClient();

  const mutation = useGenerateTeamsMutation({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: TEAMS.queryKeyRoot(matchId) });
      },
    },
  });

  return {
    mutateAsync: (teamCount: number = DEFAULT_TEAM_COUNT) =>
      mutation.mutateAsync({ id: matchId, params: { teamCount } }),
    isPending: mutation.isPending,
  };
}
