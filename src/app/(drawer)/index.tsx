import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { ProgressCard } from "@/components/home/progress-card";
import { UpcomingMatchCard } from "@/components/home/upcoming-match-card";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { QueryState } from "@/components/shared/query-state";
import {
  useGetMyPlayer,
  useGetMyUpcomingMatches,
  useGetPlayerCareer,
} from "@/api/generated/hooks/playersHooks";

/** Início — progresso do jogador + próximas partidas de todos os seus grupos. */
export default function HomeScreen() {
  const { t } = useTranslation("common");
  const router = useRouter();

  const myPlayer = useGetMyPlayer();
  const playerId = myPlayer.data?.id;
  const career = useGetPlayerCareer(playerId);
  const upcoming = useGetMyUpcomingMatches();

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader title={t("home.title")} subtitle={t("home.subtitle")} />

      {/* Progresso */}
      {career.isPending && playerId ? (
        <Skeleton className="h-36 w-full rounded-2xl" />
      ) : career.data ? (
        <ProgressCard career={career.data} />
      ) : null}

      {/* Próximas partidas */}
      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("home.upcomingTitle")}
        </Text>
        <QueryState
          isPending={upcoming.isPending}
          isError={upcoming.isError}
          isEmpty={(upcoming.data?.length ?? 0) === 0}
          errorMessage={t("home.upcomingLoadError")}
          retryLabel={t("actions.retry")}
          onRetry={() => void upcoming.refetch()}
          emptyTitle={t("home.upcomingEmptyTitle")}
          emptyDescription={t("home.upcomingEmptyDescription")}
        >
          <View className="gap-3">
            {(upcoming.data ?? []).map((match) => (
              <UpcomingMatchCard
                key={match.id}
                match={match}
                onPress={() =>
                  router.push({ pathname: "/match/[id]", params: { id: match.id } })
                }
              />
            ))}
          </View>
        </QueryState>
      </View>

      <Button variant="secondary" onPress={() => router.navigate("/grupos")}>
        {t("home.viewGroupsCta")}
      </Button>
    </ScreenContainer>
  );
}
