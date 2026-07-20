import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { GroupSettingsSheet } from "@/components/groups/group-settings-sheet";
import { MensalidadesContent } from "@/components/groups/mensalidades-content";
import { NextMatchCard } from "@/components/groups/next-match-card";
import { MatchRow } from "@/components/matches/match-row";
import { MemberSheet } from "@/components/members/member-sheet";
import { QueryState } from "@/components/shared/query-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListRow } from "@/components/ui/list-row";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/auth/use-auth";
import { useConfirmPresence } from "@/hooks/attendance/use-confirm-presence";
import { useToast } from "@/hooks/common/use-toast";
import { useUpdateGroup } from "@/hooks/groups/use-update-group";
import type { JoinPolicy } from "@/components/groups/group-settings-sheet";
import { isForbiddenError } from "@/lib/api/errors";
import { colors } from "@/lib/theme";
import { positionLabel } from "@/lib/player/position";
import { useGetGroup, useGetGroupRanking } from "@/api/generated/hooks/groupsHooks";
import { RankingSection } from "@/components/groups/ranking-section";
import { useListMembers } from "@/api/generated/hooks/membersHooks";
import { useListMatches } from "@/api/generated/hooks/matchesHooks";
import { useListAttendance } from "@/api/generated/hooks/attendanceHooks";
import type { ListMembers200 } from "@/api/generated/types/ListMembers";

type HubTab = "peladas" | "jogadores" | "ranking" | "mensalidades";
type MemberSheetState = { visible: boolean; member?: ListMembers200[number] };

/**
 * Hub do grupo (Task 7) — substitui a antiga tela "elenco + peladas" por um
 * card "PRÓXIMA" (a pelada futura mais próxima, com ações rápidas) seguido
 * de abas em memória (Peladas / Jogadores / Mensalidades, sem novas rotas)
 * que reaproveitam os componentes já existentes de cada domínio.
 */
