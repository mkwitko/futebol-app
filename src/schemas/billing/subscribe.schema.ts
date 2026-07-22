import { z } from "zod";

/** Remove tudo que não é dígito — usado tanto na validação quanto no submit. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Assinatura via Woovi PIX Automático (`POST /billing/subscribe`): CPF
 * (`taxId`) e telefone. O usuário pode digitar o CPF com ou sem máscara
 * (`000.000.000-00`) — a validação sempre confere os dígitos limpos, e o
 * submit (ver `use-subscribe.ts`/`subscribe-form.tsx`) manda só os dígitos
 * pra API.
 */
export const subscribeSchema = z.object({
  taxId: z
    .string()
    .min(1, { message: "zod:required" })
    .refine((value) => onlyDigits(value).length === 11, { message: "zod:invalidTaxId" }),
  phone: z
    .string()
    .min(8, { message: "zod:minLength" })
    .max(20, { message: "zod:maxLength" }),
});

export type SubscribeFormValues = z.infer<typeof subscribeSchema>;
