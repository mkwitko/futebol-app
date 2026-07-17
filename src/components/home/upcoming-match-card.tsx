import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { formatMatchDateTime } from "@/lib/datetime/format";
import type { GetMyUpcomingMatches200 } from "@/api/generated/types/GetMyUpcomingMatches";

export type UpcomingMatchCardProps = {
  match: GetMyUpcomingMatches200[number];
  onPress: () => void;
};

/** Linha de partida futura na home — data, local, grupo e status de presença. */
export function UpcomingMatchCard({ match, onPress }: UpcomingMatchCardProps) {
  const { t } = useTranslation("common");

  return (
    <Pressable accessibilityRole="button" onPress={onPress} className="active:opacity-80">
      <Card className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <Text variant="display" className="flex-1 text-lg" numberOfLines={1}>
            {formatMatchDateTime(match.datetime)}
          </Text>
          {match.attendanceStatus === "confirmed" ? (
            <Badge variant="primary">{t("home.attendanceConfirmed")}</Badge>
          ) : match.attendanceStatus === "waitlisted" ? (
            <Badge variant="line">{t("home.attendanceWaitlisted")}</Badge>
          ) : null}
        </View>
        <Text variant="muted" numberOfLines={1}>
          {match.location}
        </Text>
        <Text className="font-body-medium text-xs uppercase tracking-wide text-muted" numberOfLines={1}>
          {match.groupName}
        </Text>
      </Card>
    </Pressable>
  );
}
