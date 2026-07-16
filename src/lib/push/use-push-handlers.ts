import { useEffect } from "react";
import { isPushConfigured } from "./fcm";
import { displayNotification, navigateFromData } from "./notifications";

/**
 * Wire dos handlers de mensagem recebida, ativo só com sessão autenticada
 * (o deep-link abre uma rota protegida) e push ligado:
 *
 * - FOREGROUND (`onMessage`): o SO não exibe → mostramos via notifee.
 * - TAP em notificação exibida pelo SO em background→foreground
 *   (`onNotificationOpenedApp`) → deep-link.
 * - TAP na notificação exibida pelo notifee em foreground
 *   (`onForegroundEvent` PRESS) → deep-link.
 * - COLD START a partir de um tap com o app morto (`getInitialNotification`)
 *   → deep-link.
 *
 * O handler de BACKGROUND (`setBackgroundMessageHandler`) fica em
 * `background.ts` (registrado no load, fora do ciclo de componente).
 */
export function usePushHandlers(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || !isPushConfigured) return;

    let active = true;
    const unsubs: (() => void)[] = [];

    void (async () => {
      try {
        const messagingMod = await import("@react-native-firebase/messaging");
        const notifeeMod = await import("@notifee/react-native");
        const notifee = notifeeMod.default;
        const { EventType } = notifeeMod;
        const messaging = messagingMod.getMessaging();

        unsubs.push(
          messagingMod.onMessage(messaging, async (message) => {
            await displayNotification(message);
          }),
        );

        unsubs.push(
          messagingMod.onNotificationOpenedApp(messaging, (message) => {
            navigateFromData(message?.data);
          }),
        );

        unsubs.push(
          notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.PRESS) navigateFromData(detail.notification?.data);
          }),
        );

        // App aberto a partir de um estado morto por tap na notificação.
        const initial = await messagingMod.getInitialNotification(messaging);
        if (active && initial) navigateFromData(initial.data);

        // Efeito já limpo antes dos awaits resolverem → desassina na hora.
        if (!active) for (const unsub of unsubs) unsub();
      } catch (error) {
        console.warn("[push] falha ao registrar handlers", error);
      }
    })();

    return () => {
      active = false;
      for (const unsub of unsubs) unsub();
    };
  }, [enabled]);
}
