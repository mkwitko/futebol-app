import { isPushConfigured } from "./fcm";

/**
 * Handler de mensagem em BACKGROUND/quit — registrado no load do módulo (fora
 * do ciclo de componente, como o RNFirebase exige). Importado por seu
 * side-effect no root layout.
 *
 * As mensagens que enviamos trazem o bloco `notification`, então o SO já exibe
 * a notificação sozinho em background/quit — este handler não deve exibir nada
 * (senão duplicaria). Ele existe pra (a) o RNFirebase não avisar que falta um
 * handler e (b) hospedar processamento futuro de mensagens data-only.
 */
if (isPushConfigured) {
  void (async () => {
    try {
      const { getMessaging, setBackgroundMessageHandler } = await import(
        "@react-native-firebase/messaging"
      );
      setBackgroundMessageHandler(getMessaging(), async () => {
        // no-op: SO exibe a notificação; nada a fazer aqui por enquanto.
      });
    } catch (error) {
      console.warn("[push] falha ao registrar background handler", error);
    }
  })();
}
