/**
 * Posições de jogador — vocabulário do domínio (mesmos valores do enum
 * `primaryPos`/`secondaryPos` da API). Os nomes já nascem em pt-BR no backend,
 * então as labels aqui são mapeamento de domínio, não chaves i18n.
 */
export type Position = "goleiro" | "zagueiro" | "lateral" | "volante" | "meia" | "atacante";

export const POSITIONS: readonly Position[] = [
  "goleiro",
  "zagueiro",
  "lateral",
  "volante",
  "meia",
  "atacante",
] as const;

/** Abreviação curta (3 letras) — usada no badge de posição do PlayerCard. */
const POSITION_ABBREVIATIONS: Record<Position, string> = {
  goleiro: "GOL",
  zagueiro: "ZAG",
  lateral: "LAT",
  volante: "VOL",
  meia: "MEI",
  atacante: "ATA",
};

/** Nome por extenso — usado em pickers/formulários. */
const POSITION_LABELS: Record<Position, string> = {
  goleiro: "Goleiro",
  zagueiro: "Zagueiro",
  lateral: "Lateral",
  volante: "Volante",
  meia: "Meia",
  atacante: "Atacante",
};

export function positionAbbreviation(position: Position): string {
  return POSITION_ABBREVIATIONS[position];
}

export function positionLabel(position: Position): string {
  return POSITION_LABELS[position];
}

// ─── Modalidade + posições por modalidade (afinidade/carreira) ───────────────
// Vocabulário separado do `Position` legado acima (que ainda serve o rating do
// organizador). Espelha `FieldPosition`/`Modality` do backend.

export type Modality = "futsal" | "society" | "campo";
export const MODALITIES: readonly Modality[] = ["futsal", "society", "campo"];

const MODALITY_LABELS: Record<Modality, string> = {
  futsal: "Futsal",
  society: "Futebol 7",
  campo: "Futebol 11",
};
export function modalityLabel(m: Modality): string {
  return MODALITY_LABELS[m];
}

export type FieldPosition =
  | "futsal_goleiro" | "futsal_fixo" | "futsal_ala" | "futsal_pivo"
  | "society_goleiro" | "society_lateral" | "society_volante" | "society_meia" | "society_ala" | "society_atacante"
  | "campo_goleiro" | "campo_lateral" | "campo_ala_volante" | "campo_meia_esq" | "campo_meia" | "campo_meia_dir" | "campo_camisa10" | "campo_ponta_esq" | "campo_atacante" | "campo_ponta_dir";

export const MODALITY_POSITIONS: Record<Modality, readonly FieldPosition[]> = {
  futsal: ["futsal_goleiro", "futsal_fixo", "futsal_ala", "futsal_pivo"],
  society: ["society_goleiro", "society_lateral", "society_volante", "society_meia", "society_ala", "society_atacante"],
  campo: ["campo_goleiro", "campo_lateral", "campo_ala_volante", "campo_meia_esq", "campo_meia", "campo_meia_dir", "campo_camisa10", "campo_ponta_esq", "campo_atacante", "campo_ponta_dir"],
};

export const FIELD_POSITIONS: readonly FieldPosition[] = [
  ...MODALITY_POSITIONS.futsal,
  ...MODALITY_POSITIONS.society,
  ...MODALITY_POSITIONS.campo,
];

const FIELD_POSITION_LABELS: Record<FieldPosition, string> = {
  futsal_goleiro: "Goleiro", futsal_fixo: "Fixo", futsal_ala: "Ala", futsal_pivo: "Pivô",
  society_goleiro: "Goleiro", society_lateral: "Lateral/Zagueiro", society_volante: "Volante", society_meia: "Meio de campo", society_ala: "Ala", society_atacante: "Atacante",
  campo_goleiro: "Goleiro", campo_lateral: "Lateral/Zagueiro", campo_ala_volante: "Ala/Volante", campo_meia_esq: "Meia esquerda", campo_meia: "Meio de campo", campo_meia_dir: "Meia direita", campo_camisa10: "Camisa 10", campo_ponta_esq: "Ponta esquerda", campo_atacante: "Atacante", campo_ponta_dir: "Ponta direita",
};

const FIELD_POSITION_ABBREVIATIONS: Record<FieldPosition, string> = {
  futsal_goleiro: "GOL", futsal_fixo: "FIX", futsal_ala: "ALA", futsal_pivo: "PIV",
  society_goleiro: "GOL", society_lateral: "LAT", society_volante: "VOL", society_meia: "MEI", society_ala: "ALA", society_atacante: "ATA",
  campo_goleiro: "GOL", campo_lateral: "LAT", campo_ala_volante: "AVO", campo_meia_esq: "MEE", campo_meia: "MEI", campo_meia_dir: "MED", campo_camisa10: "C10", campo_ponta_esq: "PEE", campo_atacante: "ATA", campo_ponta_dir: "PED",
};

export function fieldPositionLabel(p: FieldPosition): string {
  return FIELD_POSITION_LABELS[p];
}
export function fieldPositionAbbreviation(p: FieldPosition): string {
  return FIELD_POSITION_ABBREVIATIONS[p];
}
export function isGoalkeeper(p: string): boolean {
  return p.endsWith("_goleiro");
}
