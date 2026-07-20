import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import type { ShareSubject } from "@/lib/player/url";
import { shareImage, shareLink } from "@/lib/share/share";

export type ShareSheetProps = {
  visible: boolean;
  onClose: () => void;
  slug: string;
  subject: ShareSubject;
  message: string;
};

/**
 * Bottom sheet de compartilhamento — duas ações (link inteligente `/j/:slug`
 * ou imagem PNG baixada/entregue pro share sheet nativo). Usado nos três
 * pontos de entrada da Fase 3 Tarefa 2: carta (perfil), ranking (posição do
 * próprio jogador) e conquista desbloqueada.
 */
export function ShareSheet({ visible, onClose, slug, subject, message }: ShareSheetProps) {
  const { t } = useTranslation("common");
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
      onClose();
    } catch {
      toast.show(t("share.error"), "danger");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t("share.title")}>
      <Button onPress={() => void run(() => shareLink(slug, subject, message))} loading={busy}>
        {t("share.link")}
      </Button>
      <Button
        variant="secondary"
        onPress={() => void run(() => shareImage(slug, subject))}
        loading={busy}
      >
        {t("share.image")}
      </Button>
      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}
    </Sheet>
  );
}
