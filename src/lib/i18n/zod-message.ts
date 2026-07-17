/**
 * Chaves i18n usadas como `message` nos schemas Zod (`src/schemas/<modulo>/*`).
 * `react-i18next` (com a type augmentation em `types.d.ts`) tipa `t()` com uma
 * união restrita de chaves conhecidas; o `message` de um `FieldError` do React
 * Hook Form é só `string` em tempo de compilação, então normalizamos aqui em
 * vez de espalhar `as any` pelos formulários.
 */
const ZOD_MESSAGE_KEYS = [
  "zod:required",
  "zod:email",
  "zod:minLength",
  "zod:maxLength",
  "zod:passwordMismatch",
] as const;

export type ZodMessageKey = (typeof ZOD_MESSAGE_KEYS)[number];

export function asZodMessageKey(message: string | undefined): ZodMessageKey {
  const keys: readonly string[] = ZOD_MESSAGE_KEYS;
  return keys.includes(message ?? "") ? (message as ZodMessageKey) : "zod:required";
}
