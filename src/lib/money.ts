/**
 * Dinheiro — sempre armazenado como inteiro de centavos (`priceCents`, igual à
 * API). Estas funções só existem na borda: exibição (centavos → "R$ 20,00")
 * e entrada de formulário (texto digitado em reais → centavos).
 */

const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** Formata centavos para exibição ("R$ 20,00"). */
export function formatCentsToBRL(cents: number): string {
  return BRL_FORMATTER.format(cents / 100);
}

/**
 * Converte o texto digitado no campo de preço (reais) para centavos. Aceita
 * tanto vírgula ("20,50", padrão pt-BR) quanto ponto ("20.50", comum no
 * teclado `decimal-pad`) como separador decimal. Quando ambos aparecem
 * ("1.234,56") o ponto é tratado como separador de milhar. Campo
 * vazio/inválido → `undefined` (pelada gratuita — `priceCents` é opcional na API).
 */
export function reaisInputToCents(input: string | undefined): number | undefined {
  const trimmed = input?.trim() ?? "";
  if (!trimmed) return undefined;

  // Com vírgula presente: ponto = milhar (removido), vírgula = decimal.
  // Sem vírgula: ponto (se houver) é o separador decimal — preservado.
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return undefined;

  return Math.round(value * 100);
}

/** Inverso de `reaisInputToCents` — usado para preencher o form em modo edição. */
export function centsToReaisInput(cents: number | undefined | null): string {
  if (!cents) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
