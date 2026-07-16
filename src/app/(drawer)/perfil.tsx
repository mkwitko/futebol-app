import Constants from "expo-constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share, View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { AffinityPicker } from "@/components/players/affinity-picker";
import { CareerSummary } from "@/components/players/career-summary";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/auth/use-auth";
import { useUpdateMyPlayer } from "@/hooks/players/use-update-my-player";
import {
  type AffinityMap,
  affinityMapsEqual,
  toAffinityMap,
  toApiAffinity,
} from "@/lib/player/affinity";
import { buildPlayerProfileUrl } from "@/lib/player/url";
import {
  useGetMyPlayer,
  useGetPlayerCareer,
} from "@/api/generated/hooks/playersHooks";

/** Placeholder de carregamento do hero — imita o formato do `PlayerCard` `full`. */
function CareerHeroSkeleton() {
  return (
    <View className="items-center gap-3">
      <Skeleton className="h-[380px] w-64 rounded-3xl" />
    </View>
  );
}

/** Perfil — dados do usuário logado, a carreira real do jogador ("Minha carreira") e sair da conta. */
export default function PerfilScreen() {
  const { t } = useTranslation(["player", "common"]);
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const myPlayerQuery = useGetMyPlayer();
  const playerId = myPlayerQuery.data?.id;
  const careerQuery = useGetPlayerCareer(playerId);

  const updateMyPlayer = useUpdateMyPlayer();
  const savedAffinity = toAffinityMap(myPlayerQuery.data?.affinity);
  const [affinityDraft, setAffinityDraft] = useState<AffinityMap>({});
  // Re-seed the editable draft from the persisted value using React's
  // adjust-state-during-render pattern (no effect): when the server value's
  // identity changes (initial load, or refetch after a save), reset the draft.
  const [seededFrom, setSeededFrom] = useState<Record<string, number> | undefined>(undefined);
  if (myPlayerQuery.data?.affinity !== seededFrom) {
    setSeededFrom(myPlayerQuery.data?.affinity);
    setAffinityDraft(toAffinityMap(myPlayerQuery.data?.affinity));
  }
  const affinityDirty = !affinityMapsEqual(affinityDraft, savedAffinity);
  const saveAffinity = async () => {
    await updateMyPlayer.mutateAsync(toApiAffinity(affinityDraft));
  };

  const appVersion = Constants.expoConfig?.version ?? "—";

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      // Sucesso: `isAuthenticated` vira `false` e o guard no root layout
      // navega automaticamente para `(auth)`.
    } finally {
      setSigningOut(false);
    }
  };

  const handleShare = async () => {
    if (!playerId) return;
    const link = buildPlayerProfileUrl(playerId);
    await Share.share({ message: t("player:career.shareMessage", { link }) });
  };

  const isLoading =
    myPlayerQuery.isPending || (!!playerId && careerQuery.isPending);
  const isError = myPlayerQuery.isError || careerQuery.isError;
  const retry = () => {
    if (myPlayerQuery.isError) void myPlayerQuery.refetch();
    if (careerQuery.isError) void careerQuery.refetch();
  };

  return (
    <ScreenContainer className="gap-6">
      <View className="flex-row items-center gap-4">
        <Avatar name={user?.name ?? "?"} size="lg" />
        <View className="flex-1 gap-0.5">
          <Text variant="display" className="text-xl" numberOfLines={1}>
            {user?.name}
          </Text>
          <Text variant="muted" numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      <Divider />

      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("player:career.title")}
        </Text>

        {isLoading ? <CareerHeroSkeleton /> : null}

        {!isLoading && isError ? (
          <View className="items-center gap-3 py-6">
            <Text variant="muted" className="text-center">
              {t("player:career.loadError")}
            </Text>
            <Button variant="secondary" onPress={retry}>
              {t("common:actions.retry")}
            </Button>
          </View>
        ) : null}

        {!isLoading && !isError && careerQuery.data ? (
          <CareerSummary
            testID="my-career-summary"
            name={myPlayerQuery.data?.name ?? user?.name ?? ""}
            career={careerQuery.data}
            action={
              <Button
                testID="profile-share-cta"
                variant="secondary"
                onPress={() => void handleShare()}
              >
                {t("player:career.shareCta")}
              </Button>
            }
          />
        ) : null}
      </View>

      <Divider />

      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("player:positions.title")}
        </Text>
        <Text variant="muted" className="text-sm">
          {t("player:positions.hint")}
        </Text>
        <AffinityPicker
          value={affinityDraft}
          onChange={setAffinityDraft}
          overallByPosition={careerQuery.data?.overall}
          affinityLabel={t("player:positions.affinityLabel")}
          overallLabel={t("player:positions.overallLabel")}
        />
        <Button
          testID="profile-save-positions"
          onPress={() => void saveAffinity()}
          loading={updateMyPlayer.isPending}
          disabled={!affinityDirty}
        >
          {t("player:positions.save")}
        </Button>
      </View>

      <Divider />

      <View className="gap-3">
        <Button
          testID="profile-sign-out"
          variant="secondary"
          onPress={() => void handleSignOut()}
          loading={signingOut}
        >
          {t("common:actions.signOut")}
        </Button>
        <Text variant="muted" className="text-center text-xs">
          {t("common:profile.version", { version: appVersion })}
        </Text>
      </View>
    </ScreenContainer>
  );
}
