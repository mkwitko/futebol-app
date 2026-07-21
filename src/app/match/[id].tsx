import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { AttendanceSection } from "@/components/matches/attendance-section";
import { FinalizeSection } from "@/components/matches/finalize-section";
import { InviteSheet } from "@/components/matches/invite-sheet";
import { JoinRequestsSection } from "@/components/matches/join-requests-section";
import { MatchHeader } from "@/components/matches/match-header";
import { OrganizerActions } from "@/components/matches/organizer-actions";
import { PaymentSection } from "@/components/matches/payment-section";
import { ReputationSection } from "@/components/matches/reputation-section";
import { ResultSection } from "@/components/matches/result-section";
import { StatsSection } from "@/components/matches/stats-section";
import { TeamsSection } from "@/components/matches/teams-section";
import { VotingSection } from "@/components/matches/voting-section";
import { VenueCourts } from "@/components/venues/venue-courts";
import { VenueSummary } from "@/components/venues/venue-summary";
import { ScreenContainer } from "@/components/layout/screen-container";
import { QueryState } from "@/components/shared/query-state";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Toast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/auth/use-auth";
import { useCancelPresence } from "@/hooks/attendance/use-cancel-presence";
import { useConfirmPayment } from "@/hooks/attendance/use-confirm-payment";
import { useConfirmPresence } from "@/hooks/attendance/use-confirm-presence";
import { useMarkPaid } from "@/hooks/attendance/use-mark-paid";
import { useToast } from "@/hooks/common/use-toast";
import { useCancelMatch } from "@/hooks/matches/use-cancel-match";
import { useFinalizeMatch } from "@/hooks/matches/use-finalize-match";
import { useFinishMatch } from "@/hooks/matches/use-finish-match";
import { useRecordResult } from "@/hooks/result/use-record-result";
import { useResult } from "@/hooks/result/use-result";
import { useLogStats } from "@/hooks/stats/use-log-stats";
import { useGenerateTeams } from "@/hooks/teams/use-generate-teams";
import { useTeams } from "@/hooks/teams/use-teams";
import { useCastVote } from "@/hooks/votes/use-cast-vote";
import { isConflictError, isForbiddenError } from "@/lib/api/errors";
import { useGetMatch } from "@/api/generated/hooks/matchesHooks";
import { useGetGroup } from "@/api/generated/hooks/groupsHooks";
import { useListAttendance } from "@/api/generated/hooks/attendanceHooks";
import { useListStats } from "@/api/generated/hooks/statsHooks";
import { useGetVoteTally } from "@/api/generated/hooks/votesHooks";
import type { CastVote200CategoryEnumKey } from "@/api/generated/types/CastVote";
import type { LogStatsMutationRequest } from "@/api/generated/types/LogStats";
import type { RecordResultMutationRequest } from "@/api/generated/types/RecordResult";

type SectionKey = "list" | "payment" | "teams" | "result" | "stats" | "voting";

