import { useEffect } from "react";
import { useUpdateMyPushToken } from "@/api/generated/hooks/authHooks/useUpdateMyPushToken";
import { isPushConfigured, registerForPushNotifications, subscribeTokenRefresh } from "./fcm";

/**
 * Registra o device pra push assim que a sessão está autenticada: pega o FCM
 * token e manda pro backend (`PATCH /auth/me/push-token`), e reenvia sempre
 * que o Firebase rotacionar o token. No-op quando push está desligado
 * (`isPushConfigured === false`) ou quando não autenticado.
 *
 * O campo do payload ainda se chama `expoPushToken` (nome legado no schema do
 * endpoint) — hoje carrega o FCM token; é só uma string opaca pro backend.
 */
export function usePushRegistration(enabled: boolean): void {
  const { mutate } = useUpdateMyPushToken();

  useEffect(() => {
    if (!enabled || !isPushConfigured) return;

    let active = true;
    let unsubscribe = () => {};

    void registerForPushNotifications().then((token) => {
      if (!active || !token) return;
      mutate({ data: { expoPushToken: token } });
    });

    void subscribeTokenRefresh((token) => {
      mutate({ data: { expoPushToken: token } });
    }).then((fn) => {
      // Se o efeito já foi limpo antes do subscribe resolver, cancela na hora.
      if (active) unsubscribe = fn;
      else fn();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [enabled, mutate]);
}
