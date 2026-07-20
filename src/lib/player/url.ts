import { env } from "@/env";

/**
 * Monta a URL pública do perfil do jogador (página que o site vai renderizar
 * a partir de `getPublicProfile` — tarefa futura) a partir do `playerId` e da
 * base configurável do site (`EXPO_PUBLIC_WEB_URL`, default
 * `http://localhost:5173` em desenvolvimento). Usada pelo botão "Compartilhar
 * perfil" em "Minha carreira".
 *
 * NOTA: será substituída pelo link `/j/:slug` (ver `buildShareUrl` abaixo) no
 * call site de `perfil.tsx` — Fase 3 Tarefa 2. Mantida por ora para não
 * quebrar o fluxo existente.
 */
export function buildPlayerProfileUrl(playerId: string): string {
  return `${env.EXPO_PUBLIC_WEB_URL}/player/${playerId}`;
}

/**
 * Assunto compartilhável. O link canônico é servido pelo BACKEND
 * (`EXPO_PUBLIC_API_URL`), que renderiza as meta OG e redireciona o
 * espectador pro app/loja/web (ver Fase 1). NÃO usar `EXPO_PUBLIC_WEB_URL`
 * aqui — a web não serve OG (SPA).
 */
export type ShareSubject =
  | { kind: "carta" }
  | { kind: "conquista"; key: string }
  | { kind: "ranking"; groupId: string; playerId: string };

const base = () => env.EXPO_PUBLIC_API_URL;

/** URL do link inteligente `/j/:slug` (+ `?a=` conquista / `?r=` ranking). */
export function buildShareUrl(slug: string, subject: ShareSubject): string {
  if (subject.kind === "conquista") return `${base()}/j/${slug}?a=${subject.key}`;
  if (subject.kind === "ranking") return `${base()}/j/${slug}?r=${subject.groupId}`;
  return `${base()}/j/${slug}`;
}

/** URL direta do PNG (para baixar e compartilhar imagem no IG/galeria). */
export function buildOgImageUrl(slug: string, subject: ShareSubject): string {
  if (subject.kind === "conquista") return `${base()}/og/conquista/${slug}/${subject.key}.png`;
  if (subject.kind === "ranking") return `${base()}/og/ranking/${subject.groupId}/${subject.playerId}.png`;
  return `${base()}/og/carta/${slug}.png`;
}
