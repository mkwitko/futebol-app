import { env } from "@/env";

/**
 * Monta a URL pública do convite (página do convidado no site) a partir do
 * `sharePath` retornado por `POST /matches/:id/invite` (ex.: `/invite/<token>`)
 * e da base configurável do site (`EXPO_PUBLIC_WEB_URL`, default
 * `http://localhost:5173` em desenvolvimento).
 */
export function buildInviteUrl(sharePath: string): string {
  return `${env.EXPO_PUBLIC_WEB_URL}${sharePath}`;
}
