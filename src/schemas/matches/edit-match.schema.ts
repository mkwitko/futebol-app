import { z } from "zod";
import type { GetMatch200 } from "@/api/generated/types/GetMatch";
import { centsToReaisInput } from "@/lib/money";
import { MAX_SLOTS, MIN_SLOTS } from "./create-match.schema";

/**
 * Edição de pelada — mesmos campos de criação, SEM recorrência (editar a série
 * inteira é outra tela; editar uma ocorrência a desacopla, ver back
 * `update-match.service`). `latitude`/`longitude` seguem obrigatórios (a pelada
 * precisa de coords pra aparecer no Descobrir) — validado no `superRefine`.
 * `date`/`time` viram um `datetime` ISO no submit (`combineDateAndTime`);
 * `priceInput` (reais) vira `priceCents` (`reaisInputToCents`).
 */
export const editMatchSchema = z
  .object({
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
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    city: z.string().max(120).nullable().optional(),
    address: z.string().max(200).nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.latitude === null || val.longitude === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["latitude"],
        message: "matches:create.geoRequired",
      });
    }
  });

export type EditMatchFormValues = z.infer<typeof editMatchSchema>;

/** Pré-preenche o form a partir da pelada carregada (`GET /matches/:id`). */
export function editMatchValuesFromMatch(match: GetMatch200): EditMatchFormValues {
  const when = new Date(match.datetime);
  return {
    date: when,
    time: when,
    location: match.location,
    slots: match.slots,
    priceInput: match.priceCents ? centsToReaisInput(match.priceCents) : "",
    pixKey: match.pixKey ?? "",
    modality: match.modality,
    latitude: match.latitude ?? null,
    longitude: match.longitude ?? null,
    city: match.city ?? null,
    address: match.address ?? null,
  };
}
