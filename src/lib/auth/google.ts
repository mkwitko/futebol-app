import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { env } from "@/env";

/**
 * Login com Google fica ligado só quando os client IDs OAuth foram
 * configurados (ver `.env.example`) — sem eles, o app roda normalmente
 * (Expo Go incluso) e o botão em `google-sign-in-button.tsx` mostra
 * "em breve" em vez de tentar o fluxo nativo.
 */
export const isGoogleSignInConfigured = Boolean(env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
  });
  configured = true;
}

/** Usuário cancelou o fluxo nativo (voltou sem escolher conta) — não é um erro de verdade. */
export class GoogleSignInCancelledError extends Error {
  constructor() {
    super("google_sign_in_cancelled");
    this.name = "GoogleSignInCancelledError";
  }
}

/**
 * Roda o fluxo nativo do Google Sign-In e retorna o `idToken` do usuário —
 * é esse token que o `useAuth().signInWithGoogle` troca pelo par de tokens
 * do próprio backend via `POST /auth/login-google`. Exige um build nativo
 * (`expo prebuild` + dev client); nunca roda no Expo Go.
 */
export async function signInWithGoogleNative(): Promise<string> {
  ensureConfigured();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) throw new GoogleSignInCancelledError();
    if (!response.data.idToken) throw new Error("google_sign_in_missing_id_token");

    return response.data.idToken;
  } catch (error) {
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new GoogleSignInCancelledError();
    }
    throw error;
  }
}
