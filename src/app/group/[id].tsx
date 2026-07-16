import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { ScreenContainer } from "@/components/layout/screen-container";
import { GroupFeeCard } from "@/components/groups/group-fee-card";
import { MatchRow } from "@/components/matches/match-row";
import { MemberSheet } from "@/components/members/member-sheet";
import { PlayerCard } from "@/components/players/player-card";
import { QueryState } from "@/components/shared/query-state";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/common/use-toast";
import { useUpdateGroup } from "@/hooks/groups/use-update-group";
import { useGetGroup } from "@/api/generated/hooks/groupsHooks";
import { useListMembers } from "@/api/generated/hooks/membersHooks";
import { useListMatches } from "@/api/generated/hooks/matchesHooks";
import type { ListMembers200 } from "@/api/generated/types/ListMembers";

type MemberSheetState = { visible: boolean; member?: ListMembers200[number] };

/** Detalhe do grupo — elenco (jogadores) + peladas (partidas) marcadas. */
export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation(["groups", "common"]);
  const toast = useToast();

  const [memberSheet, setMemberSheet] = useState<MemberSheetState>({ visible: false });

  const groupQuery = useGetGroup(id);
  const membersQuery = useListMembers(id);
  const matchesQuery = useListMatches(id);
  const updateGroup = useUpdateGroup(id);

  const handleSaveFee = async (monthlyFeeCents: number | null) => {
    await updateGroup.mutateAsync({ monthlyFeeCents });
    toast.show(t("groups:detail.feeCardSaveSuccess"));
  };

  return (
    <ScreenContainer className="gap-6">
      <ScreenHeader
        title={groupQuery.data?.name ?? t("groups:detail.loadingTitle")}
        onBack={() => router.back()}
        trailing={
          <Button
            testID="group-mensalidades-cta"
            size="sm"
            variant="secondary"
            onPress={() => router.push({ pathname: "/group/[id]/mensalidades", params: { id } })}
          >
            {t("groups:detail.mensalidadesCta")}
          </Button>
        }
      />

      {toast.message ? (
        <Toast variant="success" onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <GroupFeeCard
        monthlyFeeCents={groupQuery.data?.monthlyFeeCents}
        onSave={handleSaveFee}
        saving={updateGroup.isPending}
      />

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="display" className="text-lg">
            {t("groups:detail.rosterTitle")}
          </Text>
          <Button size="sm" variant="secondary" onPress={() => setMemberSheet({ visible: true })}>
            {t("groups:detail.addMemberCta")}
          </Button>
        </View>

        {(membersQuery.data?.length ?? 0) > 0 ? (
          <Text variant="muted" className="text-xs">
            {t("groups:detail.rosterHint")}
          </Text>
        ) : null}

        <QueryState
          isPending={membersQuery.isPending}
          isError={membersQuery.isError}
          isEmpty={(membersQuery.data?.length ?? 0) === 0}
          errorMessage={t("groups:detail.rosterLoadError")}
          retryLabel={t("common:actions.retry")}
          onRetry={() => void membersQuery.refetch()}
          emptyTitle={t("groups:detail.rosterEmptyTitle")}
          emptyDescription={t("groups:detail.rosterEmptyDescription")}
          emptyActionLabel={t("groups:detail.addMemberCta")}
          onEmptyAction={() => setMemberSheet({ visible: true })}
        >
          <View className="gap-2">
            {membersQuery.data?.map((member) => (
              <PlayerCard
                key={member.id}
                variant="compact"
                name={member.player.name}
                position={member.primaryPos}
                overall={member.seedOverall[member.primaryPos] ?? 0}
                onPress={() =>
                  router.push({
                    pathname: "/player/[playerId]",
                    params: { playerId: member.player.id, name: member.player.name },
                  })
                }
                onLongPress={() => setMemberSheet({ visible: true, member })}
              />
            ))}
          </View>
        </QueryState>
      </View>

      <Divider />

      <View className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="display" className="text-lg">
            {t("groups:detail.matchesTitle")}
          </Text>
          <Button
            size="sm"
            onPress={() => router.push({ pathname: "/group/[id]/create-match", params: { id } })}
          >
            {t("groups:detail.newMatchCta")}
          </Button>
        </View>

        <QueryState
          isPending={matchesQuery.isPending}
          isError={matchesQuery.isError}
          isEmpty={(matchesQuery.data?.length ?? 0) === 0}
          errorMessage={t("groups:detail.matchesLoadError")}
          retryLabel={t("common:actions.retry")}
          onRetry={() => void matchesQuery.refetch()}
          emptyTitle={t("groups:detail.matchesEmptyTitle")}
          emptyDescription={t("groups:detail.matchesEmptyDescription")}
        >
          <View className="gap-2">
            {matchesQuery.data?.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                onPress={() => router.push({ pathname: "/match/[id]", params: { id: match.id } })}
              />
            ))}
          </View>
        </QueryState>
      </View>

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
    </ScreenContainer>
  );
}
