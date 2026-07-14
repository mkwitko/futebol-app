import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { formatShortDate } from "@/lib/datetime/format";
import type { ListMyGroups200 } from "@/api/generated/types/ListMyGroups";

export type GroupCardProps = {
  group: ListMyGroups200[number];
  onPress: () => void;
};

/**
 * Card de grupo na lista "Peladas". `listMyGroups` não traz contagem de
 * membros nem próxima partida (a API não agrega isso ainda) — mostramos só o
 * que é real (nome + data de criação) em vez de inventar um placeholder "0
 * jogadores". Quando a API agregar esses campos, este card é o lugar certo
 * para exibi-los.
 */
export function GroupCard({ group, onPress }: GroupCardProps) {
  const { t } = useTranslation("groups");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={group.name}
      onPress={onPress}
      className="active:opacity-90"
    >
      <Card className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text variant="display" className="text-lg" numberOfLines={1}>
            {group.name}
          </Text>
          <Text variant="muted" className="text-sm">
            {t("list.createdAt", { date: formatShortDate(group.createdAt) })}
          </Text>
        </View>
        <Text className="font-display text-2xl text-muted">›</Text>
      </Card>
    </Pressable>
  );
}
