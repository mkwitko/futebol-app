import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, { message: "zod:required" }).email({ message: "zod:email" }),
  password: z.string().min(1, { message: "zod:required" }),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
