import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_MAX,
  ATTRIBUTE_MIN,
  type AttributeKey,
  type AttributeMap,
  remainingPoints,
} from "@/lib/player/attributes";
import { colors } from "@/lib/theme";

export type AttributeBudgetProps = {
  value: AttributeMap;
  onChange: (next: AttributeMap) => void;
};

/**
 * Orçamento de atributos: todos começam em 50, o jogador redistribui os pontos
 * mantendo o total fixo. Aumentar é BLOQUEADO quando não há pontos disponíveis
 * (indicador "restam 0") — é preciso baixar outro atributo antes.
 */
export function AttributeBudget({ value, onChange }: AttributeBudgetProps) {
  const { t } = useTranslation("player");
  const remaining = remainingPoints(value);

  const set = (key: AttributeKey, next: number) => {
    onChange({ ...value, [key]: next });
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-semibold text-sm text-ink">{t("attributes.pointsLabel")}</Text>
        <Text
          className="font-display text-sm"
          style={{ color: remaining > 0 ? colors.primary : colors.muted }}
        >
          {t("attributes.pointsRemaining", { count: remaining })}
        </Text>
      </View>

      {ATTRIBUTE_KEYS.map((key) => {
        const current = value[key];
        const canDec = current > ATTRIBUTE_MIN;
        const canInc = current < ATTRIBUTE_MAX && remaining > 0;
        return (
          <View key={key} className="gap-1.5 rounded-2xl border border-line bg-surface-up p-3">
            <View className="flex-row items-center justify-between">
              <Text className="font-body-semibold text-sm text-ink">{ATTRIBUTE_LABELS[key]}</Text>
              <View className="flex-row items-center gap-3">
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Diminuir ${ATTRIBUTE_LABELS[key]}`}
                  testID={`attr-${key}-decrement`}
                  disabled={!canDec}
                  onPress={() => set(key, current - 5)}
                  className={`h-9 w-9 items-center justify-center rounded-lg bg-surface active:opacity-70 ${
                    canDec ? "" : "opacity-40"
                  }`}
                >
                  <Text className="font-display text-lg text-ink">–</Text>
                </Pressable>
                <Text className="min-w-[32px] text-center font-display text-xl text-ink">
                  {current}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Aumentar ${ATTRIBUTE_LABELS[key]}`}
                  testID={`attr-${key}-increment`}
                  disabled={!canInc}
                  onPress={() => set(key, current + 5)}
                  className={`h-9 w-9 items-center justify-center rounded-lg bg-surface active:opacity-70 ${
                    canInc ? "" : "opacity-40"
                  }`}
                >
                  <Text className="font-display text-lg text-ink">+</Text>
                </Pressable>
              </View>
            </View>
            {/* Barra de progresso 0-100 */}
            <View className="h-1.5 overflow-hidden rounded-full bg-surface">
              <View
                className="h-full rounded-full bg-primary"
                style={{ width: `${current}%` }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
