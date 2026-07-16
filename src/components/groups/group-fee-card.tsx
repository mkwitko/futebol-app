import { useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { centsToReaisInput, formatCentsToBRL, reaisInputToCents } from "@/lib/money";

export type GroupFeeCardProps = {
  monthlyFeeCents: number | null | undefined;
  onSave: (monthlyFeeCents: number | null) => Promise<void>;
  saving?: boolean;
};

/**
 * Card "Mensalidade padrão" — affordance de edição de `monthlyFeeCents`,
 * hoje embutido no `GroupSettingsSheet` (⚙ do hub do grupo, Task 7).
 * Edição inline (sem `Sheet`/RHF): é um único campo de dinheiro, então o
 * estado local (`editing`/`input`) já resolve sem a cerimônia de um form.
 * Campo vazio ao salvar → `monthlyFeeCents: null` (sem mensalidade padrão).
 */
export function GroupFeeCard({ monthlyFeeCents, onSave, saving = false }: GroupFeeCardProps) {
  const { t } = useTranslation("groups");
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startEditing = () => {
    setInput(centsToReaisInput(monthlyFeeCents));
    setError(null);
    setEditing(true);
  };

  const handleSave = async () => {
    setError(null);
    try {
      await onSave(reaisInputToCents(input) ?? null);
      setEditing(false);
    } catch {
      setError(t("detail.feeCardSaveError"));
    }
  };

  return (
    <Card className="gap-3">
      <Text className="font-body-medium text-sm text-muted">{t("detail.feeCardTitle")}</Text>

      {editing ? (
        <View className="gap-3">
          <Input
            label={t("detail.feeCardTitle")}
            placeholder={t("detail.feeCardPlaceholder")}
            helperText={t("detail.feeCardHint")}
            keyboardType="decimal-pad"
            value={input}
            onChangeText={setInput}
            autoFocus
          />
          {error ? (
            <Text className="font-body text-sm text-danger" accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
          <View className="flex-row gap-2">
            <Button
              testID="group-fee-save-cta"
              size="sm"
              onPress={() => void handleSave()}
              loading={saving}
            >
              {saving ? t("detail.feeCardSaving") : t("detail.feeCardSaveCta")}
            </Button>
            <Button size="sm" variant="secondary" onPress={() => setEditing(false)} disabled={saving}>
              {t("detail.feeCardCancelCta")}
            </Button>
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between">
          <Text className="font-display text-xl text-ink">
            {monthlyFeeCents != null ? formatCentsToBRL(monthlyFeeCents) : t("detail.feeCardEmpty")}
          </Text>
          <Button testID="group-fee-edit-cta" size="sm" variant="secondary" onPress={startEditing}>
            {t("detail.feeCardEditCta")}
          </Button>
        </View>
      )}
    </Card>
  );
}
