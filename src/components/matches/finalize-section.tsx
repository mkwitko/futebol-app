import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [confirmVisible, setConfirmVisible] = useState(false);

  if (status === "closed") {
    return (
      <View className="gap-2 rounded-2xl border border-line bg-surface-up p-4">
        <Text className="font-body-semibold text-base text-ink">{t("detail.finalize.closedTitle")}</Text>
        <Text variant="muted">{t("detail.finalize.closedDescription")}</Text>
      </View>
    );
  }

  const canFinalize = hasResult;

  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-4">
      <Text className="font-body-semibold text-base text-ink">{t("detail.finalize.title")}</Text>
      <Text variant="muted">{t("detail.finalize.description")}</Text>
      <Button
        testID="finalize-match-cta"
        variant="secondary"
        onPress={() => setConfirmVisible(true)}
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

      <ConfirmDialog
        visible={confirmVisible}
        title={t("detail.finalize.confirmTitle")}
        message={t("detail.finalize.confirmMessage")}
        confirmLabel={t("common:actions.confirm")}
        cancelLabel={t("common:actions.cancel")}
        destructive
        onConfirm={() => {
          setConfirmVisible(false);
          onFinalize();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}
