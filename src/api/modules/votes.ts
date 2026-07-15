import { getVoteTallyQueryKey } from "@/api/generated/hooks/votesHooks";

/**
 * Constantes do módulo `votes` — usadas para invalidação de cache (nunca
 * string crua). Só a tally agregada é lida pelo app (sem endpoint de "meu
 * voto"); a raiz da query-key depende do `matchId`. Ver KUBB.md §8 na skill
 * do app.
 */
export const VOTES = {
  tallyQueryKey: (matchId: string) => getVoteTallyQueryKey(matchId),
} as const;
