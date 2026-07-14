// Re-exporta o hook/contexto de auth (definido em `src/contexts/auth-context.tsx`)
// no caminho por-módulo convencionado (`src/hooks/<modulo>/`).
export { useAuth, AuthProvider } from "@/contexts/auth-context";
export type { AuthActions, AuthState, AuthUser } from "@/contexts/auth-context";
