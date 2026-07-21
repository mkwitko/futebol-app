import { formatPlanPrice } from "@/lib/billing/format-plan-price";

const t = ((key: string) =>
  ({ "billing:planos.interval.month": "/mês", "billing:planos.interval.year": "/ano" })[key] ??
  key) as unknown as (k: string) => string;

// `formatCentsToBRL` (Intl.NumberFormat pt-BR/BRL) usa espaço não-quebrável
// (U+00A0) entre "R$" e o valor — não um espaço comum (ver `src/lib/money.ts`
// e `test/lib/money.test.ts`, que por isso usa `toContain` em vez de `toBe`).
describe("formatPlanPrice", () => {
  it("formata BRL mensal", () => {
    expect(formatPlanPrice({ amountCents: 1990, currency: "brl", interval: "month" }, t)).toBe(
      "R$ 19,90/mês",
    );
  });

  it("formata intervalo anual", () => {
    expect(formatPlanPrice({ amountCents: 19900, currency: "brl", interval: "year" }, t)).toBe(
      "R$ 199,00/ano",
    );
  });

  it("preço null ⇒ string vazia", () => {
    expect(formatPlanPrice(null, t)).toBe("");
  });
});
