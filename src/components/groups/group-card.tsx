import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { formatMatchDateTime } from "@/lib/datetime/format";
import type { ListMyGroups200 } from "@/api/generated/types/ListMyGroups";

export type GroupCardProps = {
  group: ListMyGroups200[number];
  onPress: () => void;
};

/**
 * Card de grupo na lista "Peladas". `listMyGroups` agrega `memberCount` e
 * `nextMatch` (próxima pelada em aberto, ou `null`) por grupo — mostramos os
 * dois; sem próxima pelada marcada, um aviso discreto no lugar de um vazio.
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
            {t("list.memberCount", { count: group.memberCount })}
          </Text>
          <Text variant="muted" className="text-sm" numberOfLines={1}>
            {group.nextMatch
              ? t("list.nextMatch", {
                  date: formatMatchDateTime(group.nextMatch.datetime),
                  location: group.nextMatch.location,
                })
              : t("list.noNextMatch")}
          </Text>
        </View>
        <Text className="font-display text-2xl text-muted">›</Text>
      </Card>
    </Pressable>
  );
}
