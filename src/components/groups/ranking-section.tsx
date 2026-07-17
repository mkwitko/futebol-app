import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";
import { Avatar } from "@/components/ui/avatar";
import { Text } from "@/components/ui/text";
import type { GetGroupRanking200 } from "@/api/generated/types/GetGroupRanking";

type RankRow = GetGroupRanking200["goals"][number];

const MEDALS = ["🥇", "🥈", "🥉"];

function RankList({ title, rows }: { title: string; rows: readonly RankRow[] }) {
  const router = useRouter();
  const { t } = useTranslation("groups");

  return (
    <View className="gap-2">
      <Text variant="display" className="text-base">
        {title}
      </Text>
      {rows.length === 0 ? (
        <Text variant="muted" className="text-sm">
          {t("hub.rankingEmpty")}
        </Text>
      ) : (
        rows.map((r, i) => (
          <Pressable
            key={r.playerId}
            accessibilityRole="button"
            onPress={() => router.push(`/player/${r.playerId}`)}
            className="flex-row items-center gap-3 rounded-xl border border-line bg-surface-up p-2.5 active:opacity-70"
          >
            <Text className="w-6 text-center font-display text-sm text-muted">
              {MEDALS[i] ?? `${i + 1}º`}
            </Text>
            <Avatar name={r.name} uri={r.avatarUrl} size="sm" />
            <Text className="flex-1 font-body-semibold text-ink" numberOfLines={1}>
              {r.name}
            </Text>
            <Text className="font-display text-lg text-primary">{r.value}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

/** Ranking do grupo — 6 listas top-10 (pontuação primeiro). */
export function RankingSection({ ranking }: { ranking: GetGroupRanking200 }) {
  const { t } = useTranslation("groups");
  return (
    <View className="gap-5">
      <RankList title={t("hub.rankingPoints")} rows={ranking.points} />
      <RankList title={t("hub.rankingGoals")} rows={ranking.goals} />
      <RankList title={t("hub.rankingAssists")} rows={ranking.assists} />
      <RankList title={t("hub.rankingMvp")} rows={ranking.mvp} />
      <RankList title={t("hub.rankingPresence")} rows={ranking.presence} />
      <RankList title={t("hub.rankingCleanSheets")} rows={ranking.cleanSheets} />
    </View>
  );
}
