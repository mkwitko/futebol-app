import { useListJoinRequests } from "@/api/generated/hooks/join-requestsHooks";

/**
 * Lista os pedidos de entrada pendentes de uma pelada (só o organizador vê a
 * resposta 200; para os demais o backend responde 403). A query fica desligada
 * enquanto não há `matchId` ou quando `enabled` é `false` (ex.: o grupo não usa
 * `joinPolicy=request`).
 */
export function useMatchJoinRequests(matchId: string | undefined, enabled = true) {
  return useListJoinRequests(matchId, {
    query: { enabled: enabled && !!matchId },
  });
}