export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation(["groups", "matches", "common"]);
  const toast = useToast();
  const { user } = useAuth();

  const [tab, setTab] = useState<HubTab>("peladas");
  const [memberSheet, setMemberSheet] = useState<MemberSheetState>({ visible: false });
  const [settingsVisible, setSettingsVisible] = useState(false);

  const groupQuery = useGetGroup(id);
  const membersQuery = useListMembers(id);
  const matchesQuery = useListMatches(id);
  const rankingQuery = useGetGroupRanking(id, { query: { enabled: tab === "ranking" } });
  const updateGroup = useUpdateGroup(id);

  const nextMatch = useMemo(() => {
    const now = new Date().getTime();
    return (matchesQuery.data ?? [])
      .filter((match) => match.status !== "cancelled" && new Date(match.datetime).getTime() > now)
      .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())[0];
  }, [matchesQuery.data]);

  const nextMatchAttendanceQuery = useListAttendance(nextMatch?.id);
  const nextMatchConfirmedCount = nextMatchAttendanceQuery.data?.filter(
    (item) => item.status === "confirmed",
  ).length;

  const confirmPresence = useConfirmPresence(nextMatch?.id ?? "");

  const upcomingMatches = useMemo(
    () => [...(matchesQuery.data ?? [])].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()),
    [matchesQuery.data],
  );

  const isOwner = !!groupQuery.data && groupQuery.data.ownerId === user?.id;

  const handleSaveFee = async (monthlyFeeCents: number | null) => {
    await updateGroup.mutateAsync({ monthlyFeeCents });
    toast.show(t("groups:hub.settingsFeeSaveSuccess"));
  };

  const handleSavePublic = async (next: { isPublic?: boolean; joinPolicy?: JoinPolicy }) => {
    try {
      await updateGroup.mutateAsync(next);
      toast.show(t("groups:hub.settingsPublicSaveSuccess"));
    } catch {
      toast.show(t("groups:hub.settingsPublicSaveError"), "danger");
    }
  };

  const handleConfirmMyPresence = async () => {
    if (!nextMatch) return;
    try {
      await confirmPresence.mutateAsync();
      toast.show(t("groups:hub.confirmPresenceSuccess"));
    } catch (error) {
      toast.show(
        isForbiddenError(error) ? t("matches:detail.actions.forbidden") : t("groups:hub.confirmPresenceError"),
        "danger",
      );
    }
  };

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader
        title={groupQuery.data?.name ?? t("groups:detail.loadingTitle")}
        onBack={() => router.back()}
        trailing={
          <Pressable
            testID="group-settings-cta"
            accessibilityRole="button"
            accessibilityLabel={t("groups:hub.settingsCta")}
            hitSlop={8}
            onPress={() => setSettingsVisible(true)}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-up"
          >
            <Ionicons name="settings-outline" size={22} color={colors.ink} />
          </Pressable>
        }
      />

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <NextMatchCard
        match={nextMatch}
        confirmedCount={nextMatchConfirmedCount}
        confirmingPresence={confirmPresence.isPending}
        onConfirmPresence={() => void handleConfirmMyPresence()}
        onOpenMatch={() => nextMatch && router.push({ pathname: "/match/[id]", params: { id: nextMatch.id } })}
        onCreateMatch={() => router.push({ pathname: "/group/[id]/create-match", params: { id } })}
      />

      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { label: t("groups:hub.tabs.peladas"), value: "peladas" },
          { label: t("groups:hub.tabs.jogadores"), value: "jogadores" },
          { label: t("groups:hub.tabs.ranking"), value: "ranking" },
          { label: t("groups:hub.tabs.mensalidades"), value: "mensalidades" },
        ]}
      />

      <Button
        testID="hub-new-match-cta"
        variant="secondary"
        onPress={() => router.push({ pathname: "/group/[id]/create-match", params: { id } })}
      >
        {t("groups:hub.newMatchCta")}
      </Button>

      {tab === "peladas" ? (
        <QueryState
          isPending={matchesQuery.isPending}
          isError={matchesQuery.isError}
          isEmpty={(matchesQuery.data?.length ?? 0) === 0}
          errorMessage={t("groups:hub.peladasLoadError")}
          retryLabel={t("common:actions.retry")}
          onRetry={() => void matchesQuery.refetch()}
          emptyTitle={t("groups:hub.peladasEmptyTitle")}
          emptyDescription={t("groups:hub.peladasEmptyDescription")}
        >
          <View className="gap-2">
            {upcomingMatches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                onPress={() => router.push({ pathname: "/match/[id]", params: { id: match.id } })}
              />
            ))}
          </View>
        </QueryState>
      ) : null}

      {tab === "jogadores" ? (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text variant="muted" className="text-xs">
              {t("groups:detail.rosterHint")}
            </Text>
            <Button
              testID="hub-add-member-cta"
              size="sm"
              variant="secondary"
              onPress={() => setMemberSheet({ visible: true })}
            >
              {t("groups:hub.jogadoresAddCta")}
            </Button>
          </View>

          <QueryState
            isPending={membersQuery.isPending}
            isError={membersQuery.isError}
            isEmpty={(membersQuery.data?.length ?? 0) === 0}
            errorMessage={t("groups:hub.jogadoresLoadError")}
            retryLabel={t("common:actions.retry")}
            onRetry={() => void membersQuery.refetch()}
            emptyTitle={t("groups:hub.jogadoresEmptyTitle")}
            emptyDescription={t("groups:hub.jogadoresEmptyDescription")}
            emptyActionLabel={t("groups:hub.jogadoresAddCta")}
            onEmptyAction={() => setMemberSheet({ visible: true })}
          >
            <View className="gap-2">
              {membersQuery.data?.map((member) => (
                <ListRow
                  key={member.id}
                  title={member.player.name}
                  subtitle={member.primaryPos ? positionLabel(member.primaryPos) : t("groups:hub.jogadoresNoPosition")}
                  onPress={() =>
                    router.push({
                      pathname: "/player/[playerId]",
                      params: { playerId: member.player.id, name: member.player.name },
                    })
                  }
                  onLongPress={() => setMemberSheet({ visible: true, member })}
                  trailing={
                    <Badge variant={member.billingMode === "mensalista" ? "primary" : "neutral"}>
                      {t(`groups:member.billingMode.${member.billingMode}`)}
                    </Badge>
                  }
                />
              ))}
            </View>
          </QueryState>
        </View>
      ) : null}

      {tab === "ranking" ? (
        <QueryState
          isPending={rankingQuery.isPending}
          isError={rankingQuery.isError}
          isEmpty={
            !!rankingQuery.data &&
            rankingQuery.data.points.length === 0 &&
            rankingQuery.data.goals.length === 0
          }
          errorMessage={t("groups:hub.rankingLoadError")}
          retryLabel={t("common:actions.retry")}
          onRetry={() => void rankingQuery.refetch()}
          emptyTitle={t("groups:hub.rankingEmptyTitle")}
          emptyDescription={t("groups:hub.rankingEmptyDescription")}
        >
          {rankingQuery.data ? <RankingSection ranking={rankingQuery.data} groupId={id} /> : null}
        </QueryState>
      ) : null}

      {tab === "mensalidades" ? <MensalidadesContent groupId={id} /> : null}

      <MemberSheet
        visible={memberSheet.visible}
        groupId={id}
        member={memberSheet.member}
        groupMonthlyFeeCents={groupQuery.data?.monthlyFeeCents}
        onClose={() => setMemberSheet({ visible: false })}
        onSaved={(mode) => {
          setMemberSheet({ visible: false });
          toast.show(t(mode === "create" ? "groups:member.addSuccess" : "groups:member.editSuccess"));
        }}
      />

      <GroupSettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        groupName={groupQuery.data?.name}
        monthlyFeeCents={groupQuery.data?.monthlyFeeCents}
        onSaveFee={handleSaveFee}
        savingFee={updateGroup.isPending}
        isOwner={isOwner}
        isPublic={groupQuery.data?.isPublic}
        joinPolicy={groupQuery.data?.joinPolicy}
        onSavePublic={handleSavePublic}
        savingPublic={updateGroup.isPending}
      />
    </ScreenContainer>
  );
}
