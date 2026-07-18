import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { MatchHeroCard } from "@/components/home/match-hero-card";
import { ProgressCard } from "@/components/home/progress-card";
import { RecentAchievements } from "@/components/home/recent-achievements";
import { UpcomingMatchCard } from "@/components/home/upcoming-match-card";
import { PlayerTimeline } from "@/components/players/player-timeline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { QueryState } from "@/components/shared/query-state";
import { useAuth } from "@/hooks/auth/use-auth";
import {
  useGetMyPlayer,
  useGetMyUpcomingMatches,
  useGetPlayerCareer,
  useGetPlayerTimeline,
} from "@/api/generated/hooks/playersHooks";

/** Início — saudação, próxima partida, progresso, conquistas e atividade. */
export default function HomeScreen() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user } = useAuth();

  const myPlayer = useGetMyPlayer();
  const playerId = myPlayer.data?.id;
  const career = useGetPlayerCareer(playerId);
  const upcoming = useGetMyUpcomingMatches();
  const timeline = useGetPlayerTimeline(playerId);

  const fullName = myPlayer.data?.name ?? user?.name ?? "";
  const firstName = fullName.trim().split(/\s+/)[0] ?? "";
  const matches = upcoming.data ?? [];
  const [hero, ...rest] = matches;
  const recentEvents = (timeline.data?.events ?? []).slice(0, 5);

  // Quando há só a partida-destaque (hero), `rest` fica vazio e não há nada
  // pendente/erro/vazio a comunicar sobre "demais partidas" — omite a seção
  // inteira pra não mostrar um cabeçalho "Próximas partidas" sem conteúdo.
  const showUpcomingSection = upcoming.isPending || upcoming.isError || rest.length > 0 || matches.length === 0;

  return (
    <ScreenContainer
      className="gap-6"
      footer={
        <Button variant="secondary" onPress={() => router.navigate("/grupos")}>
          {t("home.viewGroupsCta")}
        </Button>
      }
    >
      {/* Saudação (o título "Início" já vem no header nativo do drawer) */}
      <View className="gap-1">
        <Text variant="display" className="text-2xl text-ink">
          {t("home.greeting", { name: firstName })}
        </Text>
        <Text variant="muted" className="text-sm">
          {t("home.subtitle")}
        </Text>
      </View>

      {/* Próxima partida — destaque */}
      {hero ? <MatchHeroCard match={hero} /> : null}

      {/* Progresso */}
      {career.isPending && playerId ? (
        <Skeleton className="h-36 w-full rounded-2xl" />
      ) : career.data ? (
        <ProgressCard career={career.data} />
      ) : null}

      {/* Demais partidas */}
      {showUpcomingSection ? (
        <View className="gap-3">
          <Text variant="display" className="text-lg">
            {t("home.upcomingTitle")}
          </Text>
          <QueryState
            isPending={upcoming.isPending}
            isError={upcoming.isError}
            isEmpty={matches.length === 0}
            errorMessage={t("home.upcomingLoadError")}
            retryLabel={t("actions.retry")}
            onRetry={() => void upcoming.refetch()}
            emptyTitle={t("home.upcomingEmptyTitle")}
            emptyDescription={t("home.upcomingEmptyDescription")}
          >
            <View className="gap-3">
              {rest.map((match) => (
                <UpcomingMatchCard
                  key={match.id}
                  match={match}
                  onPress={() => router.push({ pathname: "/match/[id]", params: { id: match.id } })}
                />
              ))}
            </View>
          </QueryState>
        </View>
      ) : null}

      {/* Conquistas */}
      <RecentAchievements achievements={career.data?.achievements ?? []} />

      {/* Atividade recente */}
      {recentEvents.length > 0 ? (
        <View className="gap-3">
          <Text variant="display" className="text-lg">
            {t("home.activityTitle")}
          </Text>
          <PlayerTimeline events={recentEvents} />
        </View>
      ) : null}
    </ScreenContainer>
  );
}
