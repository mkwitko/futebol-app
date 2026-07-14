import { useGenerateTeams as useGenerateTeamsMutation } from "@/api/generated/hooks/teamsHooks";

const DEFAULT_TEAM_COUNT = 2;

/**
 * Monta (ou refaz) os times da pelada. O resultado é persistido no backend,
 * mas não existe endpoint `GET` para reler os times já montados nesta versão
 * da API — por isso o resultado fica em estado local da tela (não em cache
 * do TanStack Query); ver `match/[id].tsx`.
 */
export function useGenerateTeams(matchId: string) {
  const mutation = useGenerateTeamsMutation();

  return {
    mutateAsync: (teamCount: number = DEFAULT_TEAM_COUNT) =>
      mutation.mutateAsync({ id: matchId, params: { teamCount } }),
    isPending: mutation.isPending,
  };
}
