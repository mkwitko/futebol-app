import { PermissionsAndroid, Platform } from "react-native";
import { env } from "@/env";

/**
 * Push (FCM via `@react-native-firebase/messaging`) fica ligado só quando
 * `EXPO_PUBLIC_PUSH_ENABLED=true` — igual ao gate do Google Sign-In. Sem isso
 * o app roda normalmente (Expo Go incluso): nada do Firebase é importado em
 * runtime (os `import()` dinâmicos abaixo nunca executam), então não quebra
 * onde o módulo nativo não existe. Habilitar exige os arquivos nativos do
 * Firebase (`google-services.json` / `GoogleService-Info.plist`) + build
 * nativo — ver `.env.example`.
 */
export const isPushConfigured = env.EXPO_PUBLIC_PUSH_ENABLED === "true";

/**
 * Android 13+ (API 33) exige pedir `POST_NOTIFICATIONS` explicitamente; em
 * versões antigas a permissão é implícita e o request vira no-op. iOS e outras
 * plataformas retornam `true` direto (a permissão de lá é pedida via
 * `requestPermission` do messaging).
 */
async function ensureAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  const perm = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  if (!perm) return true; // API < 33: constante ausente, permissão implícita.
  const result = await PermissionsAndroid.request(perm);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Pede permissão de notificação e retorna o FCM registration token do device
 * — é ele que o backend usa como destino no `getMessaging().send({ token })`
 * (via `PATCH /auth/me/push-token`). Retorna `null` (sem lançar) quando push
 * está desligado, a permissão é negada, ou o SDK falha — o chamador nunca
 * deve depender disso pra fluxo crítico.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!isPushConfigured) return null;

  try {
    const { getMessaging, requestPermission, getToken, AuthorizationStatus } = await import(
      "@react-native-firebase/messaging"
    );
    const messaging = getMessaging();

    if (!(await ensureAndroidPermission())) return null;

    const status = await requestPermission(messaging);
    const granted =
      status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
    if (!granted) return null;

    return await getToken(messaging);
  } catch (error) {
    console.warn("[push] falha ao registrar FCM token", error);
    return null;
  }
}

/**
 * Assina o refresh do FCM token (o Firebase rotaciona o token de tempos em
 * tempos). Retorna uma função de unsubscribe; quando push está desligado ou o
 * SDK falha, o unsubscribe é um no-op.
 */
export async function subscribeTokenRefresh(cb: (token: string) => void): Promise<() => void> {
  if (!isPushConfigured) return () => {};

  try {
    const { getMessaging, onTokenRefresh } = await import("@react-native-firebase/messaging");
    return onTokenRefresh(getMessaging(), cb);
  } catch (error) {
    console.warn("[push] falha ao assinar onTokenRefresh", error);
    return () => {};
  }
}
