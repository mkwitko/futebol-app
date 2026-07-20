import type { GetPlayerCareer200 } from "@/api/generated/types/GetPlayerCareer";
import type { GetPublicProfile200 } from "@/api/generated/types/GetPublicProfile";

/**
 * Adapta `GetPublicProfile200` (rota pública `GET /players/:id/public-profile`,
 * sem auth — a única que aceita visitante, e a que resolve id-OU-slug; ver
 * `public-profile.controller.ts` no backend) pro shape que `<CareerSummary>`
 * já sabe renderizar (`GetPlayerCareer200`, hoje só populado por
 * `getPlayerCareer`, autenticada e uuid-only). As duas respostas
 * compartilham o mesmo mapa overall/overallByPosition por design — ver o
 * comentário em `lib/player/career.ts` que já antecipa esse reaproveitamento.
 *
 * Só os campos que a rota pública não devolve levam um valor neutro:
 * `affinity` (não lido por `<CareerSummary>`) e `updatedAt` (idem). `id`
 * fica `null` quando o jogador ainda não tem overall/partida registrada —
 * mesma semântica de "carreira nova" que o bootstrap autenticado usa pra
 * `<CareerSummary>` mostrar o estado vazio em vez do hero zerado como erro.
 */
export function publicProfileToCareer(profile: GetPublicProfile200): GetPlayerCareer200 {
  const hasCareer = profile.matchesPlayed > 0 || profile.bestOverall > 0;
  return {
    id: hasCareer ? profile.playerId : null,
    playerId: profile.playerId,
    overall: profile.overallByPosition,
    affinity: {},
    level: profile.level,
    matchesPlayed: profile.matchesPlayed,
    wins: profile.wins,
    draws: profile.draws,
    losses: profile.losses,
    goals: profile.goals,
    assists: profile.assists,
    cleanSheets: profile.cleanSheets,
    mvpCount: profile.mvpCount,
    currentStreak: profile.currentStreak,
    bestStreak: profile.bestStreak,
    achievements: profile.achievements,
    updatedAt: null,
  };
}
