import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { CareerSummary } from "@/components/players/career-summary";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useGetPlayerCareer } from "@/api/generated/hooks/playersHooks";

/**
 * Carreira de outro jogador — mesma composição (`CareerSummary`) de "Minha
 * carreira", mas read-only (sem ação de compartilhar) e alimentada só por
 * `getPlayerCareer` (autenticado; qualquer jogador logado pode ver a carreira
 * de qualquer outro — ver o comentário em `get-career.service.ts` no
 * backend). O nome vem via query param de quem navegou pra cá (roster do
 * grupo, participantes da pelada) — não há um "GET /players/:id" simples,
 * só `getMyPlayer` (o próprio) e este endpoint de carreira.
 */
export default function PlayerCareerScreen() {
  const { playerId, name } = useLocalSearchParams<{ playerId: string; name?: string }>();
  const router = useRouter();
  const { t } = useTranslation(["player", "common"]);

  const careerQuery = useGetPlayerCareer(playerId);

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader title={name || t("player:screen.loadingTitle")} onBack={() => router.back()} />

      {careerQuery.isPending ? (
        <View className="items-center gap-3">
          <Skeleton className="h-[380px] w-64 rounded-3xl" />
        </View>
      ) : null}

      {careerQuery.isError ? (
        <View className="items-center gap-3 py-6">
          <Text variant="muted" className="text-center">
            {t("player:screen.loadError")}
          </Text>
          <Button variant="secondary" onPress={() => void careerQuery.refetch()}>
            {t("common:actions.retry")}
          </Button>
        </View>
      ) : null}

      {careerQuery.data ? (
        <CareerSummary testID="player-career-summary" name={name ?? ""} career={careerQuery.data} />
      ) : null}
    </ScreenContainer>
  );
}
