import { POSITIONS, type Position } from "./position";

/**
 * Mapa esparso de afinidade por posição (0-100) — só as posições que o
 * jogador declarou entram aqui. Espelha o formato de `GetMyPlayer200.affinity`
 * / `UpdateMyPlayerMutationRequest.affinity` (`{ [key: string]: number }`),
 * mas tipado para as posições conhecidas do domínio (Task 8, Bloco A —
 * onboarding FM + editor de perfil).
 */
export type AffinityMap = Partial<Record<Position, number>>;

function isKnownPosition(key: string): key is Position {
  return (POSITIONS as readonly string[]).includes(key);
}

/** Converte o mapa genérico da API (`{[key: string]: number}`) para `AffinityMap`, descartando chaves fora do domínio. */
export function toAffinityMap(
  raw: Record<string, number> | null | undefined,
): AffinityMap {
  if (!raw) return {};
  return Object.fromEntries(
    Object.entries(raw).filter(([key]) => isKnownPosition(key)),
  ) as AffinityMap;
}

/** Converte `AffinityMap` pro body da API — descarta entradas `undefined` (posições removidas do rascunho). */
export function toApiAffinity(map: AffinityMap): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [position, affinity] of Object.entries(map)) {
    if (affinity !== undefined) result[position] = affinity;
  }
  return result;
}

/** Compara dois mapas de afinidade por valor (ignora ordem das chaves) — habilita "Salvar" só quando há mudança real. */
export function affinityMapsEqual(a: AffinityMap, b: AffinityMap): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if (a[key as Position] !== b[key as Position]) return false;
  }
  return true;
}
