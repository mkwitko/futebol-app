import { env } from "@/env";

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
