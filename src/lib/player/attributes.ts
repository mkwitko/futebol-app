/**
 * Atributos do jogador (estilo FIFA) — 35 sub-atributos em 7 categorias
 * (6 de linha + goleiro). Todos começam em `ATTRIBUTE_BASELINE`; total fixo
 * `ATTRIBUTE_BUDGET` (baseline redistribuível + 20 de bônus). Os atributos
 * DERIVAM o overall por posição (ver `rating.ts`). Espelha `players.catalog.ts`
 * do backend + os tipos gerados.
 */

export const ATTRIBUTE_CATEGORIES = [
  "ritmo",
  "finalizacao",
  "passe",
  "drible",
  "defesa",
  "fisico",
  "goleiro",
] as const;
export type AttributeCategory = (typeof ATTRIBUTE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<AttributeCategory, string> = {
  ritmo: "Ritmo",
  finalizacao: "Finalização",
  passe: "Passe",
  drible: "Drible",
  defesa: "Defesa",
  fisico: "Físico",
  goleiro: "Goleiro",
};

export const CATEGORY_SUBS: Record<AttributeCategory, readonly string[]> = {
  ritmo: ["aceleracao", "pique"],
  finalizacao: ["posicionamento", "finalizacao", "forca_chute", "chute_longe", "voleio", "penalti"],
  passe: ["visao", "cruzamento", "falta", "passe_curto", "lancamento", "curva"],
  drible: ["agilidade", "equilibrio", "reacao", "controle_bola", "conducao", "compostura"],
  defesa: ["interceptacao", "cabeceio_def", "nocao_def", "dividida", "carrinho"],
  fisico: ["impulsao", "folego", "forca", "combatividade"],
  goleiro: ["elasticidade", "defesa_mao", "reflexo", "saida", "pos_gol", "chute_gol"],
};

export const ATTRIBUTE_KEYS = ATTRIBUTE_CATEGORIES.flatMap((c) => CATEGORY_SUBS[c]);
export type AttributeKey = string;

export const SUB_LABELS: Record<string, string> = {
  aceleracao: "Aceleração", pique: "Pique",
  posicionamento: "Posicionamento", finalizacao: "Finalização", forca_chute: "Força do chute",
  chute_longe: "Chutes de longe", voleio: "Voleio", penalti: "Pênaltis",
  visao: "Visão de jogo", cruzamento: "Cruzamento", falta: "Faltas", passe_curto: "Passes curtos",
  lancamento: "Lançamento", curva: "Curva",
  agilidade: "Agilidade", equilibrio: "Equilíbrio", reacao: "Reação", controle_bola: "Controle de bola",
  conducao: "Condução", compostura: "Compostura",
  interceptacao: "Interceptação", cabeceio_def: "Cabeceio", nocao_def: "Noção defensiva",
  dividida: "Dividida", carrinho: "Carrinho",
  impulsao: "Impulsão", folego: "Fôlego", forca: "Força", combatividade: "Combatividade",
  elasticidade: "Elasticidade", defesa_mao: "Defesa de mão", reflexo: "Reflexos",
  saida: "Saída do gol", pos_gol: "Posicionamento (GK)", chute_gol: "Reposição",
};

export function subLabel(key: string): string {
  return SUB_LABELS[key] ?? key;
}

export const ATTRIBUTE_BASELINE = 50;
export const ATTRIBUTE_MAX = 99;
export const ATTRIBUTE_MIN = 0;
export const ATTRIBUTE_BONUS = 20;
export const ATTRIBUTE_BUDGET = ATTRIBUTE_BASELINE * ATTRIBUTE_KEYS.length + ATTRIBUTE_BONUS;

export type AttributeMap = Record<string, number>;

/** Converte o mapa da API pro mapa completo (35 keys), preenchendo baseline 50. */
export function toAttributeMap(raw: Record<string, number> | null | undefined): AttributeMap {
  const map: AttributeMap = {};
  for (const key of ATTRIBUTE_KEYS) map[key] = raw?.[key] ?? ATTRIBUTE_BASELINE;
  return map;
}

/** Soma total dos pontos alocados. */
export function totalPoints(map: AttributeMap): number {
  return ATTRIBUTE_KEYS.reduce((sum, key) => sum + (map[key] ?? ATTRIBUTE_BASELINE), 0);
}

/** Pontos ainda disponíveis (budget − alocado). Zero = pronto pra salvar. */
export function remainingPoints(map: AttributeMap): number {
  return ATTRIBUTE_BUDGET - totalPoints(map);
}

/** Mapa base (tudo no baseline; ainda faltam os 20 de bônus). */
export function baselineAttributeMap(): AttributeMap {
  return toAttributeMap(null);
}

/** Compara dois mapas por valor — habilita "Salvar" só com mudança real. */
export function attributeMapsEqual(a: AttributeMap, b: AttributeMap): boolean {
  return ATTRIBUTE_KEYS.every((k) => (a[k] ?? ATTRIBUTE_BASELINE) === (b[k] ?? ATTRIBUTE_BASELINE));
}
