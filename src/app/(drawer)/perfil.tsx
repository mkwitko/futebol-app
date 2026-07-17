import Constants from "expo-constants";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Share, View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { AttributeBudget } from "@/components/players/attribute-budget";
import { FifaCard } from "@/components/players/fifa-card";
import { PitchAffinity } from "@/components/players/pitch-affinity";
import { SkillPicker } from "@/components/players/skill-picker";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/hooks/auth/use-auth";
import { useAvatarUpload } from "@/hooks/players/use-avatar-upload";
import { useUpdateMyPlayer } from "@/hooks/players/use-update-my-player";
import {
  type AffinityMap,
  affinityMapsEqual,
  toAffinityMap,
  toApiAffinity,
} from "@/lib/player/affinity";
import {
  ATTRIBUTE_KEYS,
  type AttributeMap,
  remainingPoints,
  toAttributeMap,
} from "@/lib/player/attributes";
import { isGoalkeeper } from "@/lib/player/position";
import { type SkillKey, skillsEqual, toSkillList } from "@/lib/player/skills";
import { buildPlayerProfileUrl } from "@/lib/player/url";
import { CardFieldsEditor, type CardFieldsValue } from "@/components/players/card-fields-editor";
import type { GetMyPlayer200 } from "@/api/generated/types/GetMyPlayer";
import { useGetMyPlayer, useGetPlayerCareer } from "@/api/generated/hooks/playersHooks";
import { AchievementsGrid } from "@/components/players/achievements-grid";

/** Placeholder de carregamento do hero — imita o formato do `PlayerCard` `full`. */
function CareerHeroSkeleton() {
  return (
    <View className="items-center gap-3">
      <Skeleton className="h-[380px] w-64 rounded-3xl" />
    </View>
  );
}

