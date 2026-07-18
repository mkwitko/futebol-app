import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { formatTime } from "@/lib/datetime/format";

export type PixVoucherProps = {
  qrCodeImageUrl: string;
  copyPaste: string;
  expiresAt: string;
  onCopied: () => void;
};

/**
 * Voucher PIX pra pagar uma reserva `instant`/`deposit` — QR (`expo-image`),
 * código copia-e-cola (copiável via `expo-clipboard`) e o horário de
 * expiração. Puramente apresentacional: quem chama decide o que fazer depois
 * de copiar (`onCopied`, tipicamente um toast) e como detectar a confirmação
 * do pagamento (polling fica na tela, não aqui).
 */
export function PixVoucher({ qrCodeImageUrl, copyPaste, expiresAt, onCopied }: PixVoucherProps) {
  const { t } = useTranslation("booking");

  async function copyCode() {
    await Clipboard.setStringAsync(copyPaste);
    onCopied();
  }

  return (
    <View className="items-center gap-4" testID="pix-voucher">
      <Image
        source={{ uri: qrCodeImageUrl }}
        accessibilityLabel={t("reserve.pix.qrLabel")}
        contentFit="contain"
        transition={150}
        className="h-56 w-56 rounded-2xl bg-surface-up"
        testID="pix-qr-image"
      />

      <Text variant="muted" className="text-sm">
        {t("reserve.pix.expiresAt", { time: formatTime(expiresAt) })}
      </Text>

      <View className="w-full gap-2 rounded-2xl border border-line bg-surface-up p-4">
        <Text className="font-body-medium text-xs uppercase tracking-wide text-muted">
          {t("reserve.pix.copyPasteLabel")}
        </Text>
        <Text className="font-body text-xs text-ink" numberOfLines={3} selectable>
          {copyPaste}
        </Text>
      </View>

      <Button
        testID="pix-copy-cta"
        variant="secondary"
        onPress={() => void copyCode()}
        className="self-stretch"
      >
        {t("reserve.pix.copyCta")}
      </Button>
    </View>
  );
}
