/**
 * Tipos de conta (roles) — intenção/feature-unlock declarada pelo próprio
 * usuário, NÃO fronteira de autorização (o backend segue autorizando por
 * ownership + entitlements). Espelha o enum `Role` do backend.
 */
export const ROLE_KEYS = ["jogador", "organizador", "quadra"] as const;

export type Role = (typeof ROLE_KEYS)[number];

/** Default quando nada é escolhido no cadastro (espelha o default do backend). */
export const DEFAULT_ROLES: Role[] = ["jogador"];

/** Igualdade set-insensível à ordem — usada pra detectar rascunho "sujo" no perfil. */
export function rolesEqual(a: readonly Role[], b: readonly Role[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((role) => setB.has(role));
}
