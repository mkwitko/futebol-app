import { env } from "@/env";

/**
 * Monta a URL pública do perfil do jogador (página que o site vai renderizar
 * a partir de `getPublicProfile` — tarefa futura) a partir do `playerId` e da
 * base configurável do site (`EXPO_PUBLIC_WEB_URL`, default
 * `http://localhost:5173` em desenvolvimento). Usada pelo botão "Compartilhar
 * perfil" em "Minha carreira".
 */
export function buildPlayerProfileUrl(playerId: string): string {
  return `${env.EXPO_PUBLIC_WEB_URL}/player/${playerId}`;
}
