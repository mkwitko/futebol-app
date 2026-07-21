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
 * Máscara BRL de entrada "centavos primeiro" (estilo caixa/POS): o usuário
 * digita dígitos puros e o valor é interpretado como centavos. A cadeia vai
 * sendo deslocada pra esquerda da vírgula — ex.:
 *
 *   digita "1"   → "0,01"
 *   digita "15"  → "0,15"
 *   digita "150" → "1,50"
 *   digita "1500"→ "15,00"
 *
 * A UI mostra o `R$ ` prefix e a vírgula fixa entre as duas últimas casas.
 * Sempre preserva cursor no fim (TextInput controlado). Essa máscara NÃO
 * suporta ponto como separador (o usuário não digita `.` nem `,` — só
 * números). qualquer coisa não-dígito é descartada.
 *
 * A função inversa (`reaisInputToCents`) continua funcionando pq lê só os
 * dígitos e a vírgula — a pontuação de milhares (.) e o prefix `R$ ` são
 * removidos lá dentro. Pra isso funcionar, ajustamos `reaisInputToCents` em
 * seqüência pra também desprezar `R$ ` e agrupamento de milhares.
 *
 * Exemplos:
 *   "1"      → "0,01"
 *   "15"     → "0,15"
 *   "150"    → "1,50"
 *   "1500"   → "15,00"
 *   "12345"  → "123,45"
 *   "123456" → "1.234,56"
 *   "" / não-dígito → ""
 */
export function maskBRLInput(input: string): string {
  // 1. Só conserva dígitos. Tudo mais (vírgula, ponto, "R$", letras) vaza.
  const cleaned = input.replace(/\D/g, "");
  if (!cleaned) return "";

  // 2. Interpreta como centavos e formata de volta pra "X,YY" com milhares.
  const cents = Number(cleaned);
  if (!Number.isFinite(cents) || cents <= 0) return "0,00";

  const reais = Math.floor(cents / 100);
  const centsRest = cents % 100;
  const reaisStr = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const centsStr = centsRest.toString().padStart(2, "0");
  return `${reaisStr},${centsStr}`;
}

/**
 * Converte o texto digitado no campo de preço (reais, no formato "R$ X,YY" ou
 * qualquer variação) para centavos. Aceita tanto vírgula ("20,50", padrão
 * pt-BR) quanto ponto ("20.50") como separador decimal. Quando ambos
 * aparecem ("1.234,56") o ponto é tratado como separador de milhar. Campo
 * vazio/inválido ⇒ `undefined` (pelada gratuita — `priceCents` é opcional).
 *
 * Tolerante ao prefix "R$ " e a agrupamento de milhares ".", já que a
 * máscara `maskBRLInput` agora emite esse formato ("R$ 15,00").
 */
export function reaisInputToCents(input: string | undefined): number | undefined {
  const trimmed = (input ?? "").trim();
  if (!trimmed) return undefined;

  // 1. Remove prefix "R$" e espaços.
  const noPrefix = trimmed.replace(/^R\$\s*/i, "");

  // 2. Com vírgula presente: ponto = milhar (removido), vírgula = decimal.
  //    Sem vírgula: ponto (se houver) é o separador decimal — preservado.
  const normalized = noPrefix.includes(",")
    ? noPrefix.replace(/\./g, "").replace(",", ".")
    : noPrefix;
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return undefined;

  return Math.round(value * 100);
}

/** Inverso de `reaisInputToCents` — usado para preencher o form em modo edição. */
export function centsToReaisInput(cents: number | undefined | null): string {
  if (!cents) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
