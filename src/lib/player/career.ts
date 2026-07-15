import { POSITIONS, type Position } from "./position";

/**
 * Utilitários puros sobre o mapa `overall` (por posição) da carreira
 * (`GetPlayerCareer200.overall`/`GetPublicProfile200.overallByPosition`) — a
 * API tipa esse mapa como `{ [key: string]: number }` (não há enum na
 * resposta), então aqui é onde filtramos para as posições conhecidas do
 * domínio (`Position`) antes de exibir qualquer coisa.
 */

export type PositionOverallEntry = {
  position: Position;
  overall: number;
  isBest: boolean;
};

function isKnownPosition(key: string): key is Position {
  return (POSITIONS as readonly string[]).includes(key);
}

/** Melhor posição (maior `overall`) — `null` quando o mapa está vazio (carreira ainda não existe). */
export function bestPositionFromOverall(
  overall: Record<string, number>,
): { position: Position; overall: number } | null {
  const entries = Object.entries(overall).filter((entry): entry is [Position, number] =>
    isKnownPosition(entry[0]),
  );
  if (entries.length === 0) return null;

  return entries.reduce(
    (best, [position, value]) => (value > best.overall ? { position, overall: value } : best),
    { position: entries[0]![0], overall: entries[0]![1] },
  );
}

/** Lista de entradas (posição + overall + destaque da melhor), ordenada da maior para a menor. */
export function positionOverallEntries(overall: Record<string, number>): PositionOverallEntry[] {
  const best = bestPositionFromOverall(overall);
  return Object.entries(overall)
    .filter((entry): entry is [Position, number] => isKnownPosition(entry[0]))
    .map(([position, value]) => ({ position, overall: value, isBest: position === best?.position }))
    .sort((a, b) => b.overall - a.overall);
}

/** Aproveitamento (0-100) — `wins / matchesPlayed`, arredondado. 0 quando ainda não houve partidas. */
export function computeWinRate(wins: number, matchesPlayed: number): number {
  if (matchesPlayed <= 0) return 0;
  return Math.round((wins / matchesPlayed) * 100);
}
