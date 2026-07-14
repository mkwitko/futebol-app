import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

export type OrganizerActionsProps = {
  onInvite: () => void;
  onFinish: () => void;
  onCancel: () => void;
  finishing: boolean;
  cancelling: boolean;
  canFinish: boolean;
  canCancel: boolean;
};

/** Seção "Ações do organizador" — convidar, encerrar e cancelar (com confirmação nativa). */
export function OrganizerActions({
  onInvite,
  onFinish,
  onCancel,
  finishing,
  cancelling,
  canFinish,
  canCancel,
}: OrganizerActionsProps) {
  const { t } = useTranslation(["matches", "common"]);

  const confirmFinish = () =>
    Alert.alert(
      t("matches:detail.actions.finishConfirmTitle"),
      t("matches:detail.actions.finishConfirmMessage"),
      [
        { text: t("common:actions.cancel"), style: "cancel" },
        { text: t("common:actions.confirm"), style: "destructive", onPress: onFinish },
      ],
    );

  const confirmCancel = () =>
    Alert.alert(
      t("matches:detail.actions.cancelConfirmTitle"),
      t("matches:detail.actions.cancelConfirmMessage"),
      [
        { text: t("common:actions.cancel"), style: "cancel" },
        { text: t("common:actions.confirm"), style: "destructive", onPress: onCancel },
      ],
    );

  return (
    <View className="gap-3">
      <Text variant="display" className="text-lg">
        {t("matches:detail.actions.title")}
      </Text>
      <Button testID="match-invite-cta" onPress={onInvite}>
        {t("matches:detail.actions.inviteCta")}
      </Button>
      {canFinish ? (
        <Button testID="match-finish-cta" variant="secondary" onPress={confirmFinish} loading={finishing}>
          {t("matches:detail.actions.finishCta")}
        </Button>
      ) : null}
      {canCancel ? (
        <Button testID="match-cancel-cta" variant="danger" onPress={confirmCancel} loading={cancelling}>
          {t("matches:detail.actions.cancelCta")}
        </Button>
      ) : null}
    </View>
  );
}
