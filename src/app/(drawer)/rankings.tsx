import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/layout/screen-container";
import { QueryState } from "@/components/shared/query-state";
import { Text } from "@/components/ui/text";
import { RankingSection } from "@/components/groups/ranking-section";
import type { GetGroupRanking200 } from "@/api/generated/types/GetGroupRanking";
import { useGetGlobalRanking } from "@/api/generated/hooks/rankingsHooks";

/** Ranking global (all-time, todas as peladas). Cidade/região virá com geo. */
export default function RankingsScreen() {
  const { t } = useTranslation(["player", "groups", "common"]);
  const query = useGetGlobalRanking();

  return (
    <ScreenContainer className="gap-4">
      <Text variant="display" className="text-2xl">
        {t("player:rankings.globalTitle")}
      </Text>
      <Text variant="muted" className="text-sm">
        {t("player:rankings.globalHint")}
      </Text>

      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        isEmpty={!!query.data && query.data.points.length === 0}
        errorMessage={t("groups:hub.rankingLoadError")}
        retryLabel={t("common:actions.retry")}
        onRetry={() => void query.refetch()}
        emptyTitle={t("groups:hub.rankingEmptyTitle")}
        emptyDescription={t("groups:hub.rankingEmptyDescription")}
      >
        {query.data ? <RankingSection ranking={query.data as GetGroupRanking200} /> : null}
      </QueryState>
    </ScreenContainer>
  );
}
