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
  // Geo do local (LocationPicker). `latitude`/`longitude` são OBRIGATÓRIOS —
  // sem coords a pelada não aparece no Descobrir (o feed filtra por coords +
  // raio). A validação de presença fica no `superRefine` abaixo (o campo
  // guarda `null` até o usuário escolher no mapa). `location` (texto livre)
  // segue sendo o nome/apelido do campo; estes guardam coords/cidade/endereço.
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  city: z.string().max(120).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  recurrence: z.custom<RecurrenceValue | null>(),
}).superRefine((val, ctx) => {
  if (val.latitude === null || val.longitude === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["latitude"],
      message: "matches:create.geoRequired",
    });
  }
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
    latitude: null,
    longitude: null,
    city: null,
    address: null,
    recurrence: null,
  };
}
