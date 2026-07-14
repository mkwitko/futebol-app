import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { useCreateInvite } from "@/hooks/invites/use-create-invite";
import { formatMatchDateTime } from "@/lib/datetime/format";
import { buildInviteUrl } from "@/lib/invite/url";
import type { GetMatch200 } from "@/api/generated/types/GetMatch";

export type InviteSheetProps = {
  visible: boolean;
  onClose: () => void;
  match: GetMatch200;
  onCopied: () => void;
  onError: () => void;
};

/**
 * Convidar para a pelada — cria o token de convite (`createInvite`), monta o
 * link público (`buildInviteUrl`) e abre o share sheet nativo com uma
 * mensagem pt-BR. "Copiar link" fica disponível assim que o link é gerado.
 */
export function InviteSheet({ visible, onClose, match, onCopied, onError }: InviteSheetProps) {
  const { t } = useTranslation("matches");
  const [link, setLink] = useState<string | null>(null);
  const createInvite = useCreateInvite(match.id);

  // O `Sheet` usa `Modal`, que só alterna a visibilidade (não desmonta os
  // filhos). Sem isto, reabrir o sheet mostraria o link antigo — limpamos o
  // estado ao fechar (qualquer via de fechamento passa por aqui) para forçar
  // um convite novo a cada abertura.
  const handleClose = () => {
    setLink(null);
    onClose();
  };

  const generateAndShare = async () => {
    try {
      const invite = await createInvite.mutateAsync();
      const url = buildInviteUrl(invite.sharePath);
      setLink(url);

      const [date, time] = formatMatchDateTime(match.datetime).split(" · ");
      await Share.share({
        message: t("detail.invite.message", { date, time, location: match.location, link: url }),
      });
    } catch {
      onError();
    }
  };

  const copyLink = async () => {
    if (!link) return;
    await Clipboard.setStringAsync(link);
    onCopied();
  };

  return (
    <Sheet visible={visible} onClose={handleClose} title={t("detail.invite.title")}>
      <View className="gap-4">
        <Text variant="muted">{t("detail.invite.description")}</Text>

        {link ? (
          <Text className="font-body text-sm text-ink" selectable>
            {link}
          </Text>
        ) : null}

        <Button testID="invite-share-cta" onPress={generateAndShare} loading={createInvite.isPending}>
          {t("detail.invite.shareCta")}
        </Button>

        {link ? (
          <Button testID="invite-copy-cta" variant="secondary" onPress={copyLink}>
            {t("detail.invite.copyCta")}
          </Button>
        ) : null}
      </View>
    </Sheet>
  );
}
