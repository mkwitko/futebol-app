import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import { AttendanceSection } from "@/components/matches/attendance-section";
import { InviteSheet } from "@/components/matches/invite-sheet";
import { MatchHeader } from "@/components/matches/match-header";
import { OrganizerActions } from "@/components/matches/organizer-actions";
import { PaymentSection } from "@/components/matches/payment-section";
import { TeamsSection } from "@/components/matches/teams-section";
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
import { useFinishMatch } from "@/hooks/matches/use-finish-match";
import { useGenerateTeams } from "@/hooks/teams/use-generate-teams";
import { useTeams } from "@/hooks/teams/use-teams";
import { isForbiddenError } from "@/lib/api/errors";
import { useGetMatch } from "@/api/generated/hooks/matchesHooks";
import { useListAttendance } from "@/api/generated/hooks/attendanceHooks";

type SectionKey = "list" | "payment" | "teams";

/** Detalhe da pelada — lista/fila, pagamento (PIX) e times, além das ações do organizador. */
export default function MatchDetailScreen() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
  const router = useRouter();
  const { t } = useTranslation(["matches", "common"]);
  const { user } = useAuth();
  const toast = useToast();

  const [section, setSection] = useState<SectionKey>("list");
  const [inviteVisible, setInviteVisible] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const matchQuery = useGetMatch(id);
  const attendanceQuery = useListAttendance(id);
  const teamsQuery = useTeams(id);

  const confirmPresence = useConfirmPresence(id);
  const cancelPresence = useCancelPresence(id);
  const markPaid = useMarkPaid(id);
  const confirmPayment = useConfirmPayment(id);
  const generateTeams = useGenerateTeams(id);
  const finishMatch = useFinishMatch(id);
  const cancelMatch = useCancelMatch(id);

  useEffect(() => {
    if (created === "1") toast.show(t("matches:detail.createdToast"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na chegada via redirect do create-match.
  }, [created]);

  const confirmedCount = attendanceQuery.data?.filter((item) => item.status === "confirmed").length ?? 0;

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

  const handleGenerateTeams = async () => {
    setTeamsError(null);
    try {
      await generateTeams.mutateAsync();
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

  const match = matchQuery.data;
  const canFinish = !!match && match.status !== "finished" && match.status !== "cancelled";
  const canCancel = canFinish;

  return (
    <ScreenContainer className="gap-6">
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

            <SegmentedControl
              value={section}
              onChange={setSection}
              options={[
                { label: t("matches:detail.tabs.list"), value: "list" },
                { label: t("matches:detail.tabs.payment"), value: "payment" },
                { label: t("matches:detail.tabs.teams"), value: "teams" },
              ]}
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
                <AttendanceSection
                  attendance={attendanceQuery.data ?? []}
                  onConfirmMyPresence={handleConfirmMyPresence}
                  confirmingPresence={confirmPresence.isPending}
                  onRemove={handleRemove}
                  onInvite={() => setInviteVisible(true)}
                />
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
                  onGenerate={() => void handleGenerateTeams()}
                  generating={generateTeams.isPending}
                  error={teamsError}
                />
              ) : null}
            </QueryState>

            <OrganizerActions
              onInvite={() => setInviteVisible(true)}
              onFinish={() => void handleFinish()}
              onCancel={() => void handleCancel()}
              finishing={finishMatch.isPending}
              cancelling={cancelMatch.isPending}
              canFinish={canFinish}
              canCancel={canCancel}
            />

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
