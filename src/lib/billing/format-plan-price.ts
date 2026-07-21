import { formatCentsToBRL } from "@/lib/money";

export type PlanPrice = { amountCents: number; currency: string; interval: string };

/**
 * Formata o preço de um plano pra exibição — ex `"R$ 19,90/mês"`. Usa
 * `formatCentsToBRL` (moeda BRL) e o rótulo de intervalo do i18n. Preço
 * `null` (billing off / price ausente) vira string vazia.
 */
export function formatPlanPrice(
  price: PlanPrice | null,
  t: (key: string) => string,
): string {
  if (!price) return "";
  const amount = formatCentsToBRL(price.amountCents);
  const interval = t(`billing:planos.interval.${price.interval}`);
  return `${amount}${interval}`;
}
