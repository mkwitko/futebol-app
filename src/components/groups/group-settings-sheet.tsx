import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Switch, View } from "react-native";
import { GroupFeeCard } from "@/components/groups/group-fee-card";
import { FeatureGate } from "@/components/billing/feature-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import { useCreateGroupSubaccount } from "@/hooks/groups/use-create-group-subaccount";
import { usePaymentsEnabled } from "@/hooks/payments/use-payments-config";
import { colors } from "@/lib/theme";
import type { UpdateGroupMutationRequestJoinPolicyEnumKey } from "@/api/generated/types/UpdateGroup";

export type JoinPolicy = UpdateGroupMutationRequestJoinPolicyEnumKey;

export type GroupSettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
  groupName?: string;
  monthlyFeeCents: number | null | undefined;
  onSaveFee: (monthlyFeeCents: number | null) => Promise<void>;
  savingFee?: boolean;
  /** Só o dono do grupo vê a seção de descoberta pública. */
  isOwner?: boolean;
  isPublic?: boolean;
  joinPolicy?: JoinPolicy;
  onSavePublic?: (next: { isPublic?: boolean; joinPolicy?: JoinPolicy }) => Promise<void>;
  savingPublic?: boolean;
  /**
   * Id do grupo — necessário só pro onboarding da chave PIX (Task 11), que
   * chama `useCreateGroupSubaccount` internamente. Sem ele (ou sem
   * `usePaymentsEnabled()`), a seção de PIX não aparece.
   */
  groupId?: string;
  /** Chave PIX já cadastrada como sub-conta Woovi do grupo (`Group.wooviPixKey`), se houver. */
  wooviPixKey?: string | null;
};

/**
 * Configurações do grupo (atalho ⚙ no hub) — nome (somente leitura: a API de
 * grupo ainda não aceita renomear) + mensalidade padrão + descoberta pública.
 * A seção pública (toggle "Grupo público" + política de entrada) só aparece
 * pro dono e é gated por `public_groups` via `FeatureGate` (sem a feature →
 * CTA de upgrade; conta revisora → escondida).
 */
export function GroupSettingsSheet({
  visible,
  onClose,
  groupName,
  monthlyFeeCents,
  onSaveFee,
  savingFee = false,
  isOwner = false,
  isPublic = false,
  joinPolicy = "open",
  onSavePublic,
  savingPublic = false,
  groupId,
  wooviPixKey,
}: GroupSettingsSheetProps) {
  const { t } = useTranslation("groups");
  const paymentsEnabled = usePaymentsEnabled();
  const toast = useToast();
  const createSubaccount = useCreateGroupSubaccount(groupId ?? "");
  const [pixKeyInput, setPixKeyInput] = useState(wooviPixKey ?? "");

  const handleSavePixKey = async () => {
    if (!groupId) return;
    try {
      await createSubaccount.mutateAsync({ pixKey: pixKeyInput });
      toast.show(t("hub.settingsWooviSaveSuccess"));
    } catch {
      toast.show(t("hub.settingsWooviSaveError"), "danger");
    }
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t("hub.settingsTitle")}>
      <View className="gap-5">
        {toast.message ? (
          <Toast variant={toast.variant} onDismiss={toast.dismiss}>
            {toast.message}
          </Toast>
        ) : null}

        <View className="gap-1">
          <Text className="font-body-medium text-sm text-muted">{t("hub.settingsNameLabel")}</Text>
          <Text className="font-body-semibold text-base text-ink">{groupName}</Text>
          <Text variant="muted" className="text-xs">
            {t("hub.settingsNameHint")}
          </Text>
        </View>

        <GroupFeeCard monthlyFeeCents={monthlyFeeCents} onSave={onSaveFee} saving={savingFee} />

        {isOwner && paymentsEnabled && groupId ? (
          <View className="gap-2 rounded-2xl border border-line bg-surface p-4" testID="group-woovi-settings">
            <Text variant="display" className="text-base">
              {t("hub.settingsWooviTitle")}
            </Text>
            <Input
              testID="group-woovi-pixkey"
              label={t("hub.settingsWooviLabel")}
              placeholder={t("hub.settingsWooviPlaceholder")}
              helperText={t("hub.settingsWooviHint")}
              autoCapitalize="none"
              value={pixKeyInput}
              onChangeText={setPixKeyInput}
            />
            <Button
              testID="group-woovi-pixkey-save"
              size="sm"
              onPress={() => void handleSavePixKey()}
              loading={createSubaccount.isPending}
              disabled={!pixKeyInput.trim()}
            >
              {t("hub.settingsWooviSaveCta")}
            </Button>
          </View>
        ) : null}

        {isOwner ? (
          <FeatureGate feature="public_groups">
            <View className="gap-3 rounded-2xl border border-line bg-surface p-4" testID="group-public-settings">
              <Text variant="display" className="text-base">
                {t("hub.settingsPublicTitle")}
              </Text>

              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 gap-1">
                  <Text className="font-body-semibold text-sm text-ink">
                    {t("hub.settingsPublicToggleLabel")}
                  </Text>
                  <Text variant="muted" className="text-xs">
                    {t("hub.settingsPublicToggleHint")}
                  </Text>
                </View>
                <Switch
                  value={isPublic}
                  disabled={savingPublic}
                  onValueChange={(next) => void onSavePublic?.({ isPublic: next })}
                  trackColor={{ true: colors.primary, false: colors.line }}
                  testID="group-public-toggle"
                />
              </View>

              {isPublic ? (
                <View className="gap-2">
                  <Text className="font-body-medium text-sm text-muted">
                    {t("hub.settingsJoinPolicyLabel")}
                  </Text>
                  <SegmentedControl<JoinPolicy>
                    value={joinPolicy}
                    onChange={(next) => void onSavePublic?.({ joinPolicy: next })}
                    options={[
                      { label: t("hub.settingsJoinPolicyOpen"), value: "open" },
                      { label: t("hub.settingsJoinPolicyRequest"), value: "request" },
                    ]}
                  />
                </View>
              ) : null}
            </View>
          </FeatureGate>
        ) : null}
      </View>
    </Sheet>
  );
}
