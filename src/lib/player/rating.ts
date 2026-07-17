/**
 * Fórmulas de overall (estilo FIFA) — espelho de `players.rating.ts` do
 * backend, usadas pro cálculo AO VIVO no editor de atributos (antes de salvar).
 * As respostas da API já trazem `categoryOverall`/`overallByPosition`/
 * `generalOverall` prontos; isto é só pro preview enquanto edita.
 */
import {
  type AttributeCategory,
  ATTRIBUTE_BASELINE,
  ATTRIBUTE_CATEGORIES,
  type AttributeMap,
  CATEGORY_SUBS,
} from "./attributes";
import type { FieldPosition } from "./position";

/** Pesos por posição (0-10) sobre [ritmo, finalizacao, passe, drible, defesa, fisico, goleiro]. Espelha o backend. */
export const POSITION_WEIGHTS: Record<FieldPosition, Record<AttributeCategory, number>> = {
  futsal_goleiro: { ritmo: 2, finalizacao: 0, passe: 3, drible: 2, defesa: 4, fisico: 4, goleiro: 10 },
  futsal_fixo: { ritmo: 5, finalizacao: 2, passe: 6, drible: 5, defesa: 9, fisico: 7, goleiro: 0 },
  futsal_ala: { ritmo: 9, finalizacao: 7, passe: 7, drible: 9, defesa: 4, fisico: 6, goleiro: 0 },
  futsal_pivo: { ritmo: 6, finalizacao: 9, passe: 6, drible: 8, defesa: 3, fisico: 8, goleiro: 0 },
  society_goleiro: { ritmo: 2, finalizacao: 0, passe: 3, drible: 2, defesa: 4, fisico: 4, goleiro: 10 },
  society_lateral: { ritmo: 8, finalizacao: 3, passe: 6, drible: 6, defesa: 8, fisico: 7, goleiro: 0 },
  society_volante: { ritmo: 6, finalizacao: 4, passe: 7, drible: 6, defesa: 9, fisico: 7, goleiro: 0 },
  society_meia: { ritmo: 6, finalizacao: 7, passe: 10, drible: 9, defesa: 4, fisico: 5, goleiro: 0 },
  society_ala: { ritmo: 9, finalizacao: 7, passe: 7, drible: 9, defesa: 4, fisico: 6, goleiro: 0 },
  society_atacante: { ritmo: 7, finalizacao: 10, passe: 5, drible: 8, defesa: 2, fisico: 7, goleiro: 0 },
  campo_goleiro: { ritmo: 2, finalizacao: 0, passe: 3, drible: 2, defesa: 4, fisico: 4, goleiro: 10 },
  campo_lateral: { ritmo: 8, finalizacao: 3, passe: 6, drible: 6, defesa: 8, fisico: 7, goleiro: 0 },
  campo_ala_volante: { ritmo: 7, finalizacao: 4, passe: 7, drible: 6, defesa: 9, fisico: 8, goleiro: 0 },
  campo_meia_esq: { ritmo: 7, finalizacao: 6, passe: 9, drible: 9, defesa: 4, fisico: 5, goleiro: 0 },
  campo_meia: { ritmo: 6, finalizacao: 6, passe: 10, drible: 8, defesa: 6, fisico: 6, goleiro: 0 },
  campo_meia_dir: { ritmo: 7, finalizacao: 6, passe: 9, drible: 9, defesa: 4, fisico: 5, goleiro: 0 },
  campo_camisa10: { ritmo: 6, finalizacao: 8, passe: 10, drible: 9, defesa: 2, fisico: 4, goleiro: 0 },
  campo_ponta_esq: { ritmo: 9, finalizacao: 7, passe: 7, drible: 10, defesa: 2, fisico: 5, goleiro: 0 },
  campo_atacante: { ritmo: 7, finalizacao: 10, passe: 5, drible: 8, defesa: 2, fisico: 7, goleiro: 0 },
  campo_ponta_dir: { ritmo: 9, finalizacao: 7, passe: 7, drible: 10, defesa: 2, fisico: 5, goleiro: 0 },
};

export function categoryOverall(attrs: AttributeMap, category: AttributeCategory): number {
  const subs = CATEGORY_SUBS[category];
  const sum = subs.reduce((acc, k) => acc + (attrs[k] ?? ATTRIBUTE_BASELINE), 0);
  return Math.round(sum / subs.length);
}

export function categoryOveralls(attrs: AttributeMap): Record<AttributeCategory, number> {
  const out = {} as Record<AttributeCategory, number>;
  for (const c of ATTRIBUTE_CATEGORIES) out[c] = categoryOverall(attrs, c);
  return out;
}

export function positionOverall(attrs: AttributeMap, position: FieldPosition): number {
  const w = POSITION_WEIGHTS[position];
  let weighted = 0;
  let total = 0;
  for (const c of ATTRIBUTE_CATEGORIES) {
    if (w[c] <= 0) continue;
    weighted += categoryOverall(attrs, c) * w[c];
    total += w[c];
  }
  return total > 0 ? Math.round(weighted / total) : 0;
}

/** Base efetiva (0-99): overall da posição modulado pela afinidade (0.5 + 0.5×aff/100). */
export function effectiveBase(attrs: AttributeMap, position: FieldPosition, affinity: number): number {
  const factor = 0.5 + 0.5 * (Math.max(0, Math.min(100, affinity)) / 100);
  return Math.min(99, Math.round(positionOverall(attrs, position) * factor));
}
