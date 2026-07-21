import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Text } from "@/components/ui/text";

export type OrganizerActionsProps = {
  onInvite: () => void;
  onEdit: () => void;
  onFinish: () => void;
  onCancel: () => void;
  finishing: boolean;
  cancelling: boolean;
  canEdit: boolean;
  canFinish: boolean;
  canCancel: boolean;
};

/** Seção "Ações do organizador" — editar, convidar, encerrar e cancelar (com confirmação nativa). */
export function OrganizerActions({
  onInvite,
  onEdit,
  onFinish,
  onCancel,
  finishing,
  cancelling,
  canEdit,
  canFinish,
  canCancel,
}: OrganizerActionsProps) {
  const { t } = useTranslation(["matches", "common"]);
  const [pending, setPending] = useState<"finish" | "cancel" | null>(null);

  return (
    <View className="gap-3">
      <Text variant="display" className="text-lg">
        {t("matches:detail.actions.title")}
      </Text>
      {canEdit ? (
        <Button testID="match-edit-cta" variant="secondary" onPress={onEdit}>
          {t("matches:detail.actions.editCta")}
        </Button>
      ) : null}
      <Button testID="match-invite-cta" onPress={onInvite}>
        {t("matches:detail.actions.inviteCta")}
      </Button>
      {canFinish ? (
        <Button testID="match-finish-cta" variant="secondary" onPress={() => setPending("finish")} loading={finishing}>
          {t("matches:detail.actions.finishCta")}
        </Button>
      ) : null}
      {canCancel ? (
        <Button testID="match-cancel-cta" variant="danger" onPress={() => setPending("cancel")} loading={cancelling}>
          {t("matches:detail.actions.cancelCta")}
        </Button>
      ) : null}

      <ConfirmDialog
        visible={pending === "finish"}
        title={t("matches:detail.actions.finishConfirmTitle")}
        message={t("matches:detail.actions.finishConfirmMessage")}
        confirmLabel={t("common:actions.confirm")}
        cancelLabel={t("common:actions.cancel")}
        destructive
        onConfirm={() => {
          setPending(null);
          onFinish();
        }}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        visible={pending === "cancel"}
        title={t("matches:detail.actions.cancelConfirmTitle")}
        message={t("matches:detail.actions.cancelConfirmMessage")}
        confirmLabel={t("common:actions.confirm")}
        cancelLabel={t("common:actions.cancel")}
        destructive
        onConfirm={() => {
          setPending(null);
          onCancel();
        }}
        onCancel={() => setPending(null)}
      />
    </View>
  );
}