/** Perfil — usuário logado, carreira real, editor de posições/atributos/skills e sair. */
export default function PerfilScreen() {
  const { t } = useTranslation(["player", "common"]);
  const { user, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const myPlayerQuery = useGetMyPlayer();
  const playerId = myPlayerQuery.data?.id;
  const careerQuery = useGetPlayerCareer(playerId);
  const updateMyPlayer = useUpdateMyPlayer();
  const { pickAndUpload, uploading: uploadingAvatar } = useAvatarUpload();

  // Rascunhos editáveis, re-semeados do valor persistido via o padrão
  // adjust-state-during-render (sem effect): quando a identidade do `data`
  // muda (carga inicial, ou refetch após salvar), reseta os três rascunhos.
  const [affinityDraft, setAffinityDraft] = useState<AffinityMap>({});
  const [attributesDraft, setAttributesDraft] = useState<AttributeMap>(toAttributeMap(null));
  const [skillsDraft, setSkillsDraft] = useState<SkillKey[]>([]);
  const [seededFrom, setSeededFrom] = useState<GetMyPlayer200 | undefined>(undefined);
  if (myPlayerQuery.data !== seededFrom) {
    setSeededFrom(myPlayerQuery.data);
    setAffinityDraft(toAffinityMap(myPlayerQuery.data?.affinity));
    setAttributesDraft(toAttributeMap(myPlayerQuery.data?.attributes));
    setSkillsDraft(toSkillList(myPlayerQuery.data?.skills));
  }

  const savedAffinity = toAffinityMap(myPlayerQuery.data?.affinity);
  const savedAttributes = toAttributeMap(myPlayerQuery.data?.attributes);
  const savedSkills = toSkillList(myPlayerQuery.data?.skills);

  const affinityDirty = !affinityMapsEqual(affinityDraft, savedAffinity);
  const attributesDirty = ATTRIBUTE_KEYS.some((k) => attributesDraft[k] !== savedAttributes[k]);
  const skillsDirty = !skillsEqual(skillsDraft, savedSkills);
  const attributesBalanced = remainingPoints(attributesDraft) === 0;

  const showGoalkeeper = Object.keys(affinityDraft).some(isGoalkeeper);

  const saveAffinity = () => updateMyPlayer.mutateAsync({ affinity: toApiAffinity(affinityDraft) });
  const saveAttributes = () => updateMyPlayer.mutateAsync({ attributes: attributesDraft });
  const saveSkills = () => updateMyPlayer.mutateAsync({ skills: skillsDraft });
  const saveCardFields = (fields: CardFieldsValue) => updateMyPlayer.mutateAsync(fields);

  const appVersion = Constants.expoConfig?.version ?? "—";

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  const handleShare = async () => {
    if (!playerId) return;
    const link = buildPlayerProfileUrl(playerId);
    await Share.share({ message: t("player:career.shareMessage", { link }) });
  };

  const isLoading = myPlayerQuery.isPending;
  const isError = myPlayerQuery.isError;
  const retry = () => {
    if (myPlayerQuery.isError) void myPlayerQuery.refetch();
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

        {!isLoading && !isError && myPlayerQuery.data ? (
          <View className="gap-3">
            <FifaCard player={myPlayerQuery.data} avatarUri={myPlayerQuery.data.avatarUrl} />
            <View className="flex-row gap-3">
              <Button
                testID="profile-avatar-cta"
                className="flex-1"
                variant="secondary"
                onPress={() => void pickAndUpload()}
                loading={uploadingAvatar}
              >
                {t("player:card.photoCta")}
              </Button>
              <Button
                testID="profile-share-cta"
                className="flex-1"
                variant="secondary"
                onPress={() => void handleShare()}
              >
                {t("player:career.shareCta")}
              </Button>
            </View>
          </View>
        ) : null}

        {careerQuery.data ? (
          <AchievementsGrid
            achievements={careerQuery.data.achievements ?? []}
            title={t("player:achievements.title")}
          />
        ) : null}
      </View>

      <Divider />

      {/* Posições — campinho estilo FM */}
      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("player:positions.title")}
        </Text>
        <Text variant="muted" className="text-sm">
          {t("player:positions.hint")}
        </Text>
        <PitchAffinity value={affinityDraft} onChange={setAffinityDraft} />
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

      {/* Atributos — orçamento de pontos */}
      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("player:attributes.title")}
        </Text>
        <Text variant="muted" className="text-sm">
          {t("player:attributes.hint")}
        </Text>
        <AttributeBudget
          value={attributesDraft}
          onChange={setAttributesDraft}
          showGoalkeeper={showGoalkeeper}
        />
        <Button
          testID="profile-save-attributes"
          onPress={() => void saveAttributes()}
          loading={updateMyPlayer.isPending}
          disabled={!attributesDirty || !attributesBalanced}
        >
          {t("player:attributes.save")}
        </Button>
      </View>

      <Divider />

      {/* Skills */}
      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("player:skills.title")}
        </Text>
        <Text variant="muted" className="text-sm">
          {t("player:skills.hint", { max: 5 })}
        </Text>
        <SkillPicker value={skillsDraft} onChange={setSkillsDraft} />
        <Button
          testID="profile-save-skills"
          onPress={() => void saveSkills()}
          loading={updateMyPlayer.isPending}
          disabled={!skillsDirty}
        >
          {t("player:skills.save")}
        </Button>
      </View>

      <Divider />

      {/* Dados da carta */}
      <View className="gap-3">
        <Text variant="display" className="text-lg">
          {t("player:card.title")}
        </Text>
        <CardFieldsEditor
          key={seededFrom?.id ?? "none"}
          initial={{
            dominantFoot: myPlayerQuery.data?.dominantFoot ?? null,
            weakFoot: myPlayerQuery.data?.weakFoot ?? null,
            skillMoves: myPlayerQuery.data?.skillMoves ?? null,
            heightCm: myPlayerQuery.data?.heightCm ?? null,
            weightKg: myPlayerQuery.data?.weightKg ?? null,
            birthYear: myPlayerQuery.data?.birthYear ?? null,
            preferredTeam: myPlayerQuery.data?.preferredTeam ?? null,
            nationality: myPlayerQuery.data?.nationality ?? null,
          }}
          onSave={saveCardFields}
          saving={updateMyPlayer.isPending}
          saveLabel={t("player:card.save")}
        />
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
