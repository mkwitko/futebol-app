import { router } from "expo-router";
import { env } from "@/env";
import { clearTokens, getRefreshToken, saveTokens, type Tokens } from "./tokens";

/**
 * Resposta de auth do backend próprio (JWT + refresh, sem `expiresIn`):
 * `{ accessToken, refreshToken, user }` — ver `/auth/register`, `/auth/login`,
 * `/auth/refresh` no `openapi.json`.
 */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  hasPassword: boolean;
  googleSub: string | null;
  createdAt: string;
};

export type AuthTokenResponse = Tokens & { user: AuthUser };

const api = (path: string) => `${env.EXPO_PUBLIC_API_URL}${path}`;

/**
 * Troca o refresh token por um novo par (rotação). Usada exclusivamente pelo
 * wrapper de fetch (`src/api/client.ts`) no fluxo de 401 → refresh-once → retry.
 * É um `fetch` cru de propósito: os hooks gerados pelo Kubb importam o client
 * como dependência, então o client não pode depender de volta dos hooks gerados
 * (evita import circular).
 */
export async function refreshAccessToken(): Promise<Tokens | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(api("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as AuthTokenResponse;
    const tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
    await saveTokens(tokens);
    return tokens;
  } catch {
    return null;
  }
}

/**
 * Logout forçado: limpa o secure store e manda o usuário de volta pro grupo
 * `(auth)`. Chamado quando o refresh (após um 401) falha.
 */
export async function forceLogout(): Promise<void> {
  await clearTokens();
  router.replace("/(auth)/sign-in");
}
