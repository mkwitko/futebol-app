import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { GroupFeeCard } from "@/components/groups/group-fee-card";
import { Sheet } from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";

export type GroupSettingsSheetProps = {
  visible: boolean;
  onClose: () => void;
  groupName?: string;
  monthlyFeeCents: number | null | undefined;
  onSaveFee: (monthlyFeeCents: number | null) => Promise<void>;
  savingFee?: boolean;
};

/**
 * Configurações do grupo (atalho ⚙ no hub) — nome (somente leitura: a API de
 * grupo ainda não aceita renomear, só `PATCH .../groups/:id { monthlyFeeCents }`)
 * + mensalidade padrão, reaproveitando o `GroupFeeCard` já existente.
 */
export function GroupSettingsSheet({
  visible,
  onClose,
  groupName,
  monthlyFeeCents,
  onSaveFee,
  savingFee = false,
}: GroupSettingsSheetProps) {
  const { t } = useTranslation("groups");

  return (
    <Sheet visible={visible} onClose={onClose} title={t("hub.settingsTitle")}>
      <View className="gap-5">
        <View className="gap-1">
          <Text className="font-body-medium text-sm text-muted">{t("hub.settingsNameLabel")}</Text>
          <Text className="font-body-semibold text-base text-ink">{groupName}</Text>
          <Text variant="muted" className="text-xs">
            {t("hub.settingsNameHint")}
          </Text>
        </View>

        <GroupFeeCard monthlyFeeCents={monthlyFeeCents} onSave={onSaveFee} saving={savingFee} />
      </View>
    </Sheet>
  );
}
