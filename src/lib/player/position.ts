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
