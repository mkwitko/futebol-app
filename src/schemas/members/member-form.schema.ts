import { z } from "zod";
import { POSITIONS, type Position } from "@/lib/player/position";

const positionSchema = z.enum(POSITIONS as readonly [Position, ...Position[]]);

const affinityValue = z.number().min(0).max(100);
const overallValue = z.number().min(0).max(99);

/**
 * `affinity`/`seedOverall` são mantidos como um record completo (as 6
 * posições) no estado do formulário — simplifica o binding via `Controller`
 * (`name={`affinity.${position}`}`) e os defaults. Só as posições
 * selecionadas (`primaryPos` + `secondaryPos`) são enviadas à API no submit
 * (ver `member-sheet.tsx`).
 */
export const memberFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: "zod:required" })
    .max(120, { message: "zod:maxLength" }),
  phone: z.string().max(32, { message: "zod:maxLength" }).optional(),
  primaryPos: positionSchema,
  secondaryPos: z.array(positionSchema),
  affinity: z.object({
    goleiro: affinityValue,
    zagueiro: affinityValue,
    lateral: affinityValue,
    volante: affinityValue,
    meia: affinityValue,
    atacante: affinityValue,
  }),
  seedOverall: z.object({
    goleiro: overallValue,
    zagueiro: overallValue,
    lateral: overallValue,
    volante: overallValue,
    meia: overallValue,
    atacante: overallValue,
  }),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

const DEFAULT_AFFINITY = 60;
const DEFAULT_OVERALL = 60;
const DEFAULT_PRIMARY_POS: Position = "atacante";
const PRIMARY_AFFINITY_BOOST = 100;

/** Defaults "aproximáveis" para um novo jogador — ajustáveis via Stepper, nunca forçados. */
export function defaultMemberFormValues(): MemberFormValues {
  return {
    name: "",
    phone: "",
    primaryPos: DEFAULT_PRIMARY_POS,
    secondaryPos: [],
    affinity: {
      goleiro: DEFAULT_AFFINITY,
      zagueiro: DEFAULT_AFFINITY,
      lateral: DEFAULT_AFFINITY,
      volante: DEFAULT_AFFINITY,
      meia: DEFAULT_AFFINITY,
      atacante: PRIMARY_AFFINITY_BOOST,
    },
    seedOverall: {
      goleiro: DEFAULT_OVERALL,
      zagueiro: DEFAULT_OVERALL,
      lateral: DEFAULT_OVERALL,
      volante: DEFAULT_OVERALL,
      meia: DEFAULT_OVERALL,
      atacante: DEFAULT_OVERALL,
    },
  };
}
