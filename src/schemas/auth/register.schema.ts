import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "zod:minLength" })
      .max(120, { message: "zod:maxLength" }),
    email: z.string().min(1, { message: "zod:required" }).email({ message: "zod:email" }),
    password: z.string().min(8, { message: "zod:minLength" }),
    confirmPassword: z.string().min(1, { message: "zod:required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "zod:passwordMismatch",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
