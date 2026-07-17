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
  pushEnabled?: string;
  placesAutocompleteEnabled?: string;
  googlePlacesApiKey?: string;
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
  // Push (FCM) — "true" liga; vazio/qualquer outra coisa = desligado (Expo Go
  // roda normalmente sem tocar no Firebase). Ver .env.example.
  EXPO_PUBLIC_PUSH_ENABLED: process.env.EXPO_PUBLIC_PUSH_ENABLED ?? extra.pushEnabled ?? "false",
  // Places Autocomplete (busca de endereço no LocationPicker) — "true" liga;
  // vazio/qualquer outra coisa = desligado. Só tem efeito real junto com a
  // chave abaixo (ver isPlacesAutocompleteEnabled). Sem isso, o LocationPicker
  // cai na cadeia grátis (mapa + pin + reverse-geocode). Ver .env.example.
  EXPO_PUBLIC_PLACES_AUTOCOMPLETE_ENABLED:
    process.env.EXPO_PUBLIC_PLACES_AUTOCOMPLETE_ENABLED ?? extra.placesAutocompleteEnabled ?? "false",
  // Chave do Google Places (autocomplete + details). Vazia ⇒ autocomplete off
  // (independe do flag acima). Ver .env.example.
  EXPO_PUBLIC_GOOGLE_PLACES_API_KEY:
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? extra.googlePlacesApiKey ?? "",
};

const envSchema = z.object({
  EXPO_PUBLIC_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_WEB_URL: z.string().url(),
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: z.string().default(""),
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: z.string().default(""),
  EXPO_PUBLIC_PUSH_ENABLED: z.string().default("false"),
  EXPO_PUBLIC_PLACES_AUTOCOMPLETE_ENABLED: z.string().default("false"),
  EXPO_PUBLIC_GOOGLE_PLACES_API_KEY: z.string().default(""),
});

export const env = envSchema.parse(rawEnv);

/**
 * Places Autocomplete só liga com o flag em "true" E uma chave não-vazia —
 * exatamente como Google Sign-In/push são config-gated. Off/sem chave ⇒ o
 * LocationPicker usa só mapa + pin + reverse-geocode (expo-location), custo
 * zero, sem nenhuma chave.
 */
export const isPlacesAutocompleteEnabled =
  env.EXPO_PUBLIC_PLACES_AUTOCOMPLETE_ENABLED === "true" &&
  env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY.length > 0;
