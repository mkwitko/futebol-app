import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { bestPositionFromOverall } from "@/lib/player/career";
import { fieldPositionLabel } from "@/lib/player/position";
import { type Tier, tierLabel } from "@/lib/player/tier";
import type { GetPlayerCareer200 } from "@/api/generated/types/GetPlayerCareer";

export type ProgressCardProps = {
  career: GetPlayerCareer200;
};

/** Card compacto de progresso do jogador na home — nível, melhor overall e destaques. */
export function ProgressCard({ career }: ProgressCardProps) {
  const { t } = useTranslation("common");
  const best = bestPositionFromOverall(career.overall);
  const level = career.level as Tier;

  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-medium text-xs uppercase tracking-wide text-muted">
          {t("home.progressTitle")}
        </Text>
        <Badge variant={level}>{tierLabel(level)}</Badge>
      </View>

      <View className="flex-row items-end gap-4">
        <View>
          <Text variant="muted" className="text-xs uppercase tracking-wide">
            {t("home.overallLabel")}
          </Text>
          <Text variant="display" className="text-4xl text-ink">
            {best ? best.overall : "—"}
          </Text>
          {best ? (
            <Text variant="muted" className="text-xs">
              {fieldPositionLabel(best.position)}
            </Text>
          ) : null}
        </View>

        <View className="flex-1 flex-row justify-end gap-5">
          <Stat label={t("home.statMatches")} value={career.matchesPlayed} />
          <Stat label={t("home.statMvp")} value={career.mvpCount} />
          <Stat label={t("home.statStreak")} value={career.currentStreak} />
        </View>
      </View>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="items-center">
      <Text variant="display" className="text-2xl text-ink">
        {value}
      </Text>
      <Text variant="muted" className="text-xs uppercase tracking-wide">
        {label}
      </Text>
    </View>
  );
}
