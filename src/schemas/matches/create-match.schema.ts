import { z } from "zod";
import type { RecurrenceValue } from "@/components/matches/recurrence-picker";

export const DEFAULT_SLOTS = 18;
export const MIN_SLOTS = 2;
export const MAX_SLOTS = 64;

/**
 * `date`/`time` ficam como dois campos `Date` separados no form (um picker de
 * cada) — combinados em um único `datetime` ISO só no submit (ver
 * `create-match-form.tsx` / `combineDateAndTime`). `priceInput` é o texto
 * digitado em reais (não centavos) — convertido para `priceCents` no submit
 * (`reaisInputToCents`).
 *
 * `recurrence` não passa pela validação do Zod (é um objeto composto — regra
 * + horário/datas — cuja validade já é garantida pelo próprio
 * `RecurrencePicker`, que só emite formas válidas). `null` = pelada avulsa
 * (sem série); é o único campo do form gerenciado fora do `standardSchemaResolver`.
 */
export const createMatchSchema = z.object({
  date: z.date(),
  time: z.date(),
  location: z
    .string()
    .min(1, { message: "zod:required" })
    .max(160, { message: "zod:maxLength" }),
  slots: z.number().int().min(MIN_SLOTS).max(MAX_SLOTS),
  priceInput: z.string().max(20).optional(),
  pixKey: z.string().max(140, { message: "zod:maxLength" }).optional(),
  modality: z.enum(["futsal", "society", "campo"]),
  recurrence: z.custom<RecurrenceValue | null>(),
});

export type CreateMatchFormValues = z.infer<typeof createMatchSchema>;

/** Próxima hora cheia — ponto de partida razoável para "quando é a pelada". */
function nextFullHour(): Date {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  return now;
}

export function defaultCreateMatchFormValues(): CreateMatchFormValues {
  const start = nextFullHour();
  return {
    date: start,
    time: start,
    location: "",
    slots: DEFAULT_SLOTS,
    priceInput: "",
    pixKey: "",
    modality: "campo",
    recurrence: null,
  };
}
