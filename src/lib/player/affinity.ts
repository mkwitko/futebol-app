import { FIELD_POSITIONS, type FieldPosition } from "./position";

/**
 * Mapa esparso de afinidade por posição (0-100) — só as posições que o
 * jogador declarou entram aqui. Espelha o formato de `GetMyPlayer200.affinity`
 * / `UpdateMyPlayerMutationRequest.affinity` (`{ [key: string]: number }`),
 * mas tipado para as posições conhecidas do domínio (Task 8, Bloco A —
 * onboarding FM + editor de perfil).
 */
export type AffinityMap = Partial<Record<FieldPosition, number>>;

function isKnownPosition(key: string): key is FieldPosition {
  return (FIELD_POSITIONS as readonly string[]).includes(key);
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
    if (a[key as FieldPosition] !== b[key as FieldPosition]) return false;
  }
  return true;
}

/**
 * Graus de afinidade estilo Football Manager — clicar numa posição do campinho
 * cicla por estes valores. Cada grau mapeia direto pro 0-100 armazenado; a
 * ausência (`undefined`) = "não joga nessa posição". `colorToken` é a chave de
 * cor do tema (ver `lib/theme`), usada no ponto da posição e na legenda.
 */
export type AffinityGradeToken = "natural" | "bom" | "ok" | "fraco";

export type AffinityGrade = {
  value: number;
  /** Chave i18n em `player:grades.*`. */
  labelKey: string;
  /** Chave de cor resolvida em `lib/theme` (`gradeColor`). */
  token: AffinityGradeToken;
};

export const AFFINITY_GRADES: readonly AffinityGrade[] = [
  { value: 100, labelKey: "natural", token: "natural" },
  { value: 75, labelKey: "bom", token: "bom" },
  { value: 50, labelKey: "ok", token: "ok" },
  { value: 25, labelKey: "fraco", token: "fraco" },
] as const;

const CYCLE_VALUES = [100, 75, 50, 25] as const;

/**
 * Próximo valor no ciclo do clique: vazio → Natural(100) → Bom(75) → Ok(50) →
 * Fraco(25) → vazio. Começa sempre pelo Natural e desce. Aceita qualquer valor
 * armazenado (snap pro grau mais próximo antes de avançar), então dados antigos
 * do stepper 0-100 ainda ciclam de forma previsível.
 */
export function cycleAffinity(current: number | undefined): number | undefined {
  if (current === undefined) return CYCLE_VALUES[0];
  const nearest = gradeValueFor(current);
  const idx = CYCLE_VALUES.indexOf(nearest as (typeof CYCLE_VALUES)[number]);
  if (idx === CYCLE_VALUES.length - 1) return undefined;
  return CYCLE_VALUES[idx + 1];
}

/** Grau (para cor/legenda) mais próximo de um valor 0-100 armazenado. */
export function gradeFor(value: number | undefined): AffinityGrade | undefined {
  if (value === undefined) return undefined;
  const snapped = gradeValueFor(value);
  return AFFINITY_GRADES.find((g) => g.value === snapped);
}

function gradeValueFor(value: number): number {
  let best = CYCLE_VALUES[0] as number;
  for (const v of CYCLE_VALUES) {
    if (Math.abs(value - v) < Math.abs(value - best)) best = v;
  }
  return best;
}
