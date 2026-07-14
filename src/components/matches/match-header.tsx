import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { formatMatchDateTime } from "@/lib/datetime/format";
import { formatCentsToBRL } from "@/lib/money";
import type { GetMatch200, GetMatch200StatusEnumKey } from "@/api/generated/types/GetMatch";

export type MatchHeaderProps = {
  match: GetMatch200;
  confirmedCount: number;
};

const STATUS_BADGE_VARIANT: Record<GetMatch200StatusEnumKey, BadgeVariant> = {
  open: "primary",
  full: "neutral",
  closed: "neutral",
  finished: "line",
  cancelled: "danger",
};

/** Cabeçalho de conteúdo da pelada — data/hora, local, status, preço e vagas confirmadas. */
export function MatchHeader({ match, confirmedCount }: MatchHeaderProps) {
  const { t } = useTranslation("matches");

  return (
    <View className="gap-2 rounded-2xl border border-line bg-surface p-4">
      <View className="flex-row items-start justify-between gap-3">
        <Text variant="display" className="flex-1 text-2xl">
          {formatMatchDateTime(match.datetime)}
        </Text>
        <Badge variant={STATUS_BADGE_VARIANT[match.status]}>{t(`detail.status.${match.status}`)}</Badge>
      </View>
      <Text variant="muted">{match.location}</Text>
      <View className="flex-row items-center justify-between pt-1">
        <Text className="font-body-semibold text-base text-ink">
          {match.priceCents ? formatCentsToBRL(match.priceCents) : t("detail.freeMatch")}
        </Text>
        <Text variant="muted" className="text-sm">
          {t("detail.slotsConfirmed", { confirmed: confirmedCount, slots: match.slots })}
        </Text>
      </View>
    </View>
  );
}
