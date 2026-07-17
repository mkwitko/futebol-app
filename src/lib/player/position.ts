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
  | "futsal_goleiro" | "futsal_fixo" | "futsal_ala_esq" | "futsal_ala_dir" | "futsal_pivo"
  | "society_goleiro" | "society_zagueiro" | "society_lateral_esq" | "society_lateral_dir" | "society_volante" | "society_meia" | "society_ala_esq" | "society_ala_dir" | "society_atacante"
  | "campo_goleiro" | "campo_zagueiro" | "campo_lateral_esq" | "campo_lateral_dir" | "campo_volante" | "campo_meia_esq" | "campo_meia" | "campo_meia_dir" | "campo_camisa10" | "campo_ponta_esq" | "campo_atacante" | "campo_ponta_dir";

export const MODALITY_POSITIONS: Record<Modality, readonly FieldPosition[]> = {
  futsal: ["futsal_goleiro", "futsal_fixo", "futsal_ala_esq", "futsal_ala_dir", "futsal_pivo"],
  society: ["society_goleiro", "society_zagueiro", "society_lateral_esq", "society_lateral_dir", "society_volante", "society_meia", "society_ala_esq", "society_ala_dir", "society_atacante"],
  campo: ["campo_goleiro", "campo_zagueiro", "campo_lateral_esq", "campo_lateral_dir", "campo_volante", "campo_meia_esq", "campo_meia", "campo_meia_dir", "campo_camisa10", "campo_ponta_esq", "campo_atacante", "campo_ponta_dir"],
};

export const FIELD_POSITIONS: readonly FieldPosition[] = [
  ...MODALITY_POSITIONS.futsal,
  ...MODALITY_POSITIONS.society,
  ...MODALITY_POSITIONS.campo,
];

const FIELD_POSITION_LABELS: Record<FieldPosition, string> = {
  futsal_goleiro: "Goleiro", futsal_fixo: "Fixo", futsal_ala_esq: "Ala esquerda", futsal_ala_dir: "Ala direita", futsal_pivo: "Pivô",
  society_goleiro: "Goleiro", society_zagueiro: "Zagueiro", society_lateral_esq: "Lateral esquerdo", society_lateral_dir: "Lateral direito", society_volante: "Volante", society_meia: "Meio de campo", society_ala_esq: "Ala esquerda", society_ala_dir: "Ala direita", society_atacante: "Atacante",
  campo_goleiro: "Goleiro", campo_zagueiro: "Zagueiro", campo_lateral_esq: "Lateral esquerdo", campo_lateral_dir: "Lateral direito", campo_volante: "Volante", campo_meia_esq: "Meia esquerda", campo_meia: "Meio de campo", campo_meia_dir: "Meia direita", campo_camisa10: "Camisa 10", campo_ponta_esq: "Ponta esquerda", campo_atacante: "Atacante", campo_ponta_dir: "Ponta direita",
};

const FIELD_POSITION_ABBREVIATIONS: Record<FieldPosition, string> = {
  futsal_goleiro: "GOL", futsal_fixo: "FIX", futsal_ala_esq: "AE", futsal_ala_dir: "AD", futsal_pivo: "PIV",
  society_goleiro: "GOL", society_zagueiro: "ZAG", society_lateral_esq: "LE", society_lateral_dir: "LD", society_volante: "VOL", society_meia: "MEI", society_ala_esq: "ME", society_ala_dir: "MD", society_atacante: "ATA",
  campo_goleiro: "GOL", campo_zagueiro: "ZAG", campo_lateral_esq: "LE", campo_lateral_dir: "LD", campo_volante: "VOL", campo_meia_esq: "ME", campo_meia: "MEI", campo_meia_dir: "MD", campo_camisa10: "C10", campo_ponta_esq: "PE", campo_atacante: "ATA", campo_ponta_dir: "PD",
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
