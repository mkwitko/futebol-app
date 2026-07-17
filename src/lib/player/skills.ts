/**
 * Skills do jogador (onboarding) — catálogo fixo, o jogador escolhe até
 * `MAX_SKILLS`. Descritivo (badges no perfil/card). Espelha
 * `players.catalog.ts` do backend + os tipos gerados.
 */
export const SKILL_KEYS = [
  "driblador",
  "goleador",
  "garcom",
  "muralha",
  "motorzinho",
  "capitao",
  "maestro",
  "paredao",
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];

export const MAX_SKILLS = 3;

/** Nome por extenso (pt-BR). */
export const SKILL_LABELS: Record<SkillKey, string> = {
  driblador: "Driblador",
  goleador: "Goleador",
  garcom: "Garçom",
  muralha: "Muralha",
  motorzinho: "Motorzinho",
  capitao: "Capitão",
  maestro: "Maestro",
  paredao: "Paredão",
};

function isKnownSkill(key: string): key is SkillKey {
  return (SKILL_KEYS as readonly string[]).includes(key);
}

/** Descarta chaves fora do catálogo (defensivo contra dados legados). */
export function toSkillList(raw: readonly string[] | null | undefined): SkillKey[] {
  if (!raw) return [];
  return raw.filter(isKnownSkill);
}

/** Compara duas listas de skills como conjunto — habilita "Salvar" só com mudança real. */
export function skillsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((s) => setB.has(s));
}
