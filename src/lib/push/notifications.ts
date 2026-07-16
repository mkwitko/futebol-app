import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import { router } from "expo-router";

/**
 * Camada de exibição/roteamento das notificações (notifee). Separada do
 * registro do token (`fcm.ts`) e dos handlers (`use-push-handlers.ts`). Todo
 * acesso ao notifee é via `import()` dinâmico — o módulo nativo só carrega
 * quando push está ligado e um handler realmente dispara (nunca no Expo Go).
 */

const CHANNEL_ID = "peladas";

/** Cria (idempotente) o canal Android exigido pra exibir notificação no 8+. */
async function ensureChannel(): Promise<string> {
  const notifee = (await import("@notifee/react-native")).default;
  await notifee.createChannel({ id: CHANNEL_ID, name: "Peladas" });
  return CHANNEL_ID;
}

/**
 * Exibe uma notificação a partir da mensagem FCM recebida em FOREGROUND — o
 * SO não mostra sozinho quando o app está aberto, então usamos o notifee. Em
 * background/quit o SO exibe a notificação automaticamente (bloco
 * `notification`), sem passar por aqui.
 */
export async function displayNotification(
  message: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const notifee = (await import("@notifee/react-native")).default;
  const channelId = await ensureChannel();

  await notifee.displayNotification({
    title: message.notification?.title ?? message.data?.title?.toString(),
    body: message.notification?.body ?? message.data?.body?.toString(),
    data: message.data,
    android: {
      channelId,
      // Mesmo drawable do meta-data FCM (plugins/with-notification-icon.js) —
      // silhueta branca; foreground e background batem visualmente.
      smallIcon: "notification_icon",
      color: "#21C776",
      // pressAction é necessário pra que o tap abra o app e dispare o PRESS.
      pressAction: { id: "default" },
    },
  });
}

/**
 * Deep-link a partir do `data` do push. Hoje só o tipo `waitlist_promoted`
 * (com `matchId`) → abre a tela da pelada. Silencioso quando não há matchId
 * (ou a rota exige auth e o guard ainda não liberou — o chamador só navega
 * com sessão autenticada).
 */
export function navigateFromData(data?: Record<string, string | object | number>): void {
  const matchId = data?.matchId;
  if (typeof matchId === "string" && matchId.length > 0) {
    router.push({ pathname: "/match/[id]", params: { id: matchId } });
  }
}
