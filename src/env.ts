import Constants from "expo-constants";
import { z } from "zod";

/**
 * Env validada com Zod. A base URL da API vem, em ordem de prioridade:
 * 1. `EXPO_PUBLIC_API_URL` (embutida no bundle pelo Metro)
 * 2. `extra.apiUrl` do `app.config.ts` (que já lê a mesma env, com fallback local)
 * 3. `http://localhost:3333` (default de desenvolvimento)
 */
const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string };

const rawEnv = {
  EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV ?? "development",
  EXPO_PUBLIC_API_URL:
    process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? "http://localhost:3333",
};

const envSchema = z.object({
  EXPO_PUBLIC_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  EXPO_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(rawEnv);
