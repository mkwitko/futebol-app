import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { AchievementsGrid } from "@/components/players/achievements-grid";
import { CareerSummary } from "@/components/players/career-summary";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useGetPublicProfile } from "@/api/generated/hooks/playersHooks";
import { publicProfileToCareer } from "@/lib/player/public-profile";

/**
 * Landing do link compartilhável `/j/:slug` (universal link / app link — ver
 * `associatedDomains`/`intentFilters` em `app.config.ts`) quando o app já
 * está instalado: o SO entrega essa rota direto pro Expo Router, sem passar
 * pelo shell HTML que o backend serve pra navegador/crawler
 * (`share.controller.ts` + `landing.ts`, Fase 1).
 *
 * Usa `getPublicProfile` — a ÚNICA rota de perfil que aceita visitante sem
 * login E resolve `slug` (`player/[playerId].tsx` usa `getPlayerCareer`,
 * autenticada e uuid-only; não serve aqui). Por isso essa tela é registrada
 * FORA de qualquer `Stack.Protected` em `_layout.tsx` — precisa abrir
 * independente do jogador estar logado.
 */
export default function SharedProfileScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { t } = useTranslation(["player", "common"]);

  const profileQuery = useGetPublicProfile(slug);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader title={profileQuery.data?.name ?? t("player:screen.loadingTitle")} onBack={handleBack} />

      {profileQuery.isPending ? (
        <View className="items-center gap-3">
          <Skeleton className="h-[380px] w-64 rounded-3xl" />
        </View>
      ) : null}

      {profileQuery.isError ? (
        <View className="items-center gap-3 py-6">
          <Text variant="muted" className="text-center">
            {t("player:screen.loadError")}
          </Text>
          <Button variant="secondary" onPress={() => void profileQuery.refetch()}>
            {t("common:actions.retry")}
          </Button>
        </View>
      ) : null}

      {profileQuery.data ? (
        <>
          <CareerSummary
            testID="shared-profile-summary"
            name={profileQuery.data.name}
            career={publicProfileToCareer(profileQuery.data)}
          />
          <AchievementsGrid
            achievements={profileQuery.data.achievements ?? []}
            title={t("player:achievements.title")}
          />
        </>
      ) : null}
    </ScreenContainer>
  );
}
