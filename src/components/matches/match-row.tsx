import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { ListRow } from "@/components/ui/list-row";
import { formatMatchDateTime } from "@/lib/datetime/format";
import type { ListMatches200, ListMatches200StatusEnumKey } from "@/api/generated/types/ListMatches";

export type MatchRowProps = {
  match: ListMatches200[number];
  onPress: () => void;
};

const STATUS_BADGE_VARIANT: Record<ListMatches200StatusEnumKey, BadgeVariant> = {
  open: "primary",
  full: "neutral",
  closed: "neutral",
  finished: "line",
  cancelled: "danger",
};

/**
 * Linha compacta de pelada — data/hora, local e status. Abre o detalhe.
 * `match.seriesId` presente (Task 7, hub do grupo) → mostra o badge
 * "Recorrente", marcando ocorrências geradas por uma série.
 */
export function MatchRow({ match, onPress }: MatchRowProps) {
  const { t } = useTranslation("groups");

  return (
    <ListRow
      title={formatMatchDateTime(match.datetime)}
      subtitle={match.location}
      onPress={onPress}
      trailing={
        <View className="flex-row items-center gap-2">
          {match.seriesId ? <Badge variant="line">{t("hub.recurringBadge")}</Badge> : null}
          <Badge variant={STATUS_BADGE_VARIANT[match.status]}>{t(`detail.status.${match.status}`)}</Badge>
        </View>
      }
    />
  );
}
