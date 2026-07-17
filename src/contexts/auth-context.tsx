import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getMeQueryKey,
  useGetMe,
} from "@/api/generated/hooks/authHooks/useGetMe";
import { useLoginGoogleUser } from "@/api/generated/hooks/authHooks/useLoginGoogleUser";
import { useLoginUser } from "@/api/generated/hooks/authHooks/useLoginUser";
import { useRegisterUser } from "@/api/generated/hooks/authHooks/useRegisterUser";
import type { GetMeQueryResponse } from "@/api/generated/types/GetMe";
import {
  isGoogleSignInConfigured,
  signInWithGoogleNative,
  signOutGoogleNative,
} from "@/lib/auth/google";
import { forceLogout } from "@/lib/auth/session";
import { getAccessToken, saveTokens } from "@/lib/auth/tokens";
import { usePushHandlers } from "@/lib/push/use-push-handlers";
import { usePushRegistration } from "@/lib/push/use-push-registration";

export type AuthUser = GetMeQueryResponse;

export type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

export type AuthActions = {
  /** E-mail/senha — a única forma de login funcional nesta fase. */
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  /**
   * Login com Google — fluxo nativo real, mas config-gated: só funciona
   * (e só deve ser chamado) quando `isGoogleSignInConfigured` é `true` (ver
   * `src/lib/auth/google.ts` e `.env.example`). Sem os client IDs OAuth
   * configurados, o botão em `src/components/auth/google-sign-in-button.tsx`
   * fica desabilitado e nem chama isso.
   */
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // `null` = ainda não sabemos se há token no secure store (checagem é async).
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    void getAccessToken().then((token) => {
      if (mounted) setHasToken(!!token);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const meQuery = useGetMe({
    query: {
      enabled: hasToken === true,
      retry: false,
    },
  });

  const loginMutation = useLoginUser();
  const registerMutation = useRegisterUser();
  const loginGoogleMutation = useLoginGoogleUser();

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation.mutateAsync({ data: { email, password } });
      await saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      queryClient.setQueryData(getMeQueryKey(), result.user);
      setHasToken(true);
    },
    [loginMutation, queryClient],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await registerMutation.mutateAsync({ data: { email, password, name } });
      await saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      queryClient.setQueryData(getMeQueryKey(), result.user);
      setHasToken(true);
    },
    [registerMutation, queryClient],
  );

  const signInWithGoogle = useCallback(async () => {
    if (!isGoogleSignInConfigured) {
      throw new Error("google_sign_in_not_configured");
    }
    const idToken = await signInWithGoogleNative();
    const result = await loginGoogleMutation.mutateAsync({ data: { idToken } });
    await saveTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
    queryClient.setQueryData(getMeQueryKey(), result.user);
    setHasToken(true);
  }, [loginGoogleMutation, queryClient]);

  const signOut = useCallback(async () => {
    queryClient.removeQueries({ queryKey: getMeQueryKey() });
    setHasToken(false);
    // Encerra a sessão nativa do Google também — senão o próximo login pula o
    // seletor e reentra na conta anterior.
    await signOutGoogleNative();
    await forceLogout();
  }, [queryClient]);

  const isLoading = hasToken === null || (hasToken === true && meQuery.isLoading);
  const isAuthenticated = hasToken === true && !!meQuery.data && !meQuery.isError;

  // Registra o device pra push (FCM) e liga os handlers de mensagem recebida
  // enquanto a sessão está autenticada (o deep-link abre uma rota protegida).
  usePushRegistration(isAuthenticated);
  usePushHandlers(isAuthenticated);

  const value = useMemo<AuthState & AuthActions>(
    () => ({
      user: meQuery.data ?? null,
      isLoading,
      isAuthenticated,
      signIn,
      register,
      signInWithGoogle,
      signOut,
    }),
    [meQuery.data, isLoading, isAuthenticated, signIn, register, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState & AuthActions {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
