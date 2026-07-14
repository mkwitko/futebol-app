import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, { message: "zod:required" })
    .max(120, { message: "zod:maxLength" }),
});

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
