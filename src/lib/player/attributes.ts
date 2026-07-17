/**
 * Atributos do jogador (onboarding) — orçamento de pontos redistribuível.
 * Todos começam em `ATTRIBUTE_BASELINE`; o jogador tira de um pra pôr em
 * outro, mantendo o total em `ATTRIBUTE_BUDGET`. Descritivo (perfil/card), não
 * entra no balanceador. Espelha `players.catalog.ts` do backend + os tipos
 * gerados (`GetMyPlayer200.attributes`).
 */
export const ATTRIBUTE_KEYS = [
  "chute",
  "passe",
  "drible",
  "velocidade",
  "forca",
  "cabeceio",
  "marcacao",
  "desarme",
  "visao",
  "lideranca",
] as const;
export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export const ATTRIBUTE_BASELINE = 50;
export const ATTRIBUTE_MAX = 100;
export const ATTRIBUTE_MIN = 0;
export const ATTRIBUTE_BUDGET = ATTRIBUTE_BASELINE * ATTRIBUTE_KEYS.length;

/** Nome por extenso (pt-BR) — o domínio já é pt-BR, então não é chave i18n. */
export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  chute: "Chute",
  passe: "Passe",
  drible: "Drible",
  velocidade: "Velocidade",
  forca: "Força",
  cabeceio: "Cabeceio",
  marcacao: "Marcação",
  desarme: "Desarme",
  visao: "Visão de jogo",
  lideranca: "Liderança",
};

export type AttributeMap = Record<AttributeKey, number>;

/** Converte o mapa da API pro mapa completo, preenchendo o baseline 50 onde faltar. */
export function toAttributeMap(raw: Record<string, number> | null | undefined): AttributeMap {
  const map = {} as AttributeMap;
  for (const key of ATTRIBUTE_KEYS) {
    map[key] = raw?.[key] ?? ATTRIBUTE_BASELINE;
  }
  return map;
}

/** Soma dos pontos alocados. */
export function totalPoints(map: AttributeMap): number {
  return ATTRIBUTE_KEYS.reduce((sum, key) => sum + map[key], 0);
}

/** Pontos ainda disponíveis (budget − alocado). Zero ou negativo = cheio. */
export function remainingPoints(map: AttributeMap): number {
  return ATTRIBUTE_BUDGET - totalPoints(map);
}

/** Mapa base pra quem nunca preencheu (tudo no baseline). */
export function baselineAttributeMap(): AttributeMap {
  return toAttributeMap(null);
}