/** Detalhe da pelada — lista/fila, pagamento (PIX) e times, além das ações do organizador. */
export default function MatchDetailScreen() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
  const router = useRouter();
  const { t } = useTranslation(["matches", "common"]);
  const { user } = useAuth();
  const toast = useToast();

  const [section, setSection] = useState<SectionKey>("list");
  const [lastIsPostGame, setLastIsPostGame] = useState<boolean | null>(null);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const [votingWindowClosed, setVotingWindowClosed] = useState(false);

  const matchQuery = useGetMatch(id);
  const attendanceQuery = useListAttendance(id);
  const teamsQuery = useTeams(id);

  const match = matchQuery.data;
  const isPostGame = match?.status === "finished" || match?.status === "closed";

  // Grupo da pelada — usado pra saber se sou o dono e se o grupo pede
  // aprovação de entrada (`joinPolicy=request`), o que habilita o inbox de
  // pedidos abaixo da lista de presença.
  const groupQuery = useGetGroup(match?.groupId, { query: { enabled: !!match?.groupId } });
  const isOwner = !!groupQuery.data && groupQuery.data.ownerId === user?.id;
  const showJoinRequests = isOwner && groupQuery.data?.joinPolicy === "request" && !isPostGame;

  const resultQuery = useResult(id, isPostGame);
  const statsQuery = useListStats(id, { query: { enabled: isPostGame } });
  const voteTallyQuery = useGetVoteTally(id, { query: { enabled: isPostGame } });

  const confirmPresence = useConfirmPresence(id);
  const cancelPresence = useCancelPresence(id);
  const markPaid = useMarkPaid(id);
  const confirmPayment = useConfirmPayment(id);
  const generateTeams = useGenerateTeams(id);
  const finishMatch = useFinishMatch(id);
  const cancelMatch = useCancelMatch(id);
  const recordResult = useRecordResult(id);
  const logStats = useLogStats(id);
  const castVote = useCastVote(id);
  const finalizeMatch = useFinalizeMatch(id);

  useEffect(() => {
    if (created === "1") toast.show(t("matches:detail.createdToast"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na chegada via redirect do create-match.
  }, [created]);

  // Troca o grupo de abas visível conforme o status transiciona entre
  // pré-jogo (aberta/lotada) e pós-jogo (finalizada/fechada) — sem isso, o
  // usuário poderia ficar preso numa aba que sumiu (ex.: "Times" depois de
  // `finish-match`). Ajuste durante o render (não em `useEffect`) — padrão
  // React de "resetar estado quando uma prop muda" (aqui, `isPostGame`).
  if (match && isPostGame !== lastIsPostGame) {
    setLastIsPostGame(isPostGame);
    setSection(isPostGame ? "result" : "list");
  }

  const confirmedCount = attendanceQuery.data?.filter((item) => item.status === "confirmed").length ?? 0;
  const confirmedAttendance = attendanceQuery.data?.filter((item) => item.status === "confirmed") ?? [];
  const selfPlayerId = confirmedAttendance.find((item) => item.player.userId === user?.id)?.player.id ?? null;

  const onForbidden = () => toast.show(t("matches:detail.actions.forbidden"), "danger");

  const handleConfirmMyPresence = async () => {
    try {
      await confirmPresence.mutateAsync();
      toast.show(t("matches:detail.list.confirmPresenceSuccess"));
    } catch (error) {
      if (isForbiddenError(error)) onForbidden();
      else toast.show(t("matches:detail.list.confirmPresenceError"), "danger");
    }
  };

  const handleRemove = async (attId: string) => {
    try {
      await cancelPresence.mutateAsync(attId);
      toast.show(t("matches:detail.list.removeSuccess"));
    } catch (error) {
      if (isForbiddenError(error)) onForbidden();
      else toast.show(t("matches:detail.list.removeError"), "danger");
    }
  };

  const handleConfirmPayment = async (attId: string, paid: boolean) => {
    try {
      await confirmPayment.mutateAsync(attId, paid);
      toast.show(t("matches:detail.payment.confirmSuccess"));
    } catch (error) {
      if (isForbiddenError(error)) onForbidden();
      else toast.show(t("matches:detail.payment.confirmError"), "danger");
    }
  };

  const handleMarkPaid = async (attId: string) => {
    try {
      await markPaid.mutateAsync(attId);
      toast.show(t("matches:detail.payment.markPaidSuccess"));
    } catch {
      toast.show(t("matches:detail.payment.markPaidError"), "danger");
    }
  };

  const handleGenerateTeams = async (mode: "balanced" | "random") => {
    setTeamsError(null);
    try {
      await generateTeams.mutateAsync(mode);
    } catch {
      setTeamsError(t("matches:detail.teams.generateError"));
    }
  };

  const handleFinish = async () => {
    try {
      await finishMatch.mutateAsync();
      toast.show(t("matches:detail.actions.finishSuccess"));
    } catch (error) {
      if (isForbiddenError(error)) onForbidden();
      else toast.show(t("matches:detail.actions.finishError"), "danger");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMatch.mutateAsync();
      toast.show(t("matches:detail.actions.cancelSuccess"));
    } catch (error) {
      if (isForbiddenError(error)) onForbidden();
      else toast.show(t("matches:detail.actions.cancelError"), "danger");
    }
  };

  const handleRecordResult = async (data: RecordResultMutationRequest) => {
    setResultError(null);
    try {
      await recordResult.mutateAsync(data);
      toast.show(t("matches:detail.result.submitSuccess"));
    } catch (error) {
      if (isForbiddenError(error)) onForbidden();
      else setResultError(t("matches:detail.result.submitError"));
    }
  };

  const handleLogStats = async (data: LogStatsMutationRequest) => {
    setStatsError(null);
    try {
      await logStats.mutateAsync(data);
      toast.show(t("matches:detail.stats.submitSuccess"));
    } catch (error) {
      if (isForbiddenError(error)) onForbidden();
      else setStatsError(t("matches:detail.stats.submitError"));
    }
  };

  const handleVote = async (category: CastVote200CategoryEnumKey, votedPlayerId: string) => {
    try {
      await castVote.mutateAsync({ category, votedPlayerId });
      setVotingWindowClosed(false);
    } catch (error) {
      if (isConflictError(error)) setVotingWindowClosed(true);
      else if (isForbiddenError(error)) onForbidden();
      else toast.show(t("matches:detail.voting.error"), "danger");
      throw error;
    }
  };

  const handleFinalize = async () => {
    setFinalizeError(null);
    try {
      await finalizeMatch.mutateAsync();
      toast.show(t("matches:detail.finalize.success"));
    } catch (error) {
      if (isForbiddenError(error)) onForbidden();
      else setFinalizeError(t("matches:detail.finalize.error"));
    }
  };

  const canFinish = match?.status === "open" || match?.status === "full";
  const canCancel = canFinish;

  return (
    <ScreenContainer
      className="gap-6"
      // Ações do organizador ficam fixas no rodapé (sempre visíveis, não rolam
      // com o conteúdo) — só quando a pelada já carregou.
      footer={
        match ? (
          !isPostGame ? (
            <OrganizerActions
              onInvite={() => setInviteVisible(true)}
              onEdit={() => router.push({ pathname: "/match/[id]/edit", params: { id } })}
              onFinish={() => void handleFinish()}
              onCancel={() => void handleCancel()}
              finishing={finishMatch.isPending}
              cancelling={cancelMatch.isPending}
              canEdit={isOwner}
              canFinish={canFinish}
              canCancel={canCancel}
            />
          ) : (
            <FinalizeSection
              status={match.status}
              hasResult={!!resultQuery.data}
              onFinalize={() => void handleFinalize()}
              finalizing={finalizeMatch.isPending}
              error={finalizeError}
            />
          )
        ) : null
      }
    >
      <ScreenHeader
        title={match?.location ?? t("matches:detail.loadingTitle")}
        onBack={() => router.back()}
      />

      {toast.message ? (
        <Toast variant={toast.variant} onDismiss={toast.dismiss}>
          {toast.message}
        </Toast>
      ) : null}

      <QueryState
        isPending={matchQuery.isPending}
        isError={matchQuery.isError}
        isEmpty={false}
        errorMessage={t("matches:detail.loadError")}
        retryLabel={t("common:actions.retry")}
        onRetry={() => void matchQuery.refetch()}
        emptyTitle=""
      >
        {match ? (
          <View className="gap-6">
            <MatchHeader match={match} confirmedCount={confirmedCount} />

            {match.venueId ? (
              <>
                <VenueSummary venueId={match.venueId} />
                <VenueCourts venueId={match.venueId} />
              </>
            ) : null}

            <SegmentedControl
              value={section}
              onChange={setSection}
              options={
                isPostGame
                  ? [
                      { label: t("matches:detail.tabs.result"), value: "result" },
                      { label: t("matches:detail.tabs.stats"), value: "stats" },
                      { label: t("matches:detail.tabs.voting"), value: "voting" },
                    ]
                  : [
                      { label: t("matches:detail.tabs.list"), value: "list" },
                      { label: t("matches:detail.tabs.payment"), value: "payment" },
                      { label: t("matches:detail.tabs.teams"), value: "teams" },
                    ]
              }
            />

            <QueryState
              isPending={attendanceQuery.isPending}
              isError={attendanceQuery.isError}
              isEmpty={false}
              errorMessage={t("matches:detail.list.loadError")}
              retryLabel={t("common:actions.retry")}
              onRetry={() => void attendanceQuery.refetch()}
              emptyTitle=""
            >
              {section === "list" ? (
                <View className="gap-6">
                  <AttendanceSection
                    attendance={attendanceQuery.data ?? []}
                    onConfirmMyPresence={handleConfirmMyPresence}
                    confirmingPresence={confirmPresence.isPending}
                    cancellingPresence={cancelPresence.isPending}
                    currentUserId={user?.id}
                    onRemove={handleRemove}
                    onInvite={() => setInviteVisible(true)}
                    onOpenPlayer={(player) =>
                      router.push({ pathname: "/player/[playerId]", params: { playerId: player.id, name: player.name } })
                    }
                  />
                  {showJoinRequests ? <JoinRequestsSection matchId={id} /> : null}
                </View>
              ) : null}

              {section === "payment" ? (
                <PaymentSection
                  pixKey={match.pixKey}
                  attendance={attendanceQuery.data ?? []}
                  currentUserId={user?.id}
                  onCopiedPixKey={() => toast.show(t("matches:detail.payment.copiedToast"))}
                  onConfirmPayment={handleConfirmPayment}
                  onMarkPaid={handleMarkPaid}
                />
              ) : null}

              {section === "teams" ? (
                <TeamsSection
                  teams={teamsQuery.data}
                  isLoading={teamsQuery.isPending}
                  onGenerate={(mode) => void handleGenerateTeams(mode)}
                  generating={generateTeams.isPending}
                  error={teamsError}
                />
              ) : null}

              {section === "result" ? (
                <ResultSection
                  teams={teamsQuery.data}
                  result={resultQuery.data}
                  isLoadingResult={resultQuery.isPending}
                  onSubmit={(data) => void handleRecordResult(data)}
                  submitting={recordResult.isPending}
                  error={resultError}
                />
              ) : null}

              {section === "stats" ? (
                <StatsSection
                  confirmed={confirmedAttendance}
                  stats={statsQuery.data ?? []}
                  isLoadingStats={statsQuery.isPending}
                  onSubmit={(data) => void handleLogStats(data)}
                  submitting={logStats.isPending}
                  error={statsError}
                  readOnly={match.status === "closed"}
                />
              ) : null}

              {section === "voting" ? (
                <View className="gap-6">
                  <VotingSection
                    confirmed={confirmedAttendance.map((item) => ({
                      playerId: item.player.id,
                      name: item.player.name,
                    }))}
                    isParticipant={!!selfPlayerId}
                    selfPlayerId={selfPlayerId}
                    tally={voteTallyQuery.data}
                    isLoadingTally={voteTallyQuery.isPending}
                    onVote={handleVote}
                    windowClosed={votingWindowClosed}
                  />

                  <ReputationSection
                    matchId={id}
                    teammates={confirmedAttendance
                      .filter((item) => item.player.id !== selfPlayerId)
                      .map((item) => ({ id: item.player.id, name: item.player.name }))}
                    open={!votingWindowClosed}
                  />
                </View>
              ) : null}
            </QueryState>

            <InviteSheet
              visible={inviteVisible}
              onClose={() => setInviteVisible(false)}
              match={match}
              onCopied={() => toast.show(t("matches:detail.invite.copiedToast"))}
              onError={() => toast.show(t("matches:detail.invite.error"), "danger")}
            />
          </View>
        ) : null}
      </QueryState>
    </ScreenContainer>
  );
}
