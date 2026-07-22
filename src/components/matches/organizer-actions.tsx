import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Sheet } from "@/components/ui/sheet";

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

/**
 * Ações do organizador — um único botão no rodapé abre um bottom sheet com
 * editar/convidar/encerrar/cancelar (em vez de empilhar todos os botões na
 * tela). Encerrar/cancelar fecham o sheet e pedem confirmação antes de agir.
 */
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<"finish" | "cancel" | null>(null);

  // Fecha o sheet antes de disparar a ação (evita empilhar Modal sobre Modal).
  const closeThen = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };
  const askConfirm = (which: "finish" | "cancel") => {
    setMenuOpen(false);
    setPending(which);
  };

  return (
    <View>
      <Button testID="match-actions-cta" onPress={() => setMenuOpen(true)}>
        {t("matches:detail.actions.title")}
      </Button>

      <Sheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={t("matches:detail.actions.title")}
      >
        <View className="gap-3">
          {canEdit ? (
            <Button testID="match-edit-cta" variant="secondary" onPress={() => closeThen(onEdit)}>
              {t("matches:detail.actions.editCta")}
            </Button>
          ) : null}
          <Button testID="match-invite-cta" onPress={() => closeThen(onInvite)}>
            {t("matches:detail.actions.inviteCta")}
          </Button>
          {canFinish ? (
            <Button
              testID="match-finish-cta"
              variant="secondary"
              onPress={() => askConfirm("finish")}
              loading={finishing}
            >
              {t("matches:detail.actions.finishCta")}
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              testID="match-cancel-cta"
              variant="danger"
              onPress={() => askConfirm("cancel")}
              loading={cancelling}
            >
              {t("matches:detail.actions.cancelCta")}
            </Button>
          ) : null}
        </View>
      </Sheet>

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
