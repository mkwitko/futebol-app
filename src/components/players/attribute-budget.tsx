import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import {
  ATTRIBUTE_CATEGORIES,
  ATTRIBUTE_MAX,
  ATTRIBUTE_MIN,
  type AttributeMap,
  CATEGORY_LABELS,
  CATEGORY_SUBS,
  remainingPoints,
  subLabel,
} from "@/lib/player/attributes";
import { categoryOverall } from "@/lib/player/rating";
import { colors } from "@/lib/theme";

export type AttributeBudgetProps = {
  value: AttributeMap;
  onChange: (next: AttributeMap) => void;
  /** Mostra a categoria "goleiro" (só faz sentido pra quem joga de goleiro). */
  showGoalkeeper?: boolean;
};

/**
 * Editor de atributos estilo FIFA: 35 sub-atributos em categorias. Cada
 * categoria mostra seu overall ao vivo; o topo mostra os pontos restantes
 * (total fixo = baseline + 20 de bônus). Aumentar é bloqueado quando não há
 * pontos disponíveis — baixe outro antes. A categoria "goleiro" só aparece
 * quando `showGoalkeeper`.
 */
export const AttributeBudget = memo(function AttributeBudget({
  value,
  onChange,
  showGoalkeeper = false,
}: AttributeBudgetProps) {
  const { t } = useTranslation("player");
  const remaining = remainingPoints(value);
  const categories = ATTRIBUTE_CATEGORIES.filter((c) => c !== "goleiro" || showGoalkeeper);

  const set = (key: string, next: number) => onChange({ ...value, [key]: next });

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

      {categories.map((category) => (
        <View key={category} className="gap-2 rounded-2xl border border-line bg-surface-up p-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-display text-base text-ink">{CATEGORY_LABELS[category]}</Text>
            <Text className="font-display text-lg text-primary">
              {categoryOverall(value, category)}
            </Text>
          </View>

          {CATEGORY_SUBS[category].map((key) => {
            const current = value[key] ?? ATTRIBUTE_MIN;
            const canDec = current > ATTRIBUTE_MIN;
            const canInc = current < ATTRIBUTE_MAX && remaining > 0;
            return (
              <View key={key} className="gap-1">
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 font-body-medium text-sm text-ink">{subLabel(key)}</Text>
                  <View className="flex-row items-center gap-3">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Diminuir ${subLabel(key)}`}
                      testID={`attr-${key}-decrement`}
                      disabled={!canDec}
                      onPress={() => set(key, current - 5)}
                      className={`h-8 w-8 items-center justify-center rounded-lg bg-surface active:opacity-70 ${canDec ? "" : "opacity-40"}`}
                    >
                      <Text className="font-display text-lg text-ink">–</Text>
                    </Pressable>
                    <Text className="min-w-[28px] text-center font-display text-lg text-ink">
                      {current}
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Aumentar ${subLabel(key)}`}
                      testID={`attr-${key}-increment`}
                      disabled={!canInc}
                      onPress={() => set(key, current + 5)}
                      className={`h-8 w-8 items-center justify-center rounded-lg bg-surface active:opacity-70 ${canInc ? "" : "opacity-40"}`}
                    >
                      <Text className="font-display text-lg text-ink">+</Text>
                    </Pressable>
                  </View>
                </View>
                <View className="h-1 overflow-hidden rounded-full bg-surface">
                  <View className="h-full rounded-full bg-primary" style={{ width: `${current}%` }} />
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
});
