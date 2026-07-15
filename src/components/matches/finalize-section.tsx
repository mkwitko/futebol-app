import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { GetMatch200StatusEnumKey } from "@/api/generated/types/GetMatch";

export type FinalizeSectionProps = {
  status: GetMatch200StatusEnumKey;
  hasResult: boolean;
  onFinalize: () => void;
  finalizing: boolean;
  error?: string | null;
};

/**
 * Seção "Finalizar" — ação do organizador que fecha a votação e roda o motor
 * de carreira (atualiza o nível dos jogadores), transicionando a pelada para
 * `closed`. Só habilitada com `finished` + resultado já registrado
 * (`RES.NOT_FOUND`/`MTC.NOT_FINALIZABLE` no backend senão). Depois de
 * `closed`, vira um aviso — a ação não existe mais (nem re-finalizar).
 */
export function FinalizeSection({ status, hasResult, onFinalize, finalizing, error }: FinalizeSectionProps) {
  const { t } = useTranslation(["matches", "common"]);

  if (status === "closed") {
    return (
      <View className="gap-2 rounded-2xl border border-line bg-surface-up p-4">
        <Text className="font-body-semibold text-base text-ink">{t("detail.finalize.closedTitle")}</Text>
        <Text variant="muted">{t("detail.finalize.closedDescription")}</Text>
      </View>
    );
  }

  const canFinalize = hasResult;

  const confirmFinalize = () =>
    Alert.alert(t("detail.finalize.confirmTitle"), t("detail.finalize.confirmMessage"), [
      { text: t("common:actions.cancel"), style: "cancel" },
      { text: t("common:actions.confirm"), style: "destructive", onPress: onFinalize },
    ]);

  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
      <Text className="font-body-semibold text-base text-ink">{t("detail.finalize.title")}</Text>
      <Text variant="muted">{t("detail.finalize.description")}</Text>
      <Button
        testID="finalize-match-cta"
        variant="secondary"
        onPress={confirmFinalize}
        loading={finalizing}
        disabled={!canFinalize}
      >
        {finalizing ? t("detail.finalize.finalizing") : t("detail.finalize.cta")}
      </Button>
      {!canFinalize ? (
        <Text variant="muted" className="text-center text-xs">
          {t("detail.finalize.needsResult")}
        </Text>
      ) : null}
      {error ? (
        <Text className="text-center font-body text-sm text-danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
