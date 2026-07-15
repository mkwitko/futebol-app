import Constants from "expo-constants";
import { z } from "zod";

/**
 * Env validada com Zod. A base URL da API e a base URL do site (usada para
 * montar o link de convite do zap — `EXPO_PUBLIC_WEB_URL`) vêm, em ordem de
 * prioridade:
 * 1. `EXPO_PUBLIC_*` (embutida no bundle pelo Metro)
 * 2. `extra.*` do `app.config.ts` (que já lê a mesma env, com fallback local)
 * 3. Default de desenvolvimento
 */
const extra = (Constants.expoConfig?.extra ?? {}) as {
  apiUrl?: string;
  webUrl?: string;
  googleWebClientId?: string;
  googleIosClientId?: string;
};

const rawEnv = {
  EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV ?? "development",
  EXPO_PUBLIC_API_URL:
    process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? "http://localhost:3333",
  EXPO_PUBLIC_WEB_URL:
    process.env.EXPO_PUBLIC_WEB_URL ?? extra.webUrl ?? "http://localhost:5173",
  // Google Sign-In — vazio = feature desligada (botão "em breve"). Ver
  // .env.example para o que o desenvolvedor precisa configurar.
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? extra.googleWebClientId ?? "",
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? extra.googleIosClientId ?? "",
};

const envSchema = z.object({
  EXPO_PUBLIC_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_WEB_URL: z.string().url(),
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().default(""),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().default(""),
});

export const env = envSchema.parse(rawEnv);
