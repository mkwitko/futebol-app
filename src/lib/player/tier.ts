import { colors } from "@/lib/theme";

/**
 * Tier do jogador — deriva do `overall` (0-99, o mesmo número exibido em
 * destaque no PlayerCard). Faixas inspiradas em ratings esportivos comuns:
 * abaixo de 70 é bronze, 70-84 é prata, 85+ é ouro. Não existe (ainda) um
 * campo "tier"/"level" próprio na API — o front deriva a partir do overall
 * para já ter uma progressão visual na Fase 0.
 */
export type Tier = "bronze" | "prata" | "ouro";

const TIER_MIN_OURO = 85;
const TIER_MIN_PRATA = 70;

export function getTierFromOverall(overall: number): Tier {
  if (overall >= TIER_MIN_OURO) return "ouro";
  if (overall >= TIER_MIN_PRATA) return "prata";
  return "bronze";
}

export function tierColor(tier: Tier): string {
  return colors.tier[tier];
}

export const TIER_LABELS: Record<Tier, string> = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
};

export function tierLabel(tier: Tier): string {
  return TIER_LABELS[tier];
}

/**
 * Progresso (0-100) do overall dentro da própria faixa de tier — alimenta a
 * barra de progresso do PlayerCard. Ex.: overall 77 (prata, faixa 70-84) volta
 * ~47%. No topo da faixa mais alta (ouro) o progresso satura em 100.
 */
export function tierProgress(overall: number): number {
  const tier = getTierFromOverall(overall);
  const clamped = Math.max(0, Math.min(99, overall));

  if (tier === "ouro") {
    // 85-99 → 100% já na faixa de topo, sem "próximo tier" para mostrar.
    return 100;
  }
  const min = tier === "prata" ? TIER_MIN_PRATA : 0;
  const max = tier === "prata" ? TIER_MIN_OURO : TIER_MIN_PRATA;
  return Math.round(((clamped - min) / (max - min)) * 100);
}
